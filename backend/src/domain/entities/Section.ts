import {BaseTimestamps} from "../common/BaseTimestamps";
import {Room} from "./Room";
import {SchoolYear} from "./SchoolYear";
import {User} from "./User";

export class Section extends BaseTimestamps {
    constructor(
        public readonly id: string,
        public readonly roomId: string,
        public readonly schoolYearId: string,
        public readonly adviserId: string,
        public readonly name: string,
        public readonly capacity: number,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,

        // NESTED PROPERTIES
        public readonly room: Room | null,
        public readonly schoolYear: SchoolYear | null,
        public readonly adviser: User | null,
    ) {
        super(id, createdAt, updatedAt);
    }
}