import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  UserPlus,
  CalendarClock,
  Users,
  Menu,
} from "lucide-react";
import DashboardOverview from "../components/DashboardOverview";
import ManualEnrollment from "../components/ManualEnrollment";
import TeacherScheduling from "../components/TeacherScheduling";
import StudentRecords from "../components/StudenRecords";
import SidebarItem from "../components/SidebarItem";
import { pageVariants } from "../../../shared/animations";

export default function DashboardRegistrar() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "enrollment" | "scheduling" | "records"
  >("dashboard");
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
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <section className="flex min-h-screen bg-base-200 text-base-content font-sans transition-colors duration-300">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-base-100 border-r border-base-300 shadow-xl h-screen flex flex-col fixed top-0 left-0 z-20"
      >
        <div
          className={`p-4 flex items-center ${
            isSidebarOpen ? "justify-between" : "justify-center"
          } h-16`}
        >
          {isSidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xl font-bold text-primary whitespace-nowrap"
            >
              Evergreen
            </motion.span>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="btn btn-square btn-ghost btn-sm"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
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
        </nav>

        <div className="p-4 border-t border-base-300">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-10">
                <span>JD</span>
              </div>
            </div>
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-sm font-semibold">Jane Doe</p>
                <p className="text-xs text-base-content/60">Registrar Admin</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.aside>

      <div className="flex-1 ml-20 md:ml-[260px] p-4 md:p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              {activeTab === "dashboard"
                ? "Overview"
                : activeTab === "enrollment"
                ? "Manual Enrollment"
                : activeTab === "scheduling"
                ? "Class Scheduling"
                : "Student Records"}
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
      </div>
    </section>
  );
}
// 4. Student Records
