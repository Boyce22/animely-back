import sharp, { Sharp } from 'sharp';

import { logger } from '@utils';
import { IImageCompressorService, ImageCompressed, QualityCompress } from './interfaces/compressor.interface';

export class ImageCompressionService implements IImageCompressorService {
  private readonly mimeEncoders: Record<string, (img: Sharp, quality: QualityCompress) => Sharp> = {
    'image/jpeg': (img, quality) => img.jpeg({ quality }),
    'image/png': (img, quality) => img.png({ quality }),
    'image/webp': (img, quality) => img.webp({ quality }),
    'image/avif': (img, quality) => img.avif({ quality }),
  };

  async compress(source: string | Buffer, quality: QualityCompress, mime: string): Promise<ImageCompressed> {
    try {
      const image = sharp(source);
      const encoder = this.mimeEncoders[mime];

      if (!encoder) {
        throw new Error(`Unsupported image format: ${mime}`);
      }

      const compressed = await encoder(image.clone(), quality).toBuffer();

      const meta = await image.metadata();

      return { buffer: compressed, mimeType: `image/${meta.format}` };
    } catch (error) {
      logger.error(`Failed to compress image: ${(error as Error).message}`);
      throw new Error('Failed to compress image. Verify the image format.');
    }
  }
}
