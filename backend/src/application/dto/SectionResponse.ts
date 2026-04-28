import {RoomResponseNested} from "./RoomResponse";
import {SchoolYearNestedResponse} from "./SchoolYearResponse";
import {UserAdminResponseDeep} from "./UserAdminResponse";

export interface SectionResponse {
    id: string;
    roomId: string;
    schoolYearId: string,
    adviserId: string,
    name: string;
    capacity: number;
    createdAt: string;
    updatedAt: string;
}

export interface SectionNestedResponse extends SectionResponse {
    room: RoomResponseNested;
    schoolYear: SchoolYearNestedResponse;
    adviser: UserAdminResponseDeep;
}