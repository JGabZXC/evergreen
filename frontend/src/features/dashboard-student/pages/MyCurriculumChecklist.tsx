import useMyCurriculum from '../hooks/useMyCurriculum.tsx';
import type { CurriculumItem } from '../../../shared/types';
import SimpleLoading from "../../../shared/components/SimpleLoading.tsx";
import {CircleAlert} from "lucide-react";

export default function MyCurriculumChecklist() {
    const { myCurriculum, loading, error } = useMyCurriculum();

    return (
        <section className="p-4 md:p-6">
            {/* Page Header consistent with MyAccount */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-base-content">My Curriculum</h1>
            </div>

            <div className="min-h-[50vh] space-y-6">
                {loading ? (
                    <SimpleLoading />
                ) : error ? (
                    <div className="alert alert-error shadow-lg">
                        <CircleAlert className="h-6 w-6 text-red-500" />
                        <span>{error}</span>
                    </div>
                ) : !myCurriculum || !myCurriculum.curriculum ? (
                    <div className="alert shadow-sm border border-base-200">
                        <span>No curriculum record found for your account.</span>
                    </div>
                ) : (
                    <>
                        {/* Course Header Card */}
                        <div className="card bg-base-200/50 shadow-sm border border-base-200 mb-6">
                            <div className="card-body p-6">
                                <h2 className="card-title text-xl font-bold text-primary">
                                    {myCurriculum.name}
                                </h2>
                                <div className="badge badge-primary badge-outline font-semibold">
                                    {myCurriculum.code}
                                </div>
                            </div>
                        </div>

                        {/* Grouped Curriculum Data */}
                        <div className="space-y-10">
                            {Object.entries(groupData(myCurriculum.curriculum)).map(([gradeLevel, curriculumItems]) => (
                                <div key={gradeLevel} className="space-y-4">
                                    {/* Grade Level Header */}
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-xl font-bold text-base-content/80 shrink-0">
                                            {gradeLevel.replaceAll('COL-', 'Year ')}
                                        </h2>
                                        <div className="divider flex-grow"></div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        {curriculumItems.map((semesterBlock) => (
                                            <div key={semesterBlock._id} className="card bg-base-200/50 border border-base-200">
                                                <div className="p-4">
                                                    <h3 className="text-sm font-bold text-secondary uppercase tracking-widest mb-4">
                                                        Semester {semesterBlock.semester}
                                                    </h3>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {semesterBlock.subject.map((sub) => (
                                                            <div
                                                                key={sub._id}
                                                                className="flex items-center p-3 bg-base-100 rounded-lg border border-base-300 hover:border-primary/50 transition-all shadow-sm"
                                                            >
                                                                <span className="text-xs font-mono font-bold bg-base-300 text-base-content/70 px-2 py-1 rounded mr-3">
                                                                    {sub.subjectId}
                                                                </span>
                                                                <span className="text-sm font-medium text-base-content leading-tight">
                                                                    {sub.name}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

function groupData(items: CurriculumItem[]) {
    return items.reduce((acc, item) => {
        const { gradeLevel } = item;
        if (!acc[gradeLevel]) {
            acc[gradeLevel] = [];
        }
        acc[gradeLevel].push(item);
        return acc;
    }, {} as Record<string, CurriculumItem[]>);
}