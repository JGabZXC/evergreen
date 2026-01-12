import {useTeacherSchedule} from "../hooks/useTeacherSchedule.ts";
import {SchoolYearStatus} from "../../../shared/types";
import type {Room, Subject} from "../../../shared/types";
import {useSchoolYears} from "../../../shared/hooks/useSchoolYears.ts";
import {useState} from "react";

export default function MyClasses() {
    const [selectedSchoolYear, setSelectedSchoolYear] =  useState("all");
    const {schoolYears} = useSchoolYears();
    const {schedules,loading,error} = useTeacherSchedule(selectedSchoolYear);

    return <section className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-base-content">My Classes</h1>

            <div className="flex gap-2">
                <select className="select select-bordered select-sm"
                        onChange={(e) => setSelectedSchoolYear(e.target.value)}>
                    <option value="all">All School Year</option>
                    {schoolYears.map((sy) => (
                        <option key={sy._id} value={sy.year} >
                            {sy.year} {sy.status === SchoolYearStatus.Active ? "(Active)" : ""}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="overflow-x-auto border-2 border-base-200 dark:border-white/10 rounded-box min-h-screen">
                <table className="table w-full">
                    <thead >
                    <tr>
                        <th>Subject Code</th>
                        <th>Description</th>
                        <th>Schedule</th>
                        <th>Semester</th>
                        <th>School Year</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="text-center py-4">Loading...</td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan={5} className="text-center text-error py-4">{error}</td>
                        </tr>
                    ) : (
                        schedules.length > 0 ? (
                            schedules.map((schedule) => {
                                const subject = schedule.subject as Subject;
                                return (
                                    <tr key={schedule._id}>
                                        <td className="font-bold">{subject?.subjectId || 'N/A'}</td>
                                        <td>{subject?.name || 'N/A'}</td>
                                        <td>
                                            {schedule.schedules.map((slot, idx) => {
                                                const room = slot.room as Room;
                                                return (
                                                    <div key={idx} className="text-sm">
                                                        <span className="font-semibold text-primary">{slot.day}</span> {slot.startTime} - {slot.endTime}
                                                        <span className="ml-2 badge badge-ghost badge-sm">{room?.name || 'TBA'}</span>
                                                    </div>
                                                );
                                            })}
                                        </td>
                                        <td>{schedule.semester}</td>
                                        <td>{schedule.schoolYear}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-4">No classes found.</td>
                            </tr>
                        )
                    )
                    }
                    </tbody>
                </table>
            </div>
        </div>
    </section>
}