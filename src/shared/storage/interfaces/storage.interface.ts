export interface UploadOptions {
  folder?: string;
  filename?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  generateThumbnail?: boolean;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
}

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  size: number;
  thumbnailUrl?: string;
}

export interface IStorageProvider {
  upload(buffer: Buffer, options?: UploadOptions): Promise<UploadResult>;
  uploadMany(files: Buffer[], options?: UploadOptions): Promise<UploadResult[]>;
  delete(publicId: string): Promise<void>;
  deleteMany(publicIds: string[]): Promise<void>;
  getUrl(publicId: string): string;
  getThumbnailUrl(publicId: string): string;
  signUrl(storedUrl: string, expiresIn?: number): Promise<string>;
}
