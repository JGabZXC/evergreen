import { useState } from "react";
import { useSchoolYears } from "../../../shared/hooks/useSchoolYears.ts";
import { SchoolYearStatus } from "../../../shared/types";
import { getCurrentSchoolYear } from "../../../utils/schoolYear";
import { useMyStudents } from "../hooks/useMyStudents.ts"; // Added .ts extension just in case
import {ChevronLeft, ChevronRight} from "lucide-react";

export default function MyStudents() {
    const { schoolYears } = useSchoolYears();
    const [selectedSchoolYear, setSelectedSchoolYear] = useState(getCurrentSchoolYear());
    const { students, loading, error, page, setPage, totalPages} = useMyStudents(selectedSchoolYear);

    return (
        <section className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-base-content">My Students</h1>

                <div className="form-control">
                    <select
                        className="select select-bordered select-sm w-full md:w-auto"
                        value={selectedSchoolYear}
                        onChange={(e) => setSelectedSchoolYear(e.target.value)}
                    >
                        <option value="" disabled>Select School Year</option>
                        {schoolYears.map((sy) => (
                            <option key={sy._id} value={sy.year}>
                                SY {sy.year} {sy.status === SchoolYearStatus.Active ? "(Active)" : ""}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-200">
                <div className="overflow-x-auto min-h-screen">
                    <table className="table table-zebra w-full">
                        <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Grade Level</th>
                            <th>Section</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8">
                                    <span className="loading loading-spinner loading-md"></span>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="text-center text-error py-8">{error}</td>
                            </tr>
                        ) : students.length === 0 ? (
                             <tr>
                                <td colSpan={5} className="text-center py-8 text-base-content/50">
                                    No students found for this school year.
                                </td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student._id} className="hover">
                                    <td className="font-mono font-bold">{student.studentId}</td>
                                    <td>
                                        <div className="font-bold">{student.profile?.firstName} {student.profile?.lastName}</div>
                                        <div className="text-xs opacity-50">{student.userId.email}</div>
                                    </td>
                                    <td>
                                        <div className="badge badge-ghost">{student.latestEnrollment?.gradeLevel || "N/A"}</div>
                                    </td>
                                    <td>
                                       {/* Section info might need to be populated more deeply or fetched */}
                                       {typeof student.latestEnrollment?.section === 'object' ? student.latestEnrollment.section.name : "N/A"}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && students.length > 0 && (
                    <div className="flex justify-between items-center p-4 border-t border-base-200">
                        <button
                            className="btn btn-sm btn-ghost gap-2"
                            disabled={page <= 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                        >
                            <ChevronLeft size={16}/> Previous
                        </button>
                        <span className="text-sm opacity-70">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            className="btn btn-sm btn-ghost gap-2"
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        >
                             Next <ChevronRight size={16}/>
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

