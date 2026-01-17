import {apiPrivate} from "../../../config/axiosPrivate.ts";
import type {Course} from "../../../shared/types";

export const getMyCurriculum = async () => {
    const response = await apiPrivate.get<Course>("/api/student/my-curriculum");
    return response.data;
}