export type ArticleContentBlock =
  | ArticleHeadingBlock
  | ArticleParagraphBlock
  | ArticleImageBlock
  | ArticleQuoteBlock
  | ArticleListBlock
  | ArticleEmbedBlock;

export interface ArticleHeadingBlock {
  type: 'heading';
  level: 2 | 3 | 4;
  text: string;
}

export interface ArticleParagraphBlock {
  type: 'paragraph';
  text: string;
}

export interface ArticleImageBlock {
  type: 'image';
  url: string;
  alt?: string;
  caption?: string;
}

export interface ArticleQuoteBlock {
  type: 'quote';
  text: string;
  cite?: string;
}

export interface ArticleListBlock {
  type: 'list';
  style: 'ordered' | 'unordered';
  items: string[];
}

export interface ArticleEmbedBlock {
  type: 'embed';
  provider: 'youtube' | 'vimeo' | 'twitter' | 'instagram' | 'external';
  url: string;
  title?: string;
}
