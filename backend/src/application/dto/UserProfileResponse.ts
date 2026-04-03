import { UserAddressResponse } from "./UserAddressResponse";

export interface UserProfileResponse {
  firstName: string;
  middleName: string | null;
  lastName: string;
  dateOfBirth: string;
  contactNumber: string;
}

export interface UserProfileNestedResponse extends UserProfileResponse {
  userAddress: UserAddressResponse | null;
}
