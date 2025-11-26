import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, UserPlus, Users, Menu } from "lucide-react";
import AppointerOverview from "../components/AppointerOverview";
import AccountCreation from "../components/AccountCreation";
import StaffDirectory from "../components/StaffDirectory";
import SidebarItem from "../components/SidebarItem";
import { pageVariants } from "../../../shared/animations";

export default function DashboardAppointer() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "create" | "directory"
  >("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <AppointerOverview />;
      case "create":
        return <AccountCreation />;
      case "directory":
        return <StaffDirectory />;
      default:
        return <AppointerOverview />;
    }
  };

  return (
    <section className="flex min-h-screen bg-base-200 text-base-content font-sans transition-colors duration-300">
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-base-100 border-r border-base-300 shadow-xl h-screen flex flex-col fixed top-0 left-0 z-20"
      >
        <div className="p-4 flex items-center justify-between h-16">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xl font-bold text-primary whitespace-nowrap"
              >
                Appointer
              </motion.span>
            )}
          </AnimatePresence>
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
            label="Overview"
            isActive={activeTab === "overview"}
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab("overview")}
          />
          <SidebarItem
            icon={UserPlus}
            label="Create Account"
            isActive={activeTab === "create"}
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab("create")}
          />
          <SidebarItem
            icon={Users}
            label="Staff Directory"
            isActive={activeTab === "directory"}
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab("directory")}
          />
        </nav>

        <div className="p-4 border-t border-base-300">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-10">
                <span>HR</span>
              </div>
            </div>
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-sm font-semibold">HR Manager</p>
                <p className="text-xs text-base-content/60">
                  Appointing Officer
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.aside>

      <div className="flex-1 ml-20 md:ml-[260px] p-4 md:p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              {activeTab === "overview"
                ? "HR Overview"
                : activeTab === "create"
                ? "Appoint New Personnel"
                : "Staff Directory"}
            </h1>
            <p className="text-base-content/70 mt-1">
              Manage appointments and user accounts.
            </p>
          </div>
          <div className="badge badge-lg p-4 shadow-sm bg-base-100">
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
