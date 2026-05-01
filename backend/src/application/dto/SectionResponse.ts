import {RoomResponse} from "./RoomResponse";
import {SchoolYearResponse} from "./SchoolYearResponse";
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
    room: RoomResponse;
    schoolYear: SchoolYearResponse;
    adviser: UserAdminResponseDeep;
}