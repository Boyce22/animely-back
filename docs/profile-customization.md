# Profile Customization — Referência Técnica para o Frontend

## Visão Geral

O sistema de customização de perfil permite que o usuário componha livremente sua página de perfil arrastando e redimensionando widgets em um grid. O layout é um JSON armazenado como `publishedLayout` (publicado e visível para outros) e `draftLayout` (rascunho em edição). O fluxo é: **editar draft → publicar**.

---

## Endpoints

Base: `/api/users`

| Método | URL | Auth | Descrição |
|--------|-----|------|-----------|
| `GET` | `/me/profile-customization` | Bearer | Retorna draft + publicado do próprio usuário |
| `PUT` | `/me/profile-customization/draft` | Bearer | Salva (sobrescreve) o draft completo |
| `POST` | `/me/profile-customization/publish` | Bearer | Promove o draft para publicado |
| `DELETE` | `/me/profile-customization/draft` | Bearer | Descarta o draft (restaura último publicado) |
| `PATCH` | `/me/profile-customization` | Bearer | Liga/desliga a customização (`isEnabled`) |
| `GET` | `/:id/profile-customization` | Bearer | Retorna o layout publicado de outro usuário |

---

## Respostas

### `GET /me/profile-customization`

```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "publishedLayout": { /* ProfileLayoutJson */ },
    "draftLayout": { /* ProfileLayoutJson | undefined */ },
    "schemaVersion": 1,
    "isEnabled": true,
    "publishedAt": "2026-04-30T00:00:00.000Z",
    "createdAt": "2026-04-30T00:00:00.000Z",
    "updatedAt": "2026-04-30T00:00:00.000Z"
  }
}
```

> Se o usuário nunca salvou um layout, `id` vem como `""` e `publishedLayout` é o layout padrão gerado pelo backend. `draftLayout` vem `undefined`.

### `GET /:id/profile-customization`

```json
{
  "data": {
    "publishedLayout": { /* ProfileLayoutJson */ },
    "isEnabled": true,
    "publishedAt": "2026-04-30T00:00:00.000Z"
  }
}
```

> Retorna 404 se o perfil do usuário for privado e o visualizador não for o próprio dono.

### `PUT /me/profile-customization/draft`

**Body:** objeto `ProfileLayoutJson` completo (ver schema abaixo).

**Response:** mesmo shape de `GET /me/profile-customization`.

### `POST /me/profile-customization/publish`

Sem body. Retorna 409 se não houver draft salvo.

### `PATCH /me/profile-customization`

```json
{ "isEnabled": true }
```

---

## Schema do Layout (`ProfileLayoutJson`)

```ts
interface ProfileLayoutJson {
  version: number;       // int >= 1. Versão atual: 2
  grid: GridConfig;
  theme: GlobalTheme;
  widgets: ProfileWidget[]; // máx. 50 widgets
}
```

### `GridConfig`

Configuração do grid react-grid-layout (ou equivalente).

```ts
interface GridConfig {
  cols: number;      // int 1–24. Recomendado: 12
  rowHeight: number; // int 10–200 (px). Recomendado: 40
  gap: number;       // int 0–64 (px). Recomendado: 8
}
```

---

### `GlobalTheme`

```ts
interface GlobalTheme {
  fontFamily?: string;        // máx. 200 chars. Ex: "'Noto Sans JP', sans-serif"
  primaryColor?: string;      // máx. 100 chars. Qualquer valor CSS de cor
  secondaryColor?: string;
  accentColor?: string;
  textColor?: string;
  linkColor?: string;
  cardStyle?: 'flat' | 'glass' | 'bordered' | 'shadow' | 'neon';
  cursorStyle?: string;       // máx. 200 chars. Ex: URL de cursor .cur/.png
  customCss?: string;         // máx. 10.000 chars. CSS raw injetado no perfil
  background: ProfileBackground;
  overlay?: ProfileOverlay;
  backgroundMusic?: string;   // URL válida de áudio
}
```

#### `ProfileBackground`

```ts
type BackgroundType = 'solid' | 'gradient' | 'image' | 'video' | 'pattern';

interface ProfileBackground {
  type: BackgroundType;
  // solid
  color?: string;           // ex: "#0f0f0f", "rgba(0,0,0,0.8)"
  // gradient
  gradient?: string;        // CSS gradient. Ex: "linear-gradient(135deg, #1a1a2e, #7c3aed)"
  // image / video
  imageUrl?: string;        // URL válida
  videoUrl?: string;        // URL válida
  // pattern
  patternType?: string;     // nome do padrão (definido pelo front). Ex: "dots", "grid", "waves"
  patternColor?: string;
  patternOpacity?: number;  // 0–1
  // efeitos globais
  blur?: number;            // 0–100 (px)
  brightness?: number;      // 0–200 (%). 100 = normal
  overlay?: string;         // cor com opacidade. Ex: "rgba(0,0,0,0.4)"
}
```

#### `ProfileOverlay`

Efeito de partículas animadas sobre todo o perfil.

```ts
interface ProfileOverlay {
  type: 'none' | 'particles' | 'hearts' | 'stars' | 'bubbles' | 'snow' | 'sakura';
  color?: string;    // cor das partículas
  opacity?: number;  // 0–1
  density?: number;  // int 1–500. Quantidade de partículas
  speed?: number;    // 0–10. Velocidade da animação
}
```

---

### `ProfileWidget`

```ts
interface ProfileWidget {
  id: string;          // string única no array. 1–100 chars. Gerar com nanoid/uuid no front
  type: WidgetType;
  title?: string;      // máx. 100 chars. Título exibido no header do widget
  visible: boolean;    // false = widget existe mas não é renderizado
  locked?: boolean;    // true = não pode ser arrastado/redimensionado pelo usuário
  position: WidgetPosition;
  style?: WidgetStyle;
  config: Record<string, unknown>; // dados específicos do tipo (ver tabela abaixo)
}
```

#### `WidgetPosition`

Compatível com o formato de layout do **react-grid-layout**.

```ts
interface WidgetPosition {
  x: number;    // int >= 0. Coluna inicial (0-based)
  y: number;    // int >= 0. Linha inicial
  w: number;    // int >= 1. Largura em colunas
  h: number;    // int >= 1. Altura em linhas (rowHeight * h = px)
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}
```

#### `WidgetStyle`

Todos os campos são CSS aplicados diretamente no elemento do widget.

```ts
interface WidgetStyle {
  background?: string;          // máx. 500. CSS color ou gradient
  backgroundImage?: string;     // URL válida
  backgroundSize?: string;      // máx. 100. Ex: "cover", "contain"
  backgroundPosition?: string;  // máx. 100. Ex: "center"
  borderRadius?: string;        // máx. 100. Ex: "12px", "50%"
  border?: string;              // máx. 200. Ex: "2px solid #7c3aed"
  boxShadow?: string;           // máx. 300. Ex: "0 4px 24px rgba(0,0,0,0.5)"
  opacity?: number;             // 0–1
  padding?: string;             // máx. 100. Ex: "16px", "8px 16px"
  color?: string;               // máx. 100. Cor do texto
  fontSize?: string;            // máx. 50. Ex: "14px", "1.2rem"
  fontFamily?: string;          // máx. 200
  backdropFilter?: string;      // máx. 200. Ex: "blur(8px) saturate(180%)"
  zIndex?: number;              // int 0–9999
  animation?: WidgetAnimation;
}

interface WidgetAnimation {
  type: 'none' | 'fade-in' | 'slide-up' | 'slide-down' | 'zoom-in' | 'bounce';
  duration?: number; // int 0–10000 (ms)
  delay?: number;    // int 0–10000 (ms)
}
```

---

## Tipos de Widget e seus `config`

O campo `config` é livre (`Record<string, unknown>`), mas os tipos abaixo definem os campos esperados por cada widget. Campos não listados são ignorados.

| `type` | Descrição | Campos de `config` esperados |
|--------|-----------|------------------------------|
| `AVATAR_CARD` | Card com avatar, nome e username | _(sem config obrigatório)_ |
| `BANNER` | Banner de cabeçalho do perfil | _(sem config obrigatório)_ |
| `BIO` | Biografia do usuário | _(sem config obrigatório)_ |
| `ANIME_LIST` | Lista de animes (watching/completed/etc.) | `status?: string`, `maxItems?: number`, `showScore?: boolean` |
| `MANGA_LIST` | Lista de mangás | `status?: string`, `maxItems?: number`, `showScore?: boolean` |
| `FAVORITE_ANIME` | Grid de animes favoritos | `maxItems?: number` (padrão: 6) |
| `FAVORITE_MANGA` | Grid de mangás favoritos | `maxItems?: number` (padrão: 6) |
| `FAVORITE_CHARACTERS` | Grid de personagens favoritos | `maxItems?: number` |
| `FAVORITE_STAFF` | Grid de staff/autores favoritos | `maxItems?: number` |
| `STATS_ANIME` | Estatísticas de anime (total, horas, score médio) | _(sem config obrigatório)_ |
| `STATS_MANGA` | Estatísticas de manga | _(sem config obrigatório)_ |
| `RECENT_ACTIVITY` | Feed de atividade recente | `maxItems?: number` |
| `TEXT_BLOCK` | Bloco de texto/markdown customizado | `content: string`, `align?: 'left' \| 'center' \| 'right'` |
| `IMAGE_BLOCK` | Imagem customizada | `url: string`, `alt?: string`, `objectFit?: string` |
| `DIVIDER` | Separador visual | `style?: 'solid' \| 'dashed' \| 'dotted' \| 'gradient'` |
| `SOCIAL_LINKS` | Links de redes sociais | `links: { label: string; url: string; icon?: string }[]` |
| `BADGES` | Conquistas/badges do usuário | `maxItems?: number` |
| `POSTS` | Posts recentes do usuário | `maxItems?: number` |
| `CLOCK` | Relógio com timezone do usuário | `showSeconds?: boolean`, `format?: '12h' \| '24h'` |
| `MUSIC_PLAYER` | Player de áudio (usa `theme.backgroundMusic`) | `showVisualizer?: boolean` |

---

## Layout Padrão

Quando o usuário ainda não salvou nenhum layout, o backend retorna este default:

```json
{
  "version": 2,
  "grid": { "cols": 12, "rowHeight": 40, "gap": 8 },
  "theme": {
    "background": { "type": "solid", "color": "#0f0f0f" },
    "textColor": "#ffffff",
    "accentColor": "#7c3aed",
    "cardStyle": "glass"
  },
  "widgets": [
    { "id": "default-avatar",       "type": "AVATAR_CARD",    "visible": true, "position": { "x": 0, "y": 0, "w": 3, "h": 6 }, "config": {} },
    { "id": "default-bio",          "type": "BIO",            "visible": true, "position": { "x": 3, "y": 0, "w": 9, "h": 3 }, "config": {} },
    { "id": "default-anime-stats",  "type": "STATS_ANIME",    "visible": true, "position": { "x": 3, "y": 3, "w": 4, "h": 3 }, "config": {} },
    { "id": "default-manga-stats",  "type": "STATS_MANGA",    "visible": true, "position": { "x": 7, "y": 3, "w": 5, "h": 3 }, "config": {} },
    { "id": "default-favorite-anime","type": "FAVORITE_ANIME","visible": true, "position": { "x": 0, "y": 6, "w": 6, "h": 6 }, "config": { "maxItems": 6 } },
    { "id": "default-favorite-manga","type": "FAVORITE_MANGA","visible": true, "position": { "x": 6, "y": 6, "w": 6, "h": 6 }, "config": { "maxItems": 6 } }
  ]
}
```

---

## Fluxo de Edição Recomendado

```
1. GET /me/profile-customization
     │
     ├─ draftLayout existe? → carregar draft no editor
     └─ não existe?         → carregar publishedLayout no editor (ou default)

2. Usuário edita (drag, resize, muda cor, etc.)
     │
     └─ PUT /me/profile-customization/draft  ← auto-save a cada N segundos ou on blur

3. Usuário clica "Publicar"
     │
     └─ POST /me/profile-customization/publish

4. Usuário clica "Descartar rascunho"
     │
     └─ DELETE /me/profile-customization/draft
```

---

## Limites e Restrições

| Campo | Limite |
|-------|--------|
| Total de widgets | máx. **50** |
| `id` do widget | 1–100 chars |
| `title` do widget | máx. 100 chars |
| `customCss` | máx. **10.000 chars** |
| `boxShadow` | máx. 300 chars |
| `border` | máx. 200 chars |
| `backgroundImage` | deve ser URL válida |
| `backgroundMusic` | deve ser URL válida |
| `overlay.density` | int 1–500 |
| `overlay.speed` | 0–10 |
| `grid.cols` | int 1–24 |
| `grid.rowHeight` | int 10–200 |
| `grid.gap` | int 0–64 |
| Animação `duration`/`delay` | int 0–10.000 ms |
| `zIndex` | int 0–9.999 |
| `opacity` | 0–1 (float) |

---

## Integração com react-grid-layout

Os campos de `WidgetPosition` mapeiam diretamente para o formato de `layouts` do react-grid-layout:

```ts
import ReactGridLayout from 'react-grid-layout';

const layout = widgets.map(w => ({
  i: w.id,
  x: w.position.x,
  y: w.position.y,
  w: w.position.w,
  h: w.position.h,
  minW: w.position.minW,
  minH: w.position.minH,
  maxW: w.position.maxW,
  maxH: w.position.maxH,
  static: w.locked ?? false,
}));
```

Ao receber `onLayoutChange` do RGL, mapear de volta para `WidgetPosition` e incluir no draft antes de salvar.

---

## Notas de Segurança

- **`customCss`** — o backend armazena sem sanitização. O frontend é responsável por injetar o CSS em um escopo isolado (ex: `<style scoped>` ou shadow DOM) para evitar que estilos vazem para fora do perfil.
- **URLs** (`imageUrl`, `videoUrl`, `backgroundMusic`, `backgroundImage`) — o backend valida apenas que são URLs bem formadas. O frontend deve validar domínios permitidos para evitar conteúdo de terceiros não autorizados.
- **`backdropFilter`** — tem impacto significativo em performance em dispositivos móveis. Considere limitar ou exibir aviso ao usuário.
