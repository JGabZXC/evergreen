import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../../shared/animations";
import type { TeacherDashboardData } from "../types";
import TeacherProfileSummary from "../components/TeacherProfileSummary";
import StatsCard from "../components/StatsCard";
import TeachingLoadTable from "../components/TeachingLoadTable";
import FacultyTasks from "../components/FacultyTasks";
import { EventsWidget } from "../../dashboard-student/components/EventsWidget";

// --- MOCK DATA ---
const MOCK_DATA: TeacherDashboardData = {
  profile: {
    id: "t-1",
    name: "Prof. John Doe",
    employeeId: "EMP-9921",
    department: "College of Computer Studies",
    position: "Senior Lecturer",
    avatarUrl:
      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp", // Placeholder
  },
  stats: [
    { label: "Total Students", value: "142", icon: "students", trend: "+12%" },
    { label: "Classes Taught", value: "4", icon: "classes" },
    { label: "Pending Grades", value: "2", icon: "pending" },
  ],
  load: [
    {
      code: "CS 101",
      name: "Intro to Computing",
      schedule: "MW 08:00-09:30",
      room: "Lab 1",
      enrolled: 45,
    },
    {
      code: "CS 102",
      name: "Data Structures",
      schedule: "TTh 10:00-11:30",
      room: "Lab 3",
      enrolled: 38,
    },
    {
      code: "IT 205",
      name: "Web Development",
      schedule: "F 13:00-16:00",
      room: "Lab 5",
      enrolled: 40,
    },
    {
      code: "CS 300",
      name: "Thesis Advisory",
      schedule: "Sat 09:00-12:00",
      room: "Consultation Rm",
      enrolled: 19,
    },
  ],
  tasks: [
    {
      id: "1",
      title: "Grade CS 101 Midterms",
      deadline: "Due Tomorrow",
      priority: "high",
      type: "grading",
    },
    {
      id: "2",
      title: "Submit Syllabus for CS 102",
      deadline: "Due in 3 days",
      priority: "normal",
      type: "admin",
    },
    {
      id: "3",
      title: "Department Meeting",
      deadline: "Fri, 2:00 PM",
      priority: "normal",
      type: "admin",
    },
  ],
  news: [
    {
      id: "1",
      title: "Faculty Research Grant Open",
      summary: "Applications for the 2025 research grant are now accepted.",
      date: "Oct 20",
      category: "Research",
    },
    {
      id: "2",
      title: "New grading system update",
      summary: "System maintenance scheduled for this weekend.",
      date: "Oct 18",
      category: "Admin",
    },
  ],
  events: [
    {
      id: "1",
      title: "Faculty General Assembly",
      date: "Nov 15",
      location: "Main Hall",
      type: "academic",
    },
    {
      id: "2",
      title: "Curriculum Review",
      date: "Dec 01",
      location: "Conference Room A",
      type: "academic",
    },
  ],
};

export function DashboardTeacher() {
  const data = MOCK_DATA;

  return (
    <div className="p-6 bg-base-200/50 min-h-screen">
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Top Row: Profile & Stats */}
        <motion.div className="lg:col-span-1" variants={fadeInUp}>
          <TeacherProfileSummary profile={data.profile} />
        </motion.div>

        <motion.div className="lg:col-span-2" variants={fadeInUp}>
          <StatsCard stats={data.stats} />
        </motion.div>

        {/* Middle Row: Teaching Load & Tasks */}
        <motion.div className="lg:col-span-2" variants={fadeInUp}>
          <TeachingLoadTable classes={data.load} />
        </motion.div>

        <motion.div className="lg:col-span-1" variants={fadeInUp}>
          <FacultyTasks tasks={data.tasks} />
        </motion.div>

        {/* Bottom Row: Events & News */}
        <motion.div className="lg:col-span-1" variants={fadeInUp}>
          <EventsWidget events={data.events} />
        </motion.div>

        <motion.div className="lg:col-span-2" variants={fadeInUp}>
          {/* Reusing a simplified News View for Teacher */}
          <div className="card bg-base-100 shadow-xl border border-base-200 h-full dark:border-white/10">
            <div className="card-body">
              <h3 className="card-title mb-4">Faculty Announcements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.news.map((news) => (
                  <div
                    key={news.id}
                    className="border rounded-lg p-4 hover:bg-base-200 transition-colors"
                  >
                    <span className="badge badge-sm badge-secondary mb-2">
                      {news.category}
                    </span>
                    <h4 className="font-bold">{news.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{news.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
