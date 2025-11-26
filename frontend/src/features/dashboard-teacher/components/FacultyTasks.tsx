import type { TaskItem } from "../types";

export default function FacultyTasks({ tasks }: { tasks: TaskItem[] }) {
  return (
    <div className="card bg-base-100 shadow-xl border border-base-200 h-full dark:border-white/10">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h3 className="card-title text-lg">Action Items</h3>
          <div className="badge badge-error badge-outline">
            {tasks.length} Pending
          </div>
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-base-200 hover:border-secondary transition-colors cursor-pointer bg-base-50"
            >
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-secondary"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-base-content">
                  {task.title}
                </p>
                <p className="text-xs text-gray-500">{task.deadline}</p>
              </div>
              {task.type === "grading" ? (
                <div className="badge badge-sm badge-warning">Grading</div>
              ) : (
                <div className="badge badge-sm badge-ghost">Admin</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
