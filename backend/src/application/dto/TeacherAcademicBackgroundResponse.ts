import {UserResponse} from "./UserResponse";

export interface TeacherAcademicBackgroundResponse {
    degree: string;
    institution: string;
    completedAt: string;
    type: string;
    isApproved: boolean | null;
    approvedAt: string | null;
    approvedById: string | null;
    createdAt: string;
}

export interface TeacherAcademicBackgroundNestedResponse extends TeacherAcademicBackgroundResponse {
    approvedBy: UserResponse | null
}

export interface TeacherAcademicBackgroundAdminResponse extends TeacherAcademicBackgroundNestedResponse {
    id: string;
    userProfileId: string;
    updatedAt: string;
}