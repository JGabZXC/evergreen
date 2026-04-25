import {BaseTimestamps} from "../common/BaseTimestamps";
import {RoomStatus, RoomType} from "../../generated/prisma/enums";
import {User} from "./User";
import {RoomStatusHistory} from "./RoomStatusHistory";

export class Room extends BaseTimestamps {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly type: RoomType,
        public readonly capacity: number,
        public readonly status: RoomStatus,
        public readonly createdById: string | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,

        // NESTED PROPERTIES
        public readonly createdBy: User | null,
        public readonly roomStatusHistories: RoomStatusHistory[] | null
    ) {
        super(id, createdAt, updatedAt);
    }
}