import { UserRole, UserStatus } from '@prisma/client';

export interface LoginResponseDto {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
  };
}
