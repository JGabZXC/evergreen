import { Clock10Icon } from "lucide-react";
import type { SubjectTaken, Subject } from "../../../shared/types";

export interface EnrolledSubjectDisplay extends SubjectTaken {
  schedule?: string;
  room?: string;
}

export default function EnrollmentList({
  subjects,
}: {
  subjects: EnrolledSubjectDisplay[];
}) {
  return (
    <div className="card bg-base-100 shadow-md border border-base-200 h-full dark:border-white/10">
      <div className="card-body">
        <div className="flex justify-between items-center mb-2">
          <h3 className="card-title">Current Enrollment</h3>
          <span className="badge badge-primary">
            {subjects.length} Subjects
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject</th>
                <th>Schedule</th>
                <th>Room</th>
                <th className="text-center">Grade</th>
                <th className="text-right">Units</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((st) => {
                const subject = st.subject as Subject;

                return (
                  <tr key={st._id}>
                    <td className="font-bold text-primary">
                      {subject.subjectId}
                    </td>
                    <td className="font-medium">{subject.name}</td>
                    <td className="text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock10Icon className="w-3 h-3" />
                        {st.schedule || "TBA"}
                      </div>
                    </td>
                    <td className="text-sm text-gray-500">
                      {st.room || "TBA"}
                    </td>
                    <td className="text-center font-mono">
                      {st.finalGrade ? (
                        <span
                          className={
                            st.finalGrade <= 3.0 || st.finalGrade >= 75
                              ? "text-success"
                              : "text-error"
                          }
                        >
                          {st.finalGrade}
                        </span>
                      ) : (
                        <span className="badge badge-ghost badge-sm">
                          {st.status}
                        </span>
                      )}
                    </td>
                    {/* <td className="text-right font-mono">{subject.units}</td> */}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
