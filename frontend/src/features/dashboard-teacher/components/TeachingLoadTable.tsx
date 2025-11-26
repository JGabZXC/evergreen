import { Clock10Icon } from "lucide-react";
import type { TeachingLoad } from "../types";

export default function TeachingLoadTable({
  classes,
}: {
  classes: TeachingLoad[];
}) {
  return (
    <div className="card bg-base-100 shadow-xl border border-base-200 h-full dark:border-white/10">
      <div className="card-body">
        <div className="flex justify-between items-center mb-2">
          <h3 className="card-title">Teaching Load</h3>
          <button className="btn btn-xs btn-ghost">View Full Schedule</button>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Class</th>
                <th>Subject</th>
                <th>Schedule</th>
                <th>Room</th>
                <th className="text-right">Students</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls.code}>
                  <td className="font-bold text-secondary">{cls.code}</td>
                  <td className="font-medium">{cls.name}</td>
                  <td className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock10Icon className="w-3 h-3" /> {cls.schedule}
                  </td>
                  <td className="text-sm text-gray-500">{cls.room}</td>
                  <td className="text-right font-mono font-bold">
                    {cls.enrolled}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
