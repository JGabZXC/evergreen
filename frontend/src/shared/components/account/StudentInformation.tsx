import type { UserProfile } from "../../hooks/useMyProfile";

interface StudentInformationProps {
    profile: UserProfile;
}

export default function StudentInformation({ profile }: StudentInformationProps) {
    if (!profile.student) return null;
    const { student } = profile;

    return (
        <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-6">
                <h2 className="card-title text-xl font-bold mb-4 text-primary">Student Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="form-control w-full">
                        <label className="label"><span className="label-text font-medium text-base-content/70">Course</span></label>
                        <input type="text" className="input input-bordered w-full bg-base-200 text-base-content" disabled
                               value={typeof student.course === 'string' ? student.course : student.course.code} />
                    </div>
                </div>

                {student.profile?.guardianDetails && (
                    <div className="mt-8 border-t border-base-200 pt-6">
                        <h3 className="text-lg font-semibold mb-4">Guardian Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="form-control w-full">
                                <label className="label"><span className="label-text font-medium text-base-content/70">Name</span></label>
                                <input type="text" className="input input-bordered w-full bg-base-200 text-base-content" disabled value={student.profile.guardianDetails.name} />
                            </div>
                            <div className="form-control w-full">
                                <label className="label"><span className="label-text font-medium text-base-content/70">Contact</span></label>
                                <input type="text" className="input input-bordered w-full bg-base-200 text-base-content" disabled value={student.profile.guardianDetails.contact} />
                            </div>
                            <div className="form-control w-full">
                                <label className="label"><span className="label-text font-medium text-base-content/70">Relation</span></label>
                                <input type="text" className="input input-bordered w-full bg-base-200 text-base-content" disabled value={student.profile.guardianDetails.relation} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

