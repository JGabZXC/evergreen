import {BaseEntity} from "../common/BaseEntity";
import {RoomStatus} from "../../generated/prisma/enums";
import {User} from "./User";

export class RoomStatusHistory extends BaseEntity {
    constructor(
        public readonly id: string,
        public readonly roomId: string,
        public readonly previousStatus: RoomStatus,
        public readonly newStatus: RoomStatus,
        public readonly remarks: string | null,
        public readonly changedById: string | null,
        public readonly createdAt: Date,

        // NESTED PROPERTIES
        public readonly changedBy: User | null,
    ) {
        super(id, createdAt)
    }
}