import useMyCurriculum from '../hooks/useMyCurriculum';
import Loading from '../../../shared/components/Loading';
import type { CurriculumItem } from '../../../shared/types';

export default function MyCurriculumChecklist() {
    const { myCurriculum, loading, error } = useMyCurriculum();

    if (loading) {
        return (
            <div className="flex justify-center items-center p-10">
                <Loading />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                <p className="font-bold">Error loading curriculum</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    if (!myCurriculum || !myCurriculum.curriculum) {
        return (
            <div className="p-10 text-center text-gray-500">
                <p>No curriculum record found for your account.</p>
            </div>
        );
    }

    const groupedCurriculum: Record<string, CurriculumItem[]> = myCurriculum.curriculum.reduce((acc, item) => {
        const { gradeLevel } = item;
        if (!acc[gradeLevel]) {
            acc[gradeLevel] = [];
        }
        acc[gradeLevel].push(item);
        return acc;
    }, {} as Record<string, CurriculumItem[]>);

    return (
        <div className="bg-white shadow-sm rounded-lg p-6 max-w-5xl mx-auto mt-8 border border-gray-100">
            {/* Header: Course Name and Code */}
            <div className="border-b border-emerald-100 pb-4 mb-6">
                <h1 className="text-2xl font-bold text-emerald-800">{myCurriculum.name}</h1>
                <div className="inline-block bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm font-semibold mt-1">
                    {myCurriculum.code}
                </div>
            </div>

            {/* List Grouped by Grade Level */}
            <div className="space-y-10">
                {Object.entries(groupedCurriculum).map(([gradeLevel, curriculumItems]) => (
                    <div key={gradeLevel} className="space-y-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-gray-800 shrink-0">{gradeLevel}</h2>
                            <div className="h-px bg-gray-200 w-full"></div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {curriculumItems.map((semesterBlock) => (
                                <div key={semesterBlock._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4">
                                        Semester {semesterBlock.semester}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {semesterBlock.subject.map((sub) => (
                                            <div
                                                key={sub._id}
                                                className="bg-white p-3 rounded shadow-sm border border-gray-100 flex items-center hover:border-emerald-300 transition-colors"
                                            >
                                                <span className="text-xs font-mono font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded mr-3">
                                                    {sub.subjectId}
                                                </span>
                                                <span className="text-sm font-medium text-gray-700">
                                                    {sub.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}