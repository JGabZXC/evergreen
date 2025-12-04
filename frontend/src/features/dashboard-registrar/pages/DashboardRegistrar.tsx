import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  UserPlus,
  CalendarClock,
  Users,
  Menu,
  BookA,
  BookCopy,
} from "lucide-react";
import DashboardOverview from "../components/DashboardOverview";
import ManualEnrollment from "../components/ManualEnrollment";
import TeacherScheduling from "../components/TeacherScheduling";
import StudentRecords from "../components/StudenRecords";
import SubjectList from "../components/SubjectList";
import { pageVariants } from "../../../shared/animations";
import { Link } from "react-router";
import SidebarItem from "../components/SidebarItem";
import CourseList from "../components/CourseList";

export default function DashboardRegistrar() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "enrollment":
        return <ManualEnrollment />;
      case "scheduling":
        return <TeacherScheduling />;
      case "records":
        return <StudentRecords />;
      case "subjects":
        return <SubjectList />;
      case "courses":
        return <CourseList />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <section className="min-h-screen bg-base-200 text-base-content font-sans transition-colors duration-300">
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 bg-base-100 border-r border-base-300 shadow-xl h-screen flex flex-col z-20 overflow-hidden"
      >
        <div className="h-16 flex items-center shrink-0">
          <div className="min-w-20 h-full flex items-center justify-center shrink-0">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="btn btn-square btn-ghost btn-sm"
            >
              <Menu size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden whitespace-nowrap">
            <motion.span
              animate={{ opacity: isSidebarOpen ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-xl font-bold text-primary block"
            >
              <Link to="/">Evergreen</Link>
            </motion.span>
          </div>
        </div>

        {/* Added min-h-0 to prevent flex overflow issues */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 min-h-0">
          <SidebarItem
            icon={LayoutDashboard}
            label="Dashboard"
            isActive={activeTab === "dashboard"}
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab("dashboard")}
          />
          <SidebarItem
            icon={UserPlus}
            label="Enrollment"
            isActive={activeTab === "enrollment"}
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab("enrollment")}
          />
          <SidebarItem
            icon={CalendarClock}
            label="Scheduling"
            isActive={activeTab === "scheduling"}
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab("scheduling")}
          />
          <SidebarItem
            icon={Users}
            label="Student Records"
            isActive={activeTab === "records"}
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab("records")}
          />
          <SidebarItem
            icon={BookA}
            label="Subject List"
            isActive={activeTab === "subjects"}
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab("subjects")}
          />
          <SidebarItem
            icon={BookCopy}
            label="Course List"
            isActive={activeTab === "courses"}
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab("courses")}
          />
        </nav>

        <div className="h-16 border-t border-base-300 flex items-center shrink-0 bg-base-100 relative z-10">
          <div className="min-w-20 h-full flex items-center justify-center shrink-0">
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-10">
                <span>JD</span>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden whitespace-nowrap">
            <motion.div
              animate={{ opacity: isSidebarOpen ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm font-semibold">Jane Doe</p>
              <p className="text-xs text-base-content/60">Registrar Admin</p>
            </motion.div>
          </div>
        </div>
      </motion.aside>

      <motion.div
        animate={{ marginLeft: isSidebarOpen ? 260 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-1 p-4 md:p-8 min-h-screen"
      >
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              {activeTab === "dashboard"
                ? "Overview"
                : activeTab === "enrollment"
                ? "Manual Enrollment"
                : activeTab === "scheduling"
                ? "Class Scheduling"
                : activeTab === "records"
                ? "Student Records"
                : activeTab === "subjects"
                ? "Subject List"
                : activeTab === "courses"
                ? "Course List"
                : "Dashboard"}
            </h1>
            <p className="text-base-content/70 mt-1">
              Manage your school's data efficiently.
            </p>
          </div>
          <div className="badge badge-lg p-4 shadow-sm bg-base-100 dark:bg-white/10">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
