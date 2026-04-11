import { StudentRole } from "../../../features/auth";
import type { UserProfile } from "../../hooks/useMyProfile";

interface AccountDetailsProps {
    profile: UserProfile;
}

export default function AccountDetails({ profile }: AccountDetailsProps) {
    let displayId = "N/A";
    if (profile?.staff) displayId = profile.staff.employeeId;
    if (profile?.student) displayId = profile.student.studentId;

    return (
        <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-6">
                <h2 className="card-title text-xl font-bold mb-4 text-primary">Account Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium text-base-content/70">ID</span>
                        </label>
                        <input type="text" className="input input-bordered w-full bg-base-200 text-base-content" disabled value={profile?._id || ""} />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium text-base-content/70">Email</span>
                        </label>
                        <input type="text" className="input input-bordered w-full bg-base-200 text-base-content" disabled value={profile?.email || ""} />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium text-base-content/70">
                                {profile?.role !== StudentRole.Student ? "Employee ID" : "Student ID"}
                            </span>
                        </label>
                        <input type="text" className="input input-bordered w-full bg-base-200 text-base-content" disabled value={displayId} />
                    </div>
                </div>
            </div>
        </div>
    );
}

