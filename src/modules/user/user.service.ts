import path from 'path';
import bcrypt from 'bcryptjs';
import { Logger } from 'pino';

import { UserRepository } from '@/modules/user/user.repository';
import {
  CreateUserInput,
  UpdateUserInput,
  PatchUserInput,
  QueryUsersInput,
} from '@/modules/user/schemas';
import { UserResponse } from '@/modules/user/dtos/user-response.dto';
import { User } from '@/modules/user/entities/user.entity';

import { PaginatedResponse } from '@/shared/interfaces/api-response.interface';

import { ConflictError, NotFoundError } from '@errors';
import { signUserResponse, toUserResponse } from '@/modules/user/helpers/user-response.helper';
import { getStorageProvider, signStorageUrl } from '@/shared/storage/storage.factory';

export class UserService {
  private static readonly SALT_ROUNDS = 12;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) {}

  async getUserById(id: string): Promise<UserResponse> {
    const user = await this.findUserOrFail(id);
    return signUserResponse(user);
  }

  async getUserByEmail(email: string): Promise<UserResponse | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    return user ? toUserResponse(user) : null;
  }

  async getUsers(query: QueryUsersInput): Promise<PaginatedResponse<UserResponse>> {
    const { data, total } = await this.userRepository.findAllPaginated(query);

    const { page, limit } = query;

    return {
      items: await Promise.all(data.map(signUserResponse)),
      pagination: {
        type: 'offset',
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateProfilePicture(userId: string, file: Express.Multer.File): Promise<string> {
    const user = await this.findUserOrFail(userId);

    // if (user.profilePictureUrl) {
    //   await this.deleteOldImage(user.profilePictureUrl);
    // } // manter na base por conta de auditória e rastreabilidade em casos que o usuário não cumpra com as regras da aplicação.

    const storage = getStorageProvider();

    const result = await storage.upload(file.buffer, {
      folder: `profile-picture/${userId}`,
      filename: `${Date.now()}${path.extname(file.originalname)}`,
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 85,
    });

    await this.userRepository.updateProfilePicture(userId, result.url);

    this.logger.info({ userId, url: result.url }, 'Profile picture updated');

    return (await signStorageUrl(result.url)) ?? result.url;
  }

  async updateBanner(userId: string, file: Express.Multer.File): Promise<string> {
    const user = await this.findUserOrFail(userId);

    // if (user.bannerUrl) {
    //   await this.deleteOldImage(user.bannerUrl);
    // }  // manter na base por conta de auditória e rastreabilidade em casos que o usuário não cumpra com as regras da aplicação.

    const storage = getStorageProvider();

    const result = await storage.upload(file.buffer, {
      folder: `banners/${userId}`,
      filename: `${Date.now()}${path.extname(file.originalname)}`,
      maxWidth: 2560,
      maxHeight: 1440,
      quality: 90,
    });

    await this.userRepository.updateBanner(userId, result.url);

    this.logger.info({ userId, url: result.url }, 'Banner updated');
    return (await signStorageUrl(result.url)) ?? result.url;
  }

  async updateUserById(
    id: string,
    input: Omit<UpdateUserInput, 'address'>,
    address?: string | null,
  ): Promise<UserResponse> {
    const currentUser = await this.findUserOrFail(id);

    const email = input.email.toLowerCase().trim();
    const username = input.username.trim();

    await this.validateUniqueFieldsIfChanged(currentUser, email, username);

    const user = await this.userRepository.updateUserById(id, {
      ...input,
      email,
      username,
      ...(address !== undefined && { address }),
    });

    this.logger.info({ userId: id }, 'User updated');
    return signUserResponse(user);
  }

  async patchUserById(
    id: string,
    input: Omit<PatchUserInput, 'address'>,
    address?: string | null,
  ): Promise<UserResponse> {
    const currentUser = await this.findUserOrFail(id);

    await this.validateAndNormalizeEmail(input, currentUser);
    await this.validateAndNormalizeUsername(input, currentUser);

    const user = await this.userRepository.patchUserById(id, {
      ...input,
      ...(address !== undefined && { address }),
    });

    this.logger.info({ userId: id }, 'User patched');
    return signUserResponse(user);
  }

  async softDeleteUserById(id: string): Promise<void> {
    await this.findUserOrFail(id);
    await this.userRepository.softDeleteUserById(id);
    this.logger.info({ userId: id }, 'User soft deleted');
  }

  async verifyUser(id: string): Promise<UserResponse> {
    const currentUser = await this.findUserOrFail(id);

    if (currentUser.isVerified) {
      throw new ConflictError('User is already verified');
    }

    const user = await this.userRepository.verifyUser(id);
    this.logger.info({ userId: id }, 'User verified');
    return signUserResponse(user);
  }

  private async findUserOrFail(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  private async findUserWithPasswordOrFail(id: string): Promise<User> {
    const user = await this.userRepository.findByIdWithPassword(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  private async validateUniqueUser(email: string, username: string): Promise<void> {
    const [existingEmail, existingUsername] = await Promise.all([
      this.userRepository.findByEmail(email),
      this.userRepository.findByUsername(username),
    ]);

    if (existingEmail) {
      throw new ConflictError('Email already in use');
    }

    if (existingUsername) {
      throw new ConflictError('Username already in use');
    }
  }

  private async validateUniqueFieldsIfChanged(currentUser: User, newEmail: string, newUsername: string): Promise<void> {
    const promises: Promise<void>[] = [];

    if (newEmail !== currentUser.email) {
      promises.push(this.validateEmailUniqueness(newEmail));
    }

    if (newUsername !== currentUser.username) {
      promises.push(this.validateUsernameUniqueness(newUsername));
    }

    await Promise.all(promises);
  }

  private async validateEmailUniqueness(email: string): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already in use');
    }
  }

  private async validateUsernameUniqueness(username: string): Promise<void> {
    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new ConflictError('Username already in use');
    }
  }

  private async validateAndNormalizeEmail(input: { email?: string }, currentUser: User): Promise<void> {
    if (!input.email) return;

    const email = input.email.toLowerCase().trim();

    if (email !== currentUser.email) {
      await this.validateEmailUniqueness(email);
    }

    input.email = email;
  }

  private async validateAndNormalizeUsername(input: { username?: string }, currentUser: User): Promise<void> {
    if (!input.username) return;

    const username = input.username.trim();

    if (username !== currentUser.username) {
      await this.validateUsernameUniqueness(username);
    }

    input.username = username;
  }
}
