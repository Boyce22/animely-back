export enum QualityCompress {
  VERY_HIGH = 90,
  HIGH = 80,
  MEDIUM = 60,
  LOW = 40,
  VERY_LOW = 20,
}

export type ImageCompressed = {
  buffer: Buffer;
  mimeType: string;
};

export interface IImageCompressorService {
  compress(source: string | Buffer, quality: QualityCompress, originalMimeType: string): Promise<ImageCompressed>;
}
