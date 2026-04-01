import {BaseTimestamps} from "../common/BaseTimestamps";

export class UserAddress extends BaseTimestamps {
    constructor(
        public readonly id: string,
        public readonly userProfileId: string,
        public readonly homeAddress: string,
        public readonly barangay: string,
        public readonly municipality: string,
        public readonly province: string,
        public readonly region: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {
        super(id, createdAt, updatedAt);
    }

    public toObject() {
        return {
            id: this.id,
            userProfileId: this.userProfileId,
            homeAddress: this.homeAddress,
            barangay: this.barangay,
            municipality: this.municipality,
            province: this.province,
            region: this.region,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        }
    }
}