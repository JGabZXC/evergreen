import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Users, Clock, Calendar } from "lucide-react";
import StatsCard from "../components/StatsCard";
import FacultyTasks from "../components/FacultyTasks";
import UpcomingClasses from "../components/UpcomingClasses";
import RecentAnnouncements from "../components/RecentAnnouncements";
import SectionStudentList from "../components/SectionStudentList";
import HomeroomAnnouncements from "../components/HomeroomAnnouncements";
import { useAuth } from "../../auth/hooks/useAuth";
import { getCurrentSchoolYear } from "../../../utils/schoolYear";
import TeachingLoadTable from "../components/TeachingLoadTable";
import Gradebook from "../components/GradeBook";
import { pageVariants } from "../../../shared/animations";
import { Semester } from "../../../shared/types/index.ts";
import { useTeacherSchedule } from "../hooks/useTeacherSchedule";

export function DashboardTeacher() {
  const { user } = useAuth();
  const { schedules, loading } = useTeacherSchedule();
  const [selectedClass, setSelectedClass] = useState<{
    scheduleId: string;
    subjectName: string;
    semester: Semester;
  } | null>(null);
  const [currentSemester, setCurrentSemester] = useState<Semester>(
    Semester.First
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 p-4 md:p-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content">
            Faculty Dashboard
          </h1>
          <p className="text-base-content/70">
            Welcome back,{" "}
            <span className="font-semibold text-primary">{user?.email}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-base-200 px-4 py-2 rounded-lg shadow-sm">
          <Calendar className="text-primary" size={20} />
          <div className="text-right">
            <p className="text-xs text-base-content/60 uppercase font-bold">
              School Year
            </p>
            <p className="font-bold text-base-content">
              {getCurrentSchoolYear()}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Classes"
          value="8"
          icon={<BookOpen size={24} />}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatsCard
          title="Total Students"
          value="245"
          icon={<Users size={24} />}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatsCard
          title="Pending Grades"
          value="3"
          icon={<Clock size={24} />}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (Teaching Load / Gradebook) */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {selectedClass ? (
              <Gradebook
                key="gradebook"
                scheduleId={selectedClass.scheduleId}
                subjectName={selectedClass.subjectName}
                semester={selectedClass.semester}
                onBack={() => setSelectedClass(null)}
              />
            ) : (
              <TeachingLoadTable
                key="teaching-load"
                schedules={schedules}
                loading={loading}
                selectedSemester={currentSemester}
                onSemesterChange={setCurrentSemester}
                onSelectClass={(scheduleId, subjectName, semester) =>
                  setSelectedClass({ scheduleId, subjectName, semester })
                }
              />
            )}
          </AnimatePresence>
          <SectionStudentList />
          <HomeroomAnnouncements />
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <UpcomingClasses
            schedules={schedules}
            loading={loading}
            selectedSemester={currentSemester}
          />
          <RecentAnnouncements />
          <FacultyTasks
            tasks={[
              {
                id: "1",
                title: "Submit Midterm Grades",
                deadline: "Oct 25",
                type: "grading",
                priority: "high",
              },
              {
                id: "2",
                title: "Department Meeting",
                deadline: "Oct 28",
                type: "admin",
                priority: "normal",
              },
            ]}
          />
        </div>
      </div>
    </motion.div>
  );
}
