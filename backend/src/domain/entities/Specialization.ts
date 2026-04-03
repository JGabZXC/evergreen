import {BaseTimestamps} from "../common/BaseTimestamps";
import {User} from "./User";

export class Specialization extends BaseTimestamps{
    constructor(
        public readonly id: string,
        public readonly userProfileId: string,
        public readonly name: string,
        public readonly description: string | null,
        public readonly isApproved: boolean,
        public readonly approvedAt: Date | null,
        public readonly approvedById: string | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,

        // NESTED PROPERTIES
        public readonly approvedBy: User | null,
    ) {
        super(id, createdAt, updatedAt)
    }
}