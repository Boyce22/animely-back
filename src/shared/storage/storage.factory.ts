import { env } from '@config';
import { IStorageProvider } from './interfaces/storage.interface';

import { S3Provider } from './providers/s3.provider';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { BackblazeProvider } from './providers/backblaze.provider';

export type StorageProviderType = 'cloudinary' | 's3' | 'backblaze';

/**
 * Factory to create storage provider instances
 * Allows easy switching between different storage providers via env variable
 */
export class StorageFactory {
  private static instance: IStorageProvider | null = null;

  /**
   * Get storage provider instance (Singleton pattern)
   */
  static getProvider(): IStorageProvider {
    if (!this.instance) {
      const providerType = (env.STORAGE_PROVIDER || 'cloudinary') as StorageProviderType;
      this.instance = this.createProvider(providerType);
    }
    return this.instance;
  }

  /**
   * Create a new provider instance
   */
  private static createProvider(type: StorageProviderType): IStorageProvider {
    switch (type) {
      case 'cloudinary':
        return new CloudinaryProvider();
      case 's3':
        return new S3Provider();
      case 'backblaze':
        return new BackblazeProvider();
      default:
        throw new Error(`Unknown storage provider: ${type}`);
    }
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static reset(): void {
    this.instance = null;
  }

  /**
   * Set a custom provider (useful for testing)
   */
  static setProvider(provider: IStorageProvider): void {
    this.instance = provider;
  }
}

export const getStorageProvider = (): IStorageProvider => {
  return StorageFactory.getProvider();
};

export const signStorageUrl = async (url: string | null | undefined, expiresIn?: number): Promise<string | undefined> => {
  if (!url) return undefined;
  return StorageFactory.getProvider().signUrl(url, expiresIn);
};
