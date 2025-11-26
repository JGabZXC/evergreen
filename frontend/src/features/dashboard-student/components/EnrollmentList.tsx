import { Clock10Icon } from "lucide-react";
import type { CourseEnrollment } from "../types";

export default function EnrollmentList({
  courses,
}: {
  courses: CourseEnrollment[];
}) {
  return (
    <div className="card bg-base-100 shadow-md border border-base-200 h-full dark:border-white/10">
      <div className="card-body">
        <div className="flex justify-between items-center mb-2">
          <h3 className="card-title">Current Enrollment</h3>
          <span className="badge badge-primary">{courses.length} Courses</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject</th>
                <th>Schedule</th>
                <th>Room</th>
                <th className="text-right">Units</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.code}>
                  <td className="font-bold text-primary">{course.code}</td>
                  <td className="font-medium">{course.name}</td>
                  <td className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock10Icon className="w-3 h-3" /> {course.schedule}
                  </td>
                  <td className="text-sm text-gray-500">{course.room}</td>
                  <td className="text-right font-mono">{course.units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
