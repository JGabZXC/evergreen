import { CircleQuestionMark } from "lucide-react";
import type { UserProfile } from "../../hooks/useMyProfile";
import { StaffRole } from "../../../features/auth/types/auth.types";

interface EmploymentDetailsProps {
    profile: UserProfile;
}

export default function EmploymentDetails({ profile }: EmploymentDetailsProps) {
    if (!profile.staff) return null;
    const { staff, role } = profile;

    return (
        <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-6">
                <h2 className="card-title text-xl font-bold mb-4 text-primary">Employment Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="form-control w-full">
                        <label className="label"><span className="label-text font-medium text-base-content/70">Department</span></label>
                        <input type="text" className="input input-bordered w-full bg-base-200 text-base-content" disabled value={staff.department || "N/A"} />
                    </div>
                    <div className="form-control w-full">
                        <label className="label"><span className="label-text font-medium text-base-content/70">Hire Date</span></label>
                        <input type="text" className="input input-bordered w-full bg-base-200 text-base-content" disabled value={staff.profile?.hireDate ? new Date(staff.profile.hireDate).toLocaleDateString() : 'N/A'} />
                    </div>
                </div>

                {role === StaffRole.Teacher && (
                    <div className="mt-8 border-t border-base-200 pt-6">
                        <div className="flex gap-2 items-center mb-4">
                            <h3 className="text-lg font-semibold">Professional Background</h3>
                            <div className="tooltip" data-tip="Can be configured by registrar/admin">
                                <CircleQuestionMark className="w-4 h-4 text-base-content/50" />
                            </div>
                        </div>
                        {staff.profile?.teacherDetails ? (
                            <div className="space-y-6">
                                {staff.profile.teacherDetails.specializations && staff.profile.teacherDetails.specializations.length > 0 && (
                                    <div className="form-control">
                                        <label className="label"><span className="label-text font-medium text-base-content/70">Specializations</span></label>
                                        <div className="flex flex-wrap gap-2">
                                            {staff.profile.teacherDetails.specializations.map((spec, i) => (
                                                <span key={i} className="badge badge-neutral badge-lg">{spec}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {staff.profile.teacherDetails.masteralDegree && staff.profile.teacherDetails.masteralDegree.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-bold mb-2 uppercase tracking-wide text-base-content/50">Master's Degree</h4>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {staff.profile.teacherDetails.masteralDegree.map((deg, i) => (
                                                <li key={i} className="bg-base-200 p-3 rounded-lg text-sm border border-base-300">
                                                    <div className="font-semibold">{deg.field}</div>
                                                    <div className="text-xs opacity-70">{deg.institution} • {deg.yearCompleted}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {staff.profile.teacherDetails.doctoralDegree && staff.profile.teacherDetails.doctoralDegree.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-bold mb-2 uppercase tracking-wide text-base-content/50">Doctoral Degree</h4>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {staff.profile.teacherDetails.doctoralDegree.map((deg, i) => (
                                                <li key={i} className="bg-base-200 p-3 rounded-lg text-sm border border-base-300">
                                                    <div className="font-semibold">{deg.field}</div>
                                                    <div className="text-xs opacity-70">{deg.institution} • {deg.yearCompleted}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-base-content/70 italic">No teacher details available.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

