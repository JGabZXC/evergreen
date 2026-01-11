import {apiPrivate} from "../../config/axiosPrivate.ts";
import type {UserProfile} from "../hooks/useMyProfile.ts";

export const getProfile = async () => {
    const response = await apiPrivate<UserProfile>(`/api/user/profile`)
    return response.data;
}