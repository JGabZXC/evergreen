import {TeacherDetailsType} from "../../generated/prisma/enums";
import {BaseTimestamps} from "../common/BaseTimestamps";
import {User} from "./User";


export class TeacherAcademicBackground extends BaseTimestamps {
    constructor(
        public readonly id: string,
        public readonly userProfileId: string,
        public readonly degree: string,
        public readonly institution: string,
        public readonly completedAt: Date,
        public readonly type: TeacherDetailsType,
        public readonly isApproved: boolean,
        public readonly approvedAt: Date | null,
        public readonly approvedById: string | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,

        // NESTED PROPERTIES
        public readonly approvedBy: User | null,
    ) {
        super(id, createdAt, updatedAt);
    }


}