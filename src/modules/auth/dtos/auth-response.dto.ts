export interface AuthResponseDTO {
  user: {
    id: string;
    name: string;
    lastName: string;
    username: string;
    email: string;
    role: string;
    profilePictureUrl?: string;
    isVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponseDTO {
  accessToken: string;
  refreshToken: string;
}
