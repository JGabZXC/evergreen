import {BaseTimestamps} from "../common/BaseTimestamps";
import {UserAddress} from "./UserAddress";
import {TeacherAcademicBackground} from "./TeacherAcademicBackground";
import {Specialization} from "./Specialization";

export class UserProfile extends BaseTimestamps {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly firstName: string,
        public readonly middleName: string | null,
        public readonly lastName: string,
        public readonly dateOfBirth: Date,
        public readonly contactNumber: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,

        // NESTED PROPERTIES
        public readonly userAddress?: UserAddress | null,
        public readonly teacherAcademicBackground?: TeacherAcademicBackground[] | null,
        public readonly specialization?: Specialization[] | null,
    ) {
        super(id, createdAt, updatedAt)
    }

    public getFullName() {
        return `${this.firstName} ${this.middleName ? `${this.middleName} ${this.lastName}` : this.lastName}`;
    }

    public toObject() {
        return {
            id: this.id,
            userId: this.userId,
            firstName: this.firstName,
            middleName: this.middleName,
            lastName: this.lastName,
            dateOfBirth: this.dateOfBirth,
            contactNumber: this.contactNumber,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        }
    }
}