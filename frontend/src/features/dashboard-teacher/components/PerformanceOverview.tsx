import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

export default function PerformanceOverview() {
  // Static data for demonstration
  const performanceData = [
    { label: "Passed", value: 85, color: "progress-success", count: 208 },
    { label: "Failed", value: 5, color: "progress-error", count: 12 },
    { label: "Incomplete", value: 10, color: "progress-warning", count: 25 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="card bg-base-100 shadow-xl"
    >
      <div className="card-body">
        <h3 className="card-title text-lg flex items-center mb-6">
          <BarChart3 className="w-5 h-5 text-accent" />
          Student Performance
        </h3>

        <div className="min-h-[400px] max-h-[400px] overflow-y-auto flex flex-col justify-between pr-2">
          <div className="space-y-4">
            {performanceData.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-gray-500">
                    {item.count} Students ({item.value}%)
                  </span>
                </div>
                <progress
                  className={`progress ${item.color} w-full h-3`}
                  value={item.value}
                  max="100"
                ></progress>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-base-200">
            <div className="stat p-0">
              <div className="stat-title">Average Class Grade</div>
              <div className="stat-value text-2xl">88.5%</div>
              <div className="stat-desc text-success">
                ↗︎ 2% more than last sem
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
