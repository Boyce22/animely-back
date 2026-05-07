import { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { env } from '@config';
import crypto from 'crypto';
import sharp from 'sharp';
import { IStorageProvider, UploadOptions, UploadResult } from '../interfaces/storage.interface';

/**
 * AWS S3 storage provider implementation
 */
export class S3Provider implements IStorageProvider {
  private client: S3Client;
  private bucketName: string;
  private region: string;

  constructor() {
    this.region = env.AWS_REGION || 'us-east-1';
    this.bucketName = env.AWS_S3_BUCKET || '';

    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async upload(buffer: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    const metadata = await sharp(buffer).metadata();

    // Process image if needed
    let processedBuffer = buffer;
    if (options.maxWidth || options.maxHeight) {
      processedBuffer = await sharp(buffer)
        .resize(options.maxWidth, options.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: options.quality || 80 })
        .toBuffer();
    }

    const filename = options.filename || crypto.randomBytes(16).toString('hex');
    const key = options.folder ? `${options.folder}/${filename}` : filename;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: processedBuffer,
      ContentType: `image/${metadata.format}`,
    });

    await this.client.send(command);

    const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

    const result: UploadResult = {
      url,
      publicId: key,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: processedBuffer.length,
    };

    // Generate thumbnail if requested
    if (options.generateThumbnail) {
      const thumbnailBuffer = await sharp(buffer)
        .resize(options.thumbnailWidth || 300, options.thumbnailHeight || 400, {
          fit: 'cover',
        })
        .jpeg({ quality: 70 })
        .toBuffer();

      const thumbnailKey = `${key}-thumbnail`;
      const thumbnailCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
        });

      await this.client.send(thumbnailCommand);

      result.thumbnailUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${thumbnailKey}`;
    }

    return result;
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
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: publicId,
    });

    await this.client.send(command);

    // Delete thumbnail if exists
    try {
      const thumbnailCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: `${publicId}-thumbnail`,
      });
      await this.client.send(thumbnailCommand);
    } catch (error) {
      // Thumbnail may not exist, ignore error
    }
  }

  async deleteMany(publicIds: string[]): Promise<void> {
    const objects = publicIds.flatMap((id) => [{ Key: id }, { Key: `${id}-thumbnail` }]);

    const command = new DeleteObjectsCommand({
      Bucket: this.bucketName,
      Delete: {
        Objects: objects,
      },
    });

    await this.client.send(command);
  }

  getUrl(publicId: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${publicId}`;
  }

  getThumbnailUrl(publicId: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${publicId}-thumbnail`;
  }

  async signUrl(storedUrl: string, expiresIn = 3600): Promise<string> {
    const prefix = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/`;
    const key = storedUrl.replace(prefix, '').split('?')[0];
    const command = new GetObjectCommand({ Bucket: this.bucketName, Key: key });
    return getSignedUrl(this.client, command, { expiresIn });
  }
}
