import {useMyProfile} from "../hooks/useMyProfile.ts";
import type {Address} from "../types";
import SimpleLoading from "./SimpleLoading.tsx";
import {StudentRole} from "../../features/auth/types/auth.types.ts";

export default function MyAccount() {
    const {profile, loading, error} = useMyProfile();

    // Determine ID (Employee vs Student)
    let displayId = "N/A";
    if (profile?.staff) displayId = profile.staff.employeeId;
    if (profile?.student) displayId = profile.student.studentId;

    const formatAddress = (addr?: Address) => {
        if (!addr) return "N/A";
        return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
    };

    return (
        <section className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-base-content">My Account</h1>
            </div>

            <div className="min-h-screen">
                {loading ? (
                    <SimpleLoading/>
                ) : error ? (
                    <div className="text-center">
                        <p className="text-xl font-bold text-base-content">{error}</p>
                    </div>
                ) : <div className="space-y-6">
                    {/* Account Info */}
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Account Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">ID</legend>
                                <input type="text" className="input w-full" disabled value={profile?._id}/>
                            </fieldset>
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">Email</legend>
                                <input type="text" className="input w-full" disabled value={profile?.email}/>
                            </fieldset>
                            <fieldset className="fieldset">
                                <legend
                                    className="fieldset-legend">{profile?.role !== StudentRole.Student ? "Employee ID" : "Student ID"}</legend>
                                <input type="text" className="input w-full" disabled value={displayId}/>
                            </fieldset>
                        </div>
                    </div>

                    {profile && (
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">First Name</legend>
                                    <input type="text" className="input w-full" disabled
                                           value={profile.student?.profile?.firstName || profile.staff?.profile?.firstName || "N/A"}/>
                                </fieldset>
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Last Name</legend>
                                    <input type="text" className="input w-full" disabled
                                           value={profile.student?.profile?.firstName || profile.staff?.profile?.firstName || "N/A"}/>
                                </fieldset>
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Date Of Birth</legend>
                                    <input type="text" className="input w-full" disabled
                                           value={profile.student?.profile?.firstName || profile.staff?.profile?.firstName || "N/A"}/>
                                </fieldset>
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Phone Number</legend>
                                    <input type="text" className="input w-full" disabled
                                           value={profile.student?.profile?.firstName || profile.staff?.profile?.firstName || "N/A"}/>
                                </fieldset>
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Address</legend>
                                    <input type="text" className="input w-full" disabled
                                           value={formatAddress() || "N/A"}/>
                                </fieldset>
                            </div>
                        </div>
                    )}

                    {/* User Specific Additional Info */}
                    {profile?.staff && (
                        <>

                            <div>
                                <h2 className="text-lg font-semibold mb-2">Employment Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <fieldset className="fieldset">
                                        <legend className="fieldset-legend">Department</legend>
                                        <input type="text" className="input w-full" disabled
                                               value={profile.staff?.department || "N/A"}/>
                                    </fieldset>
                                    <fieldset className="fieldset">
                                        <legend className="fieldset-legend">Hire Date</legend>
                                        <input type="text" className="input w-full" disabled
                                               value={profile.staff.profile?.hireDate ? new Date(profile.staff.profile.hireDate).toLocaleDateString() : 'N/A'}/>
                                    </fieldset>
                                </div>

                                {profile.staff.profile?.teacherDetails && (
                                    <div className="mt-4">
                                        <h3 className="text-md font-semibold mb-2">Professional Background</h3>
                                        {profile.staff.profile.teacherDetails.specializations && profile.staff.profile.teacherDetails.specializations.length > 0 && (
                                            <fieldset className="fieldset mb-4">
                                                <legend className="fieldset-legend">Specializations</legend>
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.staff.profile.teacherDetails.specializations.map((spec, i) => (
                                                        <span key={i} className="badge badge-neutral">{spec}</span>
                                                    ))}
                                                </div>
                                            </fieldset>
                                        )}
                                        {profile.staff.profile.teacherDetails.masteralDegree && profile.staff.profile.teacherDetails.masteralDegree.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="text-sm font-bold mb-1">Master's Degree</h4>
                                                <ul className="list-disc list-inside">
                                                    {profile.staff.profile.teacherDetails.masteralDegree.map((deg, i) => (
                                                        <li key={i}>{deg.field} - {deg.institution} ({deg.yearCompleted})</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {profile.staff.profile.teacherDetails.doctoralDegree && profile.staff.profile.teacherDetails.doctoralDegree.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-bold mb-1">Doctoral Degree</h4>
                                                <ul className="list-disc list-inside">
                                                    {profile.staff.profile.teacherDetails.doctoralDegree.map((deg, i) => (
                                                        <li key={i}>{deg.field} - {deg.institution} ({deg.yearCompleted})</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {profile?.student && (
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Student Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Course</legend>
                                    <input type="text" className="input w-full" disabled
                                           value={typeof profile.student.course === 'string' ? profile.student.course : profile.student.course.code}/>
                                </fieldset>
                            </div>

                            {profile.student.profile?.guardianDetails && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-2">Guardian Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend">Name</legend>
                                            <input type="text" className="input w-full" disabled
                                                   value={profile.student.profile.guardianDetails.name}/>
                                        </fieldset>
                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend">Contact</legend>
                                            <input type="text" className="input w-full" disabled
                                                   value={profile.student.profile.guardianDetails.contact}/>
                                        </fieldset>
                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend">Relation</legend>
                                            <input type="text" className="input w-full" disabled
                                                   value={profile.student.profile.guardianDetails.relation}/>
                                        </fieldset>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>}
            </div>
        </section>
    );
}
