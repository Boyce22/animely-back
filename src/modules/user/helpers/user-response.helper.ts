import { User } from '@/modules/user/entities/user.entity';
import { UserResponse } from '@/modules/user/dtos/user-response.dto';
import { signStorageUrl } from '@/shared/storage/storage.factory';

export function toUserResponse(user: User): UserResponse {
  const response: UserResponse = {
    id: user.id,
    name: user.name,
    lastName: user.lastName,
    fullName: user.fullName,
    username: user.username,
    profilePictureUrl: user.profilePictureUrl,
    bannerUrl: user.bannerUrl,
    biography: user.biography,
    role: user.role,
    isVerified: user.isVerified,
    theme: user.theme,
    preferredLanguage: user.preferredLanguage,
    showMatureContent: user.showMatureContent,
    worksCreated: user.worksCreated,
    commentsCount: user.commentsCount,
    favoritesCount: user.favoritesCount,
    ratingsCount: user.ratingsCount,
    collectionsCount: user.collectionsCount,
    followingCount: user.followingCount,
    followersCount: user.followersCount,
    isProfilePublic: user.isProfilePublic,
    showActivity: user.showActivity,
    showCollections: user.showCollections,
    timeZone: user.timeZone,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString(),
  };

  return response;
}

export async function signUserResponse(user: User): Promise<UserResponse> {
  const resp = toUserResponse(user);
  [resp.profilePictureUrl, resp.bannerUrl] = await Promise.all([
    signStorageUrl(resp.profilePictureUrl),
    signStorageUrl(resp.bannerUrl),
  ]);
  return resp;
}
