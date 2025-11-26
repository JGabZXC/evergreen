import { motion } from "framer-motion";
import { Briefcase, Clock, Shield, Users } from "lucide-react";
import { cardVariants } from "../../../shared/animations";

export default function AppointerOverview() {
  const stats = [
    {
      label: "Total Teachers",
      value: "45",
      icon: Briefcase,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Admin Users",
      value: "8",
      icon: Shield,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "Support Staff",
      value: "24",
      icon: Users,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Recent Hires",
      value: "3",
      icon: Clock,
      color: "text-info",
      bg: "bg-info/10",
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
            className="card bg-base-100 shadow-md border border-base-200"
          >
            <div className="card-body p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-base-content/60">
                    {stat.label}
                  </p>
                  <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
