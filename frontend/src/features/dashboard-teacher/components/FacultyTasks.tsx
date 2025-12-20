import type { TaskItem } from "../types";
import { motion } from "framer-motion";
import { CheckCircle2, Clock } from "lucide-react";

export default function FacultyTasks({ tasks }: { tasks: TaskItem[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="card bg-base-100 shadow-xl"
    >
      <div className="card-body">
        <div className="flex justify-between items-center mb-6">
          <h3 className="card-title text-lg flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-secondary" />
            Action Items
          </h3>
          <div className="badge badge-secondary badge-outline">
            {tasks.length} Pending
          </div>
        </div>

        <div className="space-y-2 min-h-[400px] max-h-[400px] overflow-y-auto pr-2">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-colors cursor-pointer group"
            >
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-secondary"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm group-hover:text-secondary transition-colors">
                  {task.title}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Clock className="w-3 h-3" />
                  {task.deadline}
                </div>
              </div>
              {task.type === "grading" ? (
                <div className="badge badge-sm badge-warning">Grading</div>
              ) : (
                <div className="badge badge-sm badge-ghost">Admin</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
