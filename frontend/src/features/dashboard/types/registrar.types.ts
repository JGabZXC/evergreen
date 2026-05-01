import type { PaginatedResponse } from '../../../shared/types/pagination.types';
import type { User } from '../../auth';

export interface RegistrarProfile {
  firstName: string;
  middleName: string | null;
  lastName: string;
  dateOfBirth: string; // ISO date string
  contactNumber: string;
}

export interface RegistrarAdminItem {
  user: User & {
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  userProfile: RegistrarProfile;
}

export type RegistrarAdminListResponse = PaginatedResponse<RegistrarAdminItem>;

