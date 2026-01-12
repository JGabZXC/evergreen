import {useMySections} from "../hooks/useMySections.ts";
import {SchoolYearStatus} from "../../../shared/types";
import {useSchoolYears} from "../../../shared/hooks/useSchoolYears.ts";
import {useState} from "react";
import SimpleLoading from "../../../shared/components/SimpleLoading.tsx";

export default function MySections() {
    const [selectedSchoolYear, setSelectedSchoolYear] = useState("all");
    const {mySections, loading, error} = useMySections(selectedSchoolYear);
    const {schoolYears, loading: schoolYearsLoading} = useSchoolYears();

    return <section className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-base-content">My Sections</h1>

            <div className="flex gap-2">
                <select className="select select-bordered select-sm"
                        onChange={(e) => setSelectedSchoolYear(e.target.value)}>
                    <option value="all">All School Year</option>
                    {schoolYears.map((sy) => (
                        <option key={sy._id} value={sy.year}>
                            {sy.year} {sy.status === SchoolYearStatus.Active ? "(Active)" : ""}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        {loading || schoolYearsLoading ? (
            <SimpleLoading/>
        ) : error ? (
            <p className="text-error">Error: {error}</p>
        ) : (
            <div className="card bg-base-100 shadow-xl border border-base-200">
                <div className="overflow-x-auto border-2 border-base-200 dark:border-white/10 rounded-box min-h-screen">
                    <table className="table table-zebra w-full">
                        <thead>
                        <tr>
                            <th>Section Name</th>
                            <th>Grade Level</th>
                            <th>School Year</th>
                            <th>Designated Room</th>
                        </tr>
                        </thead>
                        <tbody>
                        {mySections.length > 0 ? (
                            mySections.map((section) => (
                                <tr key={section._id}>
                                    <td>{section.name}</td>
                                    <td>{section.gradeLevel}</td>
                                    <td>{section.schoolYear}</td>
                                    <td>{section.designatedRoom ? typeof section.designatedRoom === "object" ? section.designatedRoom.name : "N/A" : "N/A"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center">No sections found.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
    </section>
}