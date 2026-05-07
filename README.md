# Animely Back

API REST da plataforma Animely — um catálogo social de mangás e animes.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js |
| Framework | Express |
| Linguagem | TypeScript (target ES2020) |
| ORM | TypeORM 0.3 |
| Banco | PostgreSQL |
| Validação | Zod 4 |
| Autenticação | JWT (access + refresh tokens, bcrypt) |
| Logging | Pino (structured, pretty em dev) |
| Upload/Storage | Backblaze B2 / AWS S3 / Cloudinary (via Sharp + multer) |
| Segurança | Helmet, rate limiting, CORS |
| Build | tsc (TypeScript compiler) |
| Bundling | tsup (config disponível, não utilizado no build padrão) |

## Pré-requisitos

- Node.js >= 18
- PostgreSQL >= 14

## Setup local

```bash
cd animely-back
npm install
cp .env.example .env   # edite as variáveis conforme seu ambiente
```

Crie o banco de dados PostgreSQL e configure o `.env` (veja abaixo). Execute as migrações:

```bash
npm run migration:run
```

Para popular dados geográficos iniciais (países, estados, cidades), descomente a chamada `seedLocations()` em `src/server.ts` na primeira execução.

## Variáveis de ambiente

Crie um arquivo `.env` na raiz com:

### Obrigatórias

| Variável | Descrição |
|----------|-----------|
| `NODE_ENV` | `development`, `production` ou `test` |
| `DB_USER` | Usuário PostgreSQL |
| `DB_PASSWORD` | Senha PostgreSQL |
| `DB_HOST` | Host do banco |
| `DB_DATABASE` | Nome do database |
| `JWT_SECRET` | Segredo do access token (min. 32 chars) |
| `JWT_REFRESH_SECRET` | Segredo do refresh token (min. 32 chars) |
| `STORAGE_PROVIDER` | `cloudinary`, `s3` ou `backblaze` (default: `cloudinary`) |

### Opcionais (com defaults)

| Variável | Default | Descrição |
|----------|---------|-----------|
| `PORT` | `3000` | Porta do servidor |
| `CORS_ORIGIN` | `*` | Origin permitida no CORS |
| `DB_PORT` | `5432` | Porta PostgreSQL |
| `DB_SCHEMA` | `c0` | Schema PostgreSQL |
| `JWT_EXPIRES_IN` | `7d` | Expiração do access token |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | Expiração do refresh token |
| `RATE_LIMIT` | `100` | Multiplicador de rate limit |
| `LOG_DIR` | `./logs` | Diretório de logs em produção |

### Storage (condicionais ao `STORAGE_PROVIDER`)

**Cloudinary:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

**S3:** `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

**Backblaze:** `BACKBLAZE_KEY_ID`, `BACKBLAZE_APP_KEY`, `BACKBLAZE_BUCKET_ID`, `BACKBLAZE_BUCKET_NAME`, `BACKBLAZE_DOWNLOAD_URL`

## Build e Run

```bash
npm run dev              # Dev com hot reload (ts-node-dev)
npm run build            # Compila TypeScript para dist/
npm run build:watch      # Compila TypeScript em watch mode
npm run start            # Produção: node dist/server.js
npm run format           # Formata com Prettier

npm run migration:generate  # Gera migração do estado atual
npm run migration:run       # Executa migrações pendentes
```

## Estrutura do projeto

```
src/
├── server.ts              # Entry point: boot, graceful shutdown
├── app.ts                 # Singleton Express: middlewares, rotas, health check
├── config/                # Configuração centralizada (env, database)
├── routes/                # Registro central de todos os sub-roteadores
├── modules/               # Funcionalidades por feature
│   ├── auth/              # Autenticação (register, login, refresh, logout)
│   │   └── dtos/          # Data Transfer Objects (Zod)
│   ├── user/              # Gestão de usuários e perfil customizável
│   │   └── schemas/       # Schemas de validação (Zod)
│   ├── work/              # Obras (mangá, anime, tags, comentários, ratings)
│   │   ├── controllers/   # Handlers HTTP
│   │   ├── services/      # Lógica de negócio
│   │   ├── repositories/  # Acesso a dados (TypeORM)
│   │   ├── entities/      # Modelos TypeORM
│   │   ├── schemas/       # Schemas de validação (Zod)
│   │   ├── dtos/          # Data Transfer Objects
│   │   └── enums/         # Enumerações do domínio
│   ├── country/           # Dados geográficos (países, estados, cidades)
│   │   ├── entities/
│   │   └── schemas/
│   └── posts/             # Posts de usuários (em desenvolvimento)
│       ├── entities/
│       ├── enums/
│       └── interfaces/
├── shared/                # Infraestrutura transversal
│   ├── errors/            # Hierarquia de erros (AppError, HTTP errors)
│   ├── middlewares/       # Error handler, rate limiter, request logger
│   ├── storage/           # Abstração de upload (factory + providers)
│   │   └── upload/        # Configuração e middleware de upload
│   ├── security/          # Roles e controle de acesso
│   ├── enums/             # Enumerações globais
│   ├── interfaces/        # Interfaces compartilhadas
│   ├── types/             # Tipos TypeScript globais
│   └── utils/             # Logger, async handler, validateDto
└── database/
    ├── migrations/        # Histórico de migrações TypeORM
    └── seed/              # Dados iniciais (localidades)
```

## API — Endpoints

### Auth (`/api/auth`)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/register` | Público | Cadastro |
| POST | `/login` | Público | Login (email ou username) |
| POST | `/refresh` | Público | Renovação de tokens (rotation) |
| POST | `/logout` | JWT | Invalida sessão |
| POST | `/change-password` | JWT | Troca de senha |
| GET | `/me` | JWT | Perfil autenticado |

### Users (`/api/users`)

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| GET | `/me` | JWT | — | Perfil próprio |
| GET | `/:id` | JWT | — | Perfil de outro usuário |
| GET | `/` | JWT | — | Listagem paginada |
| PUT | `/me` | JWT | — | Atualização completa |
| PATCH | `/me` | JWT | — | Atualização parcial |
| POST | `/me/profile-picture` | JWT | — | Upload foto (5 MB) |
| POST | `/me/banner` | JWT | — | Upload banner (10 MB) |
| PATCH | `/:id` | JWT | OWNER | Edição como owner |
| POST | `/:id/verify` | JWT | ADMIN | Verificar usuário |
| DELETE | `/:id` | JWT | ADMIN | Soft delete |

### Works (`/api/works`)

| Método | Rota | Auth | Roles | Descrição |
|--------|------|------|-------|-----------|
| GET | `/home` | Opcional | — | Home personalizada |
| GET | `/` | Público | — | Listagem com filtros |
| GET | `/:slug` | Público | — | Obra por slug |
| POST | `/` | JWT | ADMIN/MOD | Criar obra |
| PATCH | `/:id` | JWT | ADMIN/MOD | Atualizar obra |
| POST | `/:id/cover` | JWT | ADMIN/MOD | Upload capa (15 MB) |
| POST | `/:id/banner` | JWT | ADMIN/MOD | Upload banner (10 MB) |
| DELETE | `/:id` | JWT | ADMIN | Remover obra |

### Sub-recursos

| Recurso | Rota base | Descrição |
|---------|-----------|-----------|
| Tags | `/api/tags` | Gêneros, temas, formatos |
| Comentários | `/api/comments` | Threads hierárquicas |
| Ratings | `/api/ratings` | Avaliações (score 0–10) |

### Countries (`/api/countries`)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/` | Público | Listagem paginada de países |
| GET | `/:iso` | Público | País por código ISO |
| GET | `/:countryId/states` | Público | Estados de um país |
| GET | `/states/:stateId/cities` | Público | Cidades de um estado |

### Headers de resposta

Todas as respostas incluem:

- `Content-Type: application/json`

### Rate limiting

Limitadores definidos em `src/shared/middlewares/rate-limiter.ts`:

| Limiter | Janela | Limite | Escopo | Ativo |
|---------|--------|--------|--------|-------|
| `globalLimiter` | 15 min | 300 req | Produção — todas as rotas | Sim |
| `readingLimiter` | 15 min | 600 req | Leitura de páginas | Não (definido, sem uso) |
| `authLimiter` | 15 min | 10 req | Login, register, refresh | Não (definido, sem uso) |
| `passwordLimiter` | 1 hora | 5 req | Change password | Não (definido, sem uso) |

O `globalLimiter` é aplicado apenas quando `NODE_ENV=production`.

## Fluxo de uma requisição

```
HTTP Request
  └─► Middlewares globais (helmet, cors, compression, json 20kb, requestLogger, rate limiter)
       └─► Router (/api)
            └─► Sub-router do módulo
                 └─► Middlewares de rota (authenticate, authorize, upload)
                      └─► Controller → validateDto (Zod) → Service → Repository → TypeORM → PostgreSQL
                           └─► Response
```

## Links

- [Animely Front](/TSUAA/projects/animely-front) — Frontend React
- Repositório: [github.com/Boyce22/animely-back](https://github.com/Boyce22/animely-back)
- [Postman Collection](./docs/Tsukuyomi-API.postman_collection.json)
- [Profile Customization](./docs/profile-customization.md)
