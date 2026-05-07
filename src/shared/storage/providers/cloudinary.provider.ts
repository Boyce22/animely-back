import { env } from '@config';
import { v2 as cloudinary } from 'cloudinary';

import { IStorageProvider, UploadOptions, UploadResult } from '../interfaces/storage.interface';

/**
 * Cloudinary storage provider implementation
 */
export class CloudinaryProvider implements IStorageProvider {
  constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(buffer: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadOptions: any = {
        folder: options.folder || 'manga-uploads',
        resource_type: 'auto',
      };

      if (options.filename) {
        uploadOptions.public_id = options.filename;
      }

      if (options.maxWidth || options.maxHeight) {
        uploadOptions.transformation = {
          width: options.maxWidth,
          height: options.maxHeight,
          crop: 'limit',
          quality: options.quality || 'auto',
        };
      }

      const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, async (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error('Upload failed: no result'));
          return;
        }

        const uploadResult: UploadResult = {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes,
        };

        // Generate thumbnail if requested
        if (options.generateThumbnail) {
          const thumbnailUrl = cloudinary.url(result.public_id, {
            transformation: {
              width: options.thumbnailWidth || 300,
              height: options.thumbnailHeight || 400,
              crop: 'fill',
              quality: 'auto',
              fetch_format: 'auto',
            },
          });
          uploadResult.thumbnailUrl = thumbnailUrl;
        }

        resolve(uploadResult);
      });

      uploadStream.end(buffer);
    });
  }

  async uploadMany(files: Buffer[], options: UploadOptions = {}): Promise<UploadResult[]> {
    const promises = files.map((buffer, index) => {
      const fileOptions = { ...options };
      if (options.filename) {
        fileOptions.filename = `${options.filename}-${index + 1}`;
      }
      return this.upload(buffer, fileOptions);
    });

    return Promise.all(promises);
  }

  async delete(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      throw error;
    }
  }

  async deleteMany(publicIds: string[]): Promise<void> {
    try {
      await cloudinary.api.delete_resources(publicIds);
    } catch (error) {
      console.error('Error deleting multiple files from Cloudinary:', error);
      throw error;
    }
  }

  getUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      secure: true,
      fetch_format: 'auto',
      quality: 'auto',
    });
  }

  getThumbnailUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      transformation: {
        width: 300,
        height: 400,
        crop: 'fill',
        quality: 'auto',
        fetch_format: 'auto',
      },
    });
  }

  async signUrl(storedUrl: string, _expiresIn = 3600): Promise<string> {
    return storedUrl;
  }
}
