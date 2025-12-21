import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../../shared/animations";
import NewsWidget from "../components/NewsWidget";
import ProfileSummary from "../components/ProfileSummary";
import AdviserCard from "../components/AdviserCard";
import EnrollmentList from "../components/EnrollmentList";
import { useNavigate } from "react-router";
import { useAnnouncements } from "../../../shared/hooks/useAnnouncements";
import { useMemo } from "react";
import type { Section } from "../../../shared/types";
import { useStudentProfile } from "../hooks/useStudentProfile";
import { useStudentSchedule } from "../hooks/useStudentSchedule";
import { AlertCircle, Calendar, UserPlus } from "lucide-react";

export function DashboardStudent() {
  const navigate = useNavigate();
  const { announcements } = useAnnouncements();

  const {
    student,
    loading: profileLoading,
    error: profileError,
  } = useStudentProfile();

  const currentEnrollment = student?.latestEnrollment;
  const schoolYear = currentEnrollment?.schoolYear;
  const semester = currentEnrollment?.semester;

  const { scheduleData, loading: scheduleLoading } = useStudentSchedule(
    schoolYear,
    semester
  );
  console.log(scheduleData);

  const subjectsTaken = useMemo(() => {
    if (!scheduleData) return [];
    const { enrolledSubjects, schedules } = scheduleData;

    return enrolledSubjects.map((grade) => {
      const subjectId =
        typeof grade.subject === "object" ? grade.subject._id : grade.subject;

      const matchedSchedule = schedules.find((s) => {
        const sSubjectId =
          typeof s.subject === "object" ? s.subject._id : s.subject;
        // teacherId in SubjectSchedule might be populated or string
        const sTeacherId =
          typeof s.teacherId === "object"
            ? (s.teacherId as any)._id
            : s.teacherId;
        return sSubjectId === subjectId && sTeacherId === grade.teacherId;
      });

      if (matchedSchedule) {
        const scheduleStr = matchedSchedule.schedules
          .map((slot) => `${slot.day} ${slot.startTime}-${slot.endTime}`)
          .join(", ");

        const room = matchedSchedule.schedules[0]?.room;

        return {
          ...grade,
          schedule: scheduleStr,
          classroomId: room || grade.classroomId,
        };
      }
      return grade;
    });
  }, [scheduleData]);

  const loading = profileLoading || (!!student && scheduleLoading);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (profileError || !student) {
    return (
      <div className="alert alert-error shadow-lg max-w-2xl mx-auto mt-10">
        <div>
          <AlertCircle className="stroke-current flex-shrink-0 h-6 w-6" />
          <span>
            {profileError || "Error loading profile. Please try again later."}
          </span>
        </div>
      </div>
    );
  }

  const section =
    typeof currentEnrollment?.section === "object"
      ? (currentEnrollment.section as Section)
      : undefined;

  return (
    <motion.div
      className="p-6 max-w-7xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Header Section */}
      <motion.div
        variants={fadeInUp}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-base-content">
            Student Dashboard
          </h1>
          <p className="text-base-content/60">
            Welcome back, {student.profile?.firstName || "Student"}!
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-mono text-base-content/60 flex items-center justify-end gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          {currentEnrollment && (
            <p className="text-xs text-primary font-bold uppercase tracking-wider mt-1">
              {currentEnrollment.schoolYear} •{" "}
              {currentEnrollment.semester === 1
                ? "1st"
                : currentEnrollment.semester === 2
                ? "2nd"
                : "Summer"}{" "}
              Semester
            </p>
          )}
        </div>
      </motion.div>

      {!student.profile && (
        <motion.div
          variants={fadeInUp}
          className="alert alert-warning shadow-lg"
        >
          <div>
            <AlertCircle className="stroke-current flex-shrink-0 h-6 w-6" />
            <span>
              Your profile is incomplete. Please update your profile to
              continue.
            </span>
          </div>
          <div className="flex-none">
            <button
              onClick={() => navigate("/student/profile/create")}
              className="btn btn-sm btn-primary gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Create Profile
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <motion.div variants={fadeInUp} className="space-y-6 lg:col-span-2">
          <ProfileSummary student={student} />
          <EnrollmentList subjects={subjectsTaken} />
        </motion.div>

        {/* Right Column */}
        <motion.div variants={fadeInUp} className="space-y-6">
          {section && <AdviserCard section={section} />}
          <NewsWidget announcements={announcements} />
        </motion.div>
      </div>
    </motion.div>
  );
}
