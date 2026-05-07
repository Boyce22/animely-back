export type WidgetType =
  | 'AVATAR_CARD'
  | 'BANNER'
  | 'BIO'
  | 'ANIME_LIST'
  | 'MANGA_LIST'
  | 'FAVORITE_ANIME'
  | 'FAVORITE_MANGA'
  | 'FAVORITE_CHARACTERS'
  | 'FAVORITE_STAFF'
  | 'STATS_ANIME'
  | 'STATS_MANGA'
  | 'RECENT_ACTIVITY'
  | 'TEXT_BLOCK'
  | 'IMAGE_BLOCK'
  | 'DIVIDER'
  | 'SOCIAL_LINKS'
  | 'BADGES'
  | 'POSTS'
  | 'CLOCK'
  | 'MUSIC_PLAYER';

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface WidgetAnimation {
  type: 'none' | 'fade-in' | 'slide-up' | 'slide-down' | 'zoom-in' | 'bounce';
  duration?: number;
  delay?: number;
}

export interface WidgetStyle {
  background?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  borderRadius?: string;
  border?: string;
  boxShadow?: string;
  opacity?: number;
  padding?: string;
  color?: string;
  fontSize?: string;
  fontFamily?: string;
  backdropFilter?: string;
  zIndex?: number;
  animation?: WidgetAnimation;
}

export interface ProfileWidget {
  id: string;
  type: WidgetType;
  title?: string;
  visible: boolean;
  locked?: boolean;
  position: WidgetPosition;
  style?: WidgetStyle;
  config: Record<string, unknown>;
}

export type BackgroundType = 'solid' | 'gradient' | 'image' | 'video' | 'pattern';

export interface ProfileBackground {
  type: BackgroundType;
  color?: string;
  gradient?: string;
  imageUrl?: string;
  videoUrl?: string;
  patternType?: string;
  patternColor?: string;
  patternOpacity?: number;
  blur?: number;
  brightness?: number;
  overlay?: string;
}

export interface ProfileOverlay {
  type: 'none' | 'particles' | 'hearts' | 'stars' | 'bubbles' | 'snow' | 'sakura';
  color?: string;
  opacity?: number;
  density?: number;
  speed?: number;
}

export interface GlobalTheme {
  fontFamily?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  textColor?: string;
  linkColor?: string;
  cardStyle?: 'flat' | 'glass' | 'bordered' | 'shadow' | 'neon';
  cursorStyle?: string;
  customCss?: string;
  background: ProfileBackground;
  overlay?: ProfileOverlay;
  backgroundMusic?: string;
}

export interface GridConfig {
  cols: number;
  rowHeight: number;
  gap: number;
}

export interface ProfileLayoutJson {
  version: number;
  grid: GridConfig;
  theme: GlobalTheme;
  widgets: ProfileWidget[];
}
