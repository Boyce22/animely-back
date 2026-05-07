import B2 from 'backblaze-b2';

import { env } from '@config';
import crypto from 'crypto';
import sharp from 'sharp';

import { IStorageProvider, UploadOptions, UploadResult } from '../interfaces/storage.interface';

/**
 * Backblaze B2 storage provider implementation
 */
export class BackblazeProvider implements IStorageProvider {
  private b2: B2;
  private bucketId: string;
  private bucketName: string;
  private downloadUrl: string = '';
  private authorizedUntil: number = 0;

  constructor() {
    this.bucketId = env.BACKBLAZE_BUCKET_ID || '';
    this.bucketName = env.BACKBLAZE_BUCKET_NAME || '';

    this.b2 = new B2({
      applicationKeyId: env.BACKBLAZE_KEY_ID || '',
      applicationKey: env.BACKBLAZE_APP_KEY || '',
    });
  }

  private async authorize(): Promise<void> {
    if (Date.now() < this.authorizedUntil) return;
    const auth = await this.b2.authorize();
    this.downloadUrl = auth.data.downloadUrl;
    this.authorizedUntil = Date.now() + 23 * 60 * 60 * 1000;
  }

  async upload(buffer: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    await this.authorize();

    const metadata = await sharp(buffer).metadata();
    const processedBuffer = await this.processImage(buffer, options);
    const fileName = this.buildFileName(options);

    const uploadUrl = await this.getUploadUrl();
    const uploadResponse = await this.uploadFile(uploadUrl, fileName, processedBuffer, metadata);

    const result: UploadResult = {
      url: this.buildPublicUrl(fileName),
      publicId: uploadResponse.data.fileId,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: processedBuffer.length,
    };

    if (options.generateThumbnail) {
      result.thumbnailUrl = await this.generateAndUploadThumbnail(buffer, fileName, options);
    }

    return result;
  }

  private async processImage(buffer: Buffer, options: UploadOptions): Promise<Buffer> {
    if (!options.maxWidth && !options.maxHeight) {
      return buffer;
    }

    return sharp(buffer)
      .resize(options.maxWidth, options.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: options.quality || 80 })
      .toBuffer();
  }

  private buildFileName(options: UploadOptions): string {
    const filename = options.filename || crypto.randomBytes(16).toString('hex');
    return options.folder ? `${options.folder}/${filename}` : filename;
  }

  private buildPublicUrl(fileName: string): string {
    return fileName;
  }

  private async getUploadUrl() {
    const response = await this.b2.getUploadUrl({ bucketId: this.bucketId });
    return response.data;
  }

  private async uploadFile(uploadUrl: any, fileName: string, buffer: Buffer, metadata: any) {
    return this.b2.uploadFile({
      uploadUrl: uploadUrl.uploadUrl,
      uploadAuthToken: uploadUrl.authorizationToken,
      fileName,
      data: buffer,
      mime: `image/${metadata.format}`,
    });
  }

  private async generateAndUploadThumbnail(
    buffer: Buffer,
    originalFileName: string,
    options: UploadOptions,
  ): Promise<string> {
    const thumbnailBuffer = await sharp(buffer)
      .resize(options.thumbnailWidth || 300, options.thumbnailHeight || 400, {
        fit: 'cover',
      })
      .jpeg({ quality: 70 })
      .toBuffer();

    const thumbnailFileName = `${originalFileName}-thumbnail`;
    const uploadUrl = await this.getUploadUrl();

    await this.b2.uploadFile({
      uploadUrl: uploadUrl.uploadUrl,
      uploadAuthToken: uploadUrl.authorizationToken,
      fileName: thumbnailFileName,
      data: thumbnailBuffer,
      mime: 'image/jpeg',
    });

    return this.buildPublicUrl(thumbnailFileName);
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
    await this.authorize();

    await this.b2.deleteFileVersion({
      fileId: publicId,
      fileName: publicId,
    });

    // Try to delete thumbnail
    try {
      await this.b2.deleteFileVersion({
        fileId: `${publicId}-thumbnail`,
        fileName: `${publicId}-thumbnail`,
      });
    } catch (error) {
      // Thumbnail may not exist, ignore error
    }
  }

  async deleteMany(publicIds: string[]): Promise<void> {
    await this.authorize();

    const deletePromises = publicIds.map((id) => this.delete(id));
    await Promise.all(deletePromises);
  }

  getUrl(publicId: string): string {
    return `${this.downloadUrl}/file/${this.bucketName}/${publicId}`;
  }

  getThumbnailUrl(publicId: string): string {
    return `${this.downloadUrl}/file/${this.bucketName}/${publicId}-thumbnail`;
  }

  async signUrl(storedPath: string, expiresIn = 3600): Promise<string> {
    await this.authorize();

    const response = await this.b2.getDownloadAuthorization({
      bucketId: this.bucketId,
      fileNamePrefix: storedPath,
      validDurationInSeconds: expiresIn,
    });

    return `${this.downloadUrl}/file/${this.bucketName}/${storedPath}?Authorization=${response.data.authorizationToken}`;
  }
}
