import { motion } from "framer-motion";
import { Bell, Megaphone } from "lucide-react";

const announcements = [
  {
    id: 1,
    title: "Midterm Grades Submission Deadline",
    date: "Oct 25, 2025",
    content: "Please ensure all midterm grades are submitted by 5:00 PM.",
    type: "urgent",
  },
  {
    id: 2,
    title: "Faculty Meeting",
    date: "Oct 28, 2025",
    content: "Monthly faculty meeting at the Conference Room A.",
    type: "normal",
  },
  {
    id: 3,
    title: "System Maintenance",
    date: "Nov 01, 2025",
    content: "The portal will be down for maintenance from 10 PM to 2 AM.",
    type: "info",
  },
];

export default function RecentAnnouncements() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="card bg-base-100 shadow-xl"
    >
      <div className="card-body">
        <h3 className="card-title text-lg flex items-center gap-2 mb-6">
          <Megaphone className="w-5 h-5 text-secondary" />
          Announcements
        </h3>

        <div className="space-y-4 min-h-[400px] overflow-y-auto pr-2">
          {announcements.map((item, index) => (
            <div
              key={item.id}
              className="relative pl-4 border-l-2 border-base-300"
            >
              <div
                className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${
                  item.type === "urgent"
                    ? "bg-error"
                    : item.type === "info"
                    ? "bg-info"
                    : "bg-secondary"
                }`}
              ></div>
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm">{item.title}</h4>
                <span className="text-xs text-gray-500">{item.date}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{item.content}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
