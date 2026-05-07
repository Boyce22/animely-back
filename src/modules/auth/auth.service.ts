import crypto from 'crypto';
import { IsNull, Repository } from 'typeorm';
import pino, { Logger } from 'pino';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { RegisterDTO } from '@/modules/auth/dtos/register.dto';
import { LoginDTO } from '@/modules/auth/dtos/login.dto';
import { AuthResponseDTO, RefreshTokenResponseDTO } from '@/modules/auth/dtos/auth-response.dto';
import { ChangePasswordDTO } from '@/modules/auth/dtos/change-password.dto';

import { AppDataSource, env } from '@config';
import { User } from '@/modules/user/entities/user.entity';
import { Session } from '@/modules/auth/entities/session.entity';

import { BadRequestError, ConflictError, ForbiddenError, UnauthorizedError } from '@errors';

export interface JWTPayload {
  userId: string;
  role: string;
  sessionId: string;
}

interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private userRepository: Repository<User>;
  private sessionRepository: Repository<Session>;
  private readonly logger: Logger;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.sessionRepository = AppDataSource.getRepository(Session);
    this.logger = pino({ name: 'AuthService' });
  }

  async register(data: RegisterDTO): Promise<AuthResponseDTO> {
    const normalizedEmail = data.email.toLowerCase();
    const username = data.username.trim();
    await this.validateUniqueUser(normalizedEmail, username);

    const birthDate = new Date(data.birthDate);
    const hashedPassword = await bcrypt.hash(data.password, AuthService.SALT_ROUNDS);

    const user = this.userRepository.create({
      name: data.name,
      lastName: data.lastName,
      username,
      email: normalizedEmail,
      password: hashedPassword,
      birthDate,
      lastLoginAt: new Date(),
      showMatureContent: this.calculateAge(birthDate) >= 18,
    });

    await this.userRepository.save(user);
    return this.createSessionAndBuildResponse(user);
  }

  async login(data: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.findUserByIdentifier(data.identifier);

    if (!user) throw new UnauthorizedError('Invalid credentials');
    if (user.deletedAt) throw new ForbiddenError('Account is deactivated');

    await this.verifyPassword(data.password, user.password);
    await this.updateLastLogin(user.id);

    return this.createSessionAndBuildResponse(user);
  }

  async refreshToken(incomingToken: string): Promise<RefreshTokenResponseDTO> {
    let payload: RefreshTokenPayload;

    try {
      payload = jwt.verify(incomingToken, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) throw new UnauthorizedError('Token has expired');
      throw new UnauthorizedError('Invalid token');
    }

    const session = await this.sessionRepository
      .createQueryBuilder('session')
      .addSelect('session.refreshTokenHash')
      .where('session.id = :id', { id: payload.sessionId })
      .andWhere('session.userId = :userId', { userId: payload.userId })
      .getOne();

    if (!session) throw new UnauthorizedError('Invalid session');

    if (session.expiresAt < new Date()) {
      await this.sessionRepository.delete(session.id);
      throw new UnauthorizedError('Session expired');
    }

    if (this.hashToken(incomingToken) !== session.refreshTokenHash) {
      // Token reuse — possible theft; invalidate the entire session
      await this.sessionRepository.delete(session.id);
      throw new UnauthorizedError('Refresh token reuse detected');
    }

    const user = await this.getAuthUser(payload.userId);
    if (!user || user.deletedAt) throw new UnauthorizedError('User not found');

    const tokens = this.generateTokens(user, session.id);

    await this.sessionRepository.update(session.id, {
      refreshTokenHash: this.hashToken(tokens.refreshToken),
    });

    return tokens;
  }

  async getAuthUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async logout(userId: string, sessionId: string): Promise<void> {
    await this.sessionRepository.delete({ id: sessionId, userId });
  }

  async changePassword(userId: string, data: ChangePasswordDTO): Promise<void> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user) throw new UnauthorizedError('User not found');

    await this.verifyPassword(data.currentPassword, user.password);
    await this.validateCurrentPassword(user, data.currentPassword);
    await this.validateNewPasswordIsDifferent(user, data.newPassword);

    const hashedPassword = await bcrypt.hash(data.newPassword, AuthService.SALT_ROUNDS);

    // Revoke all sessions — any intercepted access token will fail the lastPasswordChange check
    await Promise.all([
      this.userRepository.update(userId, {
        password: hashedPassword,
        lastPasswordChange: new Date(),
      }),
      this.sessionRepository.delete({ userId }),
    ]);
  }

  verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) throw new UnauthorizedError('Token has expired');
      throw new UnauthorizedError('Invalid token');
    }
  }

  private async validateCurrentPassword(user: User, currentPassword: string): Promise<void> {
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      this.logger.warn({ userId: user.id }, 'Failed password change attempt');
      throw new BadRequestError('Current password is incorrect');
    }
  }

  private async validateNewPasswordIsDifferent(user: User, newPassword: string): Promise<void> {
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      throw new BadRequestError('New password must be different from current password');
    }
  }

  private async createSessionAndBuildResponse(user: User): Promise<AuthResponseDTO> {
    const session = this.sessionRepository.create({
      userId: user.id,
      expiresAt: new Date(Date.now() + SEVEN_DAYS_MS),
      refreshTokenHash: '',
    });

    // session.id is generated by UUID.generate() in the entity's field initializer
    const tokens = this.generateTokens(user, session.id);
    session.refreshTokenHash = this.hashToken(tokens.refreshToken);

    await this.sessionRepository.save(session);
    return this.buildAuthResponse(user, tokens);
  }

  private generateTokens(user: User, sessionId: string): { accessToken: string; refreshToken: string } {
    const accessPayload: JWTPayload = { userId: user.id, role: user.role, sessionId };
    const refreshPayload: RefreshTokenPayload = { userId: user.id, sessionId };

    return {
      accessToken: jwt.sign(accessPayload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any }),
      refreshToken: jwt.sign(refreshPayload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any }),
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private buildAuthResponse(user: User, tokens: { accessToken: string; refreshToken: string }): AuthResponseDTO {
    return {
      user: {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePictureUrl: user.profilePictureUrl,
        isVerified: user.isVerified,
      },
      ...tokens,
    };
  }

  private async verifyPassword(plain: string, hash: string): Promise<void> {
    const isValid = await bcrypt.compare(plain, hash);
    if (!isValid) throw new UnauthorizedError('Invalid credentials');
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, { lastLoginAt: new Date() });
  }

  private async findUserByIdentifier(identifier: string): Promise<User | null> {
    const isEmail = identifier.includes('@');

    return this.userRepository.findOne({
      where: isEmail
        ? { email: identifier.toLowerCase(), deletedAt: IsNull() }
        : { username: identifier, deletedAt: IsNull() },
      select: [
        'id',
        'name',
        'lastName',
        'username',
        'email',
        'password',
        'profilePictureUrl',
        'role',
        'isVerified',
        'theme',
        'preferredLanguage',
        'showMatureContent',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  private async validateUniqueUser(email: string, username: string): Promise<void> {
    const existingUser = await this.userRepository
      .createQueryBuilder('user')
      .where('user.deletedAt IS NULL')
      .andWhere('(user.email = :email OR user.username = :username)', {
        email,
        username,
      })
      .getOne();

    if (!existingUser) return;

    throw new ConflictError(existingUser.email === email ? 'Email already in use' : 'Username already taken');
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}
