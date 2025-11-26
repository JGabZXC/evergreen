import { motion } from "framer-motion";
import type { DashboardData } from "../types/index";
import { fadeInUp, staggerContainer } from "../../../shared/animations";
import { EventsWidget } from "../components/EventsWidget";
import NewsWidget from "../components/NewsWidget";
import ProfileSummary from "../components/ProfileSummary";
import AdviserCard from "../components/AdviserCard";
import EnrollmentList from "../components/EnrollmentList";

// --- MOCK DATA ---
const MOCK_DATA: DashboardData = {
  profile: {
    id: "1",
    name: "Alex Rivera",
    studentId: "2023-00452",
    program: "BS Computer Science",
    yearLevel: "3rd Year",
    avatarUrl:
      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    gpa: 3.75,
  },
  adviser: {
    name: "Dr. Sarah Jenkins",
    email: "s.jenkins@university.edu",
    department: "College of Sciences",
    avatarUrl:
      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
  },
  enrollment: [
    {
      code: "CS 105",
      name: "Software Engineering",
      units: 3,
      schedule: "MW 10:00-11:30",
      room: "Lab 4",
    },
    {
      code: "CS 106",
      name: "Database Systems",
      units: 3,
      schedule: "TTh 13:00-14:30",
      room: "Lab 2",
    },
    {
      code: "MATH 50",
      name: "Linear Algebra",
      units: 3,
      schedule: "F 09:00-12:00",
      room: "Rm 301",
    },
  ],
  news: [
    {
      id: "1",
      title: "Campus Hackathon 2024",
      summary: "Join the annual coding competition this weekend.",
      date: "Oct 15",
      category: "Tech",
    },
    {
      id: "2",
      title: "Library Hours Extended",
      summary: "The main library will be open 24/7 for finals week.",
      date: "Oct 12",
      category: "General",
    },
  ],
  events: [
    {
      id: "1",
      title: "Career Fair",
      date: "Nov 05",
      location: "Main Hall",
      type: "academic",
    },
    {
      id: "2",
      title: "CS Org General Assembly",
      date: "Nov 10",
      location: "AVR 1",
      type: "extra",
    },
    {
      id: "3",
      title: "Year End Party",
      date: "Dec 15",
      location: "Gymnasium",
      type: "extra",
    },
  ],
  // [NEW] Task Data
  tasks: [
    {
      id: "1",
      title: "Final Project Proposal",
      courseCode: "CS 105",
      due: "Tomorrow",
      priority: "high",
    },
    {
      id: "2",
      title: "Normalization Quiz",
      courseCode: "CS 106",
      due: "Fri, Nov 24",
      priority: "normal",
    },
    {
      id: "3",
      title: "Vector Spaces Worksheet",
      courseCode: "MATH 50",
      due: "Mon, Nov 27",
      priority: "normal",
    },
  ],
};

export function DashboardStudent() {
  const data = MOCK_DATA;

  return (
    <div className="p-6 bg-base-200/50 min-h-screen">
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Top Row: Profile & Adviser */}
        <motion.div className="lg:col-span-2" variants={fadeInUp}>
          <ProfileSummary profile={data.profile} />
        </motion.div>

        <motion.div className="lg:col-span-1" variants={fadeInUp}>
          <AdviserCard adviser={data.adviser} />
        </motion.div>

        {/* Middle Row: Enrollment Table & News */}
        {/* Adjusted layout to keep table prominent but allow news side-by-side on large screens */}
        <motion.div className="lg:col-span-2" variants={fadeInUp}>
          <EnrollmentList courses={data.enrollment} />
        </motion.div>

        <motion.div className="lg:col-span-1" variants={fadeInUp}>
          <NewsWidget news={data.news} />
        </motion.div>

        {/* Bottom Row: Events (Full width container but styled as the list) */}
        <div className="lg:col-span-3 mt-4">
          {/* We use a specific container here to restrict width if needed, or keep it full */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              {/* Reusing the Events Widget Style from Homepage */}
              <EventsWidget events={data.events} />
            </div>

            {/* Optional: Placeholder for additional widgets (Grades, Tasks) */}
            <motion.div
              className="lg:col-span-2 card bg-base-100 border border-base-300 p-8 flex items-center justify-center text-gray-400 border-dashed dark:border-white/10"
              variants={fadeInUp}
            >
              {/* <div className="text-center">
                <p className="font-bold">Pending Tasks Widget</p>
                <p className="text-xs">No pending tasks for this week.</p>
              </div> */}

              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="card-title text-lg">Pending Tasks</h3>
                  <div className="badge badge-accent badge-outline">
                    {data.tasks.length} Due
                  </div>
                </div>

                <div className="space-y-1">
                  {data.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-base-200 hover:bg-base-200 hover:border-secondary transition-colors cursor-pointer group"
                    >
                      {/* Checkbox */}
                      <label className="cursor-pointer label p-0">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm checkbox-primary"
                        />
                      </label>

                      {/* Text Content */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium text-sm truncate group-hover:text-primary transition-colors ${
                            task.priority === "high" ? "text-error" : ""
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {task.courseCode}
                        </p>
                      </div>

                      {/* Due Date Badge */}
                      <div
                        className={`badge text-xs whitespace-nowrap ${
                          task.priority === "high"
                            ? "badge-error badge-outline"
                            : "badge-ghost"
                        }`}
                      >
                        {task.due}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card-actions justify-center mt-auto pt-2">
                  <button className="btn btn-ghost btn-xs text-gray-400 font-normal">
                    View all assignments
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
