import { z } from 'zod';

const widgetPositionSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  w: z.number().int().min(1),
  h: z.number().int().min(1),
  minW: z.number().int().min(1).optional(),
  minH: z.number().int().min(1).optional(),
  maxW: z.number().int().min(1).optional(),
  maxH: z.number().int().min(1).optional(),
});

const widgetAnimationSchema = z.object({
  type: z.enum(['none', 'fade-in', 'slide-up', 'slide-down', 'zoom-in', 'bounce']),
  duration: z.number().int().min(0).max(10000).optional(),
  delay: z.number().int().min(0).max(10000).optional(),
});

const widgetStyleSchema = z.object({
  background: z.string().max(500).optional(),
  backgroundImage: z.url().optional(),
  backgroundSize: z.string().max(100).optional(),
  backgroundPosition: z.string().max(100).optional(),
  borderRadius: z.string().max(100).optional(),
  border: z.string().max(200).optional(),
  boxShadow: z.string().max(300).optional(),
  opacity: z.number().min(0).max(1).optional(),
  padding: z.string().max(100).optional(),
  color: z.string().max(100).optional(),
  fontSize: z.string().max(50).optional(),
  fontFamily: z.string().max(200).optional(),
  backdropFilter: z.string().max(200).optional(),
  zIndex: z.number().int().min(0).max(9999).optional(),
  animation: widgetAnimationSchema.optional(),
});

const widgetTypeSchema = z.enum([
  'AVATAR_CARD',
  'BANNER',
  'BIO',
  'ANIME_LIST',
  'MANGA_LIST',
  'FAVORITE_ANIME',
  'FAVORITE_MANGA',
  'FAVORITE_CHARACTERS',
  'FAVORITE_STAFF',
  'STATS_ANIME',
  'STATS_MANGA',
  'RECENT_ACTIVITY',
  'TEXT_BLOCK',
  'IMAGE_BLOCK',
  'DIVIDER',
  'SOCIAL_LINKS',
  'BADGES',
  'POSTS',
  'CLOCK',
  'MUSIC_PLAYER',
]);

const profileWidgetSchema = z.object({
  id: z.string().min(1).max(100),
  type: widgetTypeSchema,
  title: z.string().max(100).optional(),
  visible: z.boolean(),
  locked: z.boolean().optional(),
  position: widgetPositionSchema,
  style: widgetStyleSchema.optional(),
  config: z.record(z.string(), z.unknown()),
});

const profileBackgroundSchema = z.object({
  type: z.enum(['solid', 'gradient', 'image', 'video', 'pattern']),
  color: z.string().max(100).optional(),
  gradient: z.string().max(500).optional(),
  imageUrl: z.url().optional(),
  videoUrl: z.url().optional(),
  patternType: z.string().max(100).optional(),
  patternColor: z.string().max(100).optional(),
  patternOpacity: z.number().min(0).max(1).optional(),
  blur: z.number().min(0).max(100).optional(),
  brightness: z.number().min(0).max(200).optional(),
  overlay: z.string().max(100).optional(),
});

const profileOverlaySchema = z.object({
  type: z.enum(['none', 'particles', 'hearts', 'stars', 'bubbles', 'snow', 'sakura']),
  color: z.string().max(100).optional(),
  opacity: z.number().min(0).max(1).optional(),
  density: z.number().int().min(1).max(500).optional(),
  speed: z.number().min(0).max(10).optional(),
});

const globalThemeSchema = z.object({
  fontFamily: z.string().max(200).optional(),
  primaryColor: z.string().max(100).optional(),
  secondaryColor: z.string().max(100).optional(),
  accentColor: z.string().max(100).optional(),
  textColor: z.string().max(100).optional(),
  linkColor: z.string().max(100).optional(),
  cardStyle: z.enum(['flat', 'glass', 'bordered', 'shadow', 'neon']).optional(),
  cursorStyle: z.string().max(200).optional(),
  customCss: z.string().max(10000).optional(),
  background: profileBackgroundSchema,
  overlay: profileOverlaySchema.optional(),
  backgroundMusic: z.url().optional(),
});

const gridConfigSchema = z.object({
  cols: z.number().int().min(1).max(24),
  rowHeight: z.number().int().min(10).max(200),
  gap: z.number().int().min(0).max(64),
});

export const profileLayoutSchema = z.object({
  version: z.number().int().min(1),
  grid: gridConfigSchema,
  theme: globalThemeSchema,
  widgets: z.array(profileWidgetSchema).max(50),
});

export type ProfileLayoutInput = z.infer<typeof profileLayoutSchema>;

export const patchProfileCustomizationSchema = z.object({
  isEnabled: z.boolean(),
});

export type PatchProfileCustomizationInput = z.infer<typeof patchProfileCustomizationSchema>;
