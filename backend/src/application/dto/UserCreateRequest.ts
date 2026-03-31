import {Role} from "../../generated/prisma/enums";

export interface UserProfileRequest {
    firstName: string,
    middleName?: string,
    lastName: string,
    dateOfBirth: string,
    contactNumber: string,
}

export interface UserAddressRequest {
    homeAddress: string,
    barangay: string,
    municipality: string,
    province: string,
    region: string,
}

export interface UserRequestBase {
    email: string,
    password: string,
    role: Role,
}

export interface UserErrorCreateRequest {
    user: {
        email?: string;
        password?: string;
        role?: string;
    },
    userProfile: {
        firstname?: string,
        lastName?: string,
        dateOfBirth?: string,
        contactNumber?: string,
    },
    userAddress: {
        homeAddress?: string,
        barangay?: string,
        municipality?: string,
        province?: string,
        region?: string,
    }

}

export interface UserCreateRequest {
    user: UserRequestBase,
    userProfile: UserProfileRequest,
    userAddress: UserAddressRequest,
}