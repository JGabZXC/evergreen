import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../../shared/animations";
import NewsWidget from "../components/NewsWidget";
import ProfileSummary from "../components/ProfileSummary";
import AdviserCard from "../components/AdviserCard";
import EnrollmentList from "../components/EnrollmentList";
import { useNavigate } from "react-router";
import { useAnnouncements } from "../../../shared/hooks/useAnnouncements";
import { useEffect, useState } from "react";
import { studentService } from "../services/studentService";
import type { Section, Student, SubjectTaken } from "../../../shared/types";

export function DashboardStudent() {
  const navigate = useNavigate();
  const { announcements } = useAnnouncements();

  const [student, setStudent] = useState<Student | null>(null);
  const [subjectsTaken, setSubjectsTaken] = useState<SubjectTaken[]>([]);
  const [loading, setLoading] = useState(true);

  console.log(announcements, student, subjectsTaken);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentData, gradesData] = await Promise.all([
          studentService.getDashboardData(),
          studentService.getGrades(),
        ]);

        let enrichedGrades = gradesData;

        if (studentData.latestEnrollment) {
          const { schoolYear, semester } = studentData.latestEnrollment;
          try {
            const { schedules } = await studentService.getSchedules(
              schoolYear,
              semester
            );

            enrichedGrades = gradesData.map((grade) => {
              const subjectId =
                typeof grade.subject === "object"
                  ? grade.subject._id
                  : grade.subject;

              const matchedSchedule = schedules.find((s) => {
                const sSubjectId =
                  typeof s.subject === "object" ? s.subject._id : s.subject;
                const sTeacherId =
                  typeof s.teacherId === "object"
                    ? (s.teacherId as any)._id
                    : s.teacherId;
                return (
                  sSubjectId === subjectId && sTeacherId === grade.teacherId
                );
              });

              if (matchedSchedule) {
                const scheduleStr = matchedSchedule.schedules
                  .map(
                    (slot) => `${slot.day} ${slot.startTime}-${slot.endTime}`
                  )
                  .join(", ");

                // Extract room from the first schedule slot if available
                // The backend populates schedules.room, so it should be a Room object
                const room = matchedSchedule.schedules[0]?.room;

                return {
                  ...grade,
                  schedule: scheduleStr,
                  classroomId: room || grade.classroomId,
                };
              }
              return grade;
            });
          } catch (err) {
            console.error("Failed to fetch schedules", err);
          }
        }

        setStudent(studentData);
        setSubjectsTaken(enrichedGrades);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="alert alert-error shadow-lg max-w-2xl mx-auto mt-10">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current flex-shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Error loading profile. Please try again later.</span>
        </div>
      </div>
    );
  }

  const currentEnrollment = student.latestEnrollment;
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
          <p className="text-sm font-mono text-base-content/60">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          {currentEnrollment && (
            <p className="text-xs text-primary font-bold uppercase tracking-wider">
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>
              Your profile is incomplete. Please update your profile to
              continue.
            </span>
          </div>
          <div className="flex-none">
            <button
              onClick={() => navigate("/student/profile/create")}
              className="btn btn-sm btn-primary"
            >
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
