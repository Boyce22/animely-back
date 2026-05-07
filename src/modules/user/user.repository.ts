import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '@/modules/user/entities/user.entity';

import { QueryUsersInput, CreateUserInput, UpdateUserInput, PatchUserInput } from '@/modules/user/schemas';
import { Roles } from '@/shared/security/roles.enum';
import { NotFoundError } from '@errors';

export class UserRepository {
  constructor(private readonly repository: Repository<User>) {}

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } });
  }

  async findByIdWithPassword(id: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();
  }

  async findAllPaginated(query: QueryUsersInput): Promise<{ data: User[]; total: number }> {
    const { page, limit } = query;

    const qb = this.repository.createQueryBuilder('user');

    this.applySearchFilter(qb, query.search);
    this.applyRoleFilter(qb, query.role);
    this.applySorting(qb, query.sortBy, query.order);
    this.applyPagination(qb, page, limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }

  async createUser(input: CreateUserInput & { password: string }): Promise<User> {
    const user = this.repository.create(input);
    await this.repository.save(user);
    return (await this.findById(user.id))!;
  }

  async updateUserById(
    id: string,
    input: Omit<UpdateUserInput, 'address'> & { address?: string | null },
  ): Promise<User> {
    const user = await this.findByIdOrFail(id);
    Object.assign(user, input);
    await this.repository.save(user);
    return user;
  }

  async patchUserById(id: string, input: Omit<PatchUserInput, 'address'> & { address?: string | null }): Promise<User> {
    const user = await this.findByIdOrFail(id);

    const filteredInput = Object.fromEntries(Object.entries(input).filter(([_, value]) => value !== undefined));

    Object.assign(user, filteredInput);
    await this.repository.save(user);
    return user;
  }

  async softDeleteUserById(id: string): Promise<void> {
    await this.findByIdOrFail(id);
    await this.repository.softDelete(id);
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.repository.update(id, {
      password: hashedPassword,
      lastPasswordChange: new Date(),
    });
  }

  async verifyUser(id: string): Promise<User> {
    const user = await this.findByIdOrFail(id);
    user.isVerified = true;
    user.emailVerifiedAt = new Date();
    await this.repository.save(user);
    return user;
  }

  async updateProfilePicture(id: string, profilePictureUrl: string): Promise<void> {
    await this.repository.update(id, { profilePictureUrl });
  }

  async updateBanner(id: string, bannerUrl: string): Promise<void> {
    await this.repository.update(id, { bannerUrl });
  }

  private applySearchFilter(qb: SelectQueryBuilder<User>, search?: string): void {
    if (!search) return;

    qb.andWhere(
      '(user.name ILIKE :search OR user.lastName ILIKE :search OR user.username ILIKE :search OR user.email ILIKE :search)',
      { search: `%${search}%` },
    );
  }

  private applyRoleFilter(qb: SelectQueryBuilder<User>, role?: Roles): void {
    if (role === undefined) return;

    qb.andWhere('user.role = :role', { role });
  }

  private applySorting(qb: SelectQueryBuilder<User>, sortBy: string, order: 'ASC' | 'DESC'): void {
    qb.orderBy(`user.${sortBy}`, order);
  }

  private applyPagination(qb: SelectQueryBuilder<User>, page: number, limit: number): void {
    qb.skip((page - 1) * limit).take(limit);
  }

  private async findByIdOrFail(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id '${id}' not found`);
    }
    return user;
  }
}
