import { FileTextIcon, GraduationCapIcon, UsersIcon } from "lucide-react";
import type { QuickStat } from "../types";

export default function StatsCard({ stats }: { stats: QuickStat[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="card bg-base-100 shadow-lg border border-base-200 dark:border-white/10"
        >
          <div className="card-body p-4 flex items-center justify-between flex-row">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">
                {stat.label}
              </p>
              <p className="text-2xl font-black text-primary">{stat.value}</p>
              {stat.trend && (
                <span className="text-xs text-success font-bold">
                  {stat.trend}
                </span>
              )}
            </div>
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              {stat.icon === "students" && <UsersIcon className="w-6 h-6" />}
              {stat.icon === "classes" && (
                <GraduationCapIcon className="w-6 h-6" />
              )}
              {stat.icon === "pending" && <FileTextIcon className="w-6 h-6" />}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
