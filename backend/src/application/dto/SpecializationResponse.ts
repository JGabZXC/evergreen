import {UserResponse} from "./UserResponse";

export interface SpecializationResponse {
    name: string,
    description: string | null,
    isApproved: boolean,
    approvedAt: string | null,
    approvedById: string | null,
    createdAt: string | null,

    // NESTED PROPERTIES
    approvedBy: UserResponse | null,
}