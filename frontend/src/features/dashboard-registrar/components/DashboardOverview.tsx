import { motion } from "framer-motion";
import { BookOpen, GraduationCap, UserPlus, Users } from "lucide-react";
import { cardVariants } from "../../../shared/animations";

export default function DashboardOverview() {
  const stats = [
    {
      label: "Total Students",
      value: "2,543",
      icon: Users,
      color: "text-info",
      bg: "bg-info/10",
      trend: "+12% this sem",
      trendColor: "badge-success",
    },
    {
      label: "Pending Enrollments",
      value: "45",
      icon: UserPlus,
      color: "text-warning",
      bg: "bg-warning/10",
      trend: "Needs Attention",
      trendColor: "badge-warning",
    },
    {
      label: "Active Sections",
      value: "128",
      icon: BookOpen,
      color: "text-success",
      bg: "bg-success/10",
      trend: "Fully Staffed",
      trendColor: "badge-success",
    },
    {
      label: "Faculty Members",
      value: "86",
      icon: GraduationCap,
      color: "text-secondary",
      bg: "bg-secondary/10",
      trend: "3 On Leave",
      trendColor: "badge-neutral",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5 }}
            className="card bg-base-100 shadow-md border border-base-200 dark:border-white/10 dark:bg-white/10"
          >
            <div className="card-body p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-base-content/60">
                    {stat.label} test
                  </p>
                  <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
              </div>
              <div className="mt-4">
                <span className={`badge ${stat.trendColor} gap-1`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Mockup */}
      <div className="card bg-base-100 shadow-md border border-base-200 dark:border-white/50">
        <div className="card-body">
          <h3 className="card-title text-lg font-bold mb-4">
            Recent System Activity
          </h3>
          <ul className="space-y-4">
            {[1, 2, 3].map((item) => (
              <li key={item} className="flex gap-4 items-center">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <p className="text-sm text-base-content">
                  <span className="font-semibold">Admin</span> approved the
                  schedule for{" "}
                  <span className="font-semibold text-primary">BSCS 1-A</span>.
                </p>
                <span className="ml-auto text-xs text-base-content/50">
                  2 hours ago
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
