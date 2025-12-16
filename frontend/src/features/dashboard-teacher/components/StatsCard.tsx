import React from "react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string; // e.g., "text-primary"
  bgColor?: string; // e.g., "bg-primary/10"
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  bgColor = "bg-base-200",
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="stats shadow-lg border border-base-200 bg-base-100 w-full"
    >
      <div className="stat">
        <div className={`stat-figure ${color} p-2 rounded-full ${bgColor}`}>
          {icon}
        </div>
        <div className="stat-title text-base-content/70">{title}</div>
        <div className={`stat-value ${color}`}>{value}</div>
        <div className="stat-desc">From last semester</div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
