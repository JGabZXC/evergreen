import {useEffect, useState} from "react";
import type {Student, Teacher} from "../types";
import axios from "axios";
import {getProfile} from "../services/userService.ts";
import type {User} from "../../features/auth/types/auth.types.ts";

export type UserProfile = User & {
    staff?: Teacher;
    student?: Student;
};

export function useMyProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchProfile() {
            try {
                setLoading(true);
                setError(null);

                const response = await getProfile();
                setProfile(response);
            } catch(err) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.error?.message || "Failed to fetch profile");
                } else {
                    setError("Failed to fetch profile");
                }
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, []);

    return {
        profile,
        loading,
        error
    }
}