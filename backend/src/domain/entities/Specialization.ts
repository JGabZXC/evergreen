import {BaseTimestamps} from "../common/BaseTimestamps";

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

    ) {
        super(id, createdAt, updatedAt)
    }
}