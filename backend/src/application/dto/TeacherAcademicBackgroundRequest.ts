import {TeacherDetailsType} from "../../generated/prisma/enums";

export interface TeacherAcademicBackgroundRequest {
    degree: string;
    institution: string;
    completedAt: string;
    type: TeacherDetailsType;
}