import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import { type SubjectSchedule, Semester } from "../../../shared/types/index.ts";

interface UpcomingClass {
  subjectCode: string;
  subjectName: string;
  startTime: string;
  endTime: string;
  room: string;
  day: string;
  date: Date; // The actual date of the next occurrence
}

interface UpcomingClassesProps {
  schedules: SubjectSchedule[];
  loading: boolean;
  selectedSemester: Semester;
}

const UpcomingClasses = ({
  schedules,
  loading,
  selectedSemester,
}: UpcomingClassesProps) => {
  const [upcoming, setUpcoming] = useState<UpcomingClass[]>([]);

  useEffect(() => {
    if (!loading && schedules) {
      // Filter by semester first
      const filteredSchedules = schedules.filter(
        (s) => s.semester === selectedSemester
      );
      const processed = processUpcomingClasses(filteredSchedules);
      setUpcoming(processed);
    }
  }, [schedules, loading, selectedSemester]);

  const processUpcomingClasses = (
    schedules: SubjectSchedule[]
  ): UpcomingClass[] => {
    const now = new Date();
    const upcomingList: UpcomingClass[] = [];

    const dayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    schedules.forEach((schedule) => {
      const subject =
        typeof schedule.subject === "object" ? schedule.subject : null;
      if (!subject) return;

      schedule.schedules.forEach((slot) => {
        const slotDayIndex = dayMap[slot.day];
        if (slotDayIndex === undefined) return;

        // Calculate next occurrence
        const nextDate = new Date();
        const currentDayIndex = now.getDay();

        let daysUntil = slotDayIndex - currentDayIndex;
        if (daysUntil < 0) {
          daysUntil += 7;
        }

        // If it's today, check if time has passed
        if (daysUntil === 0) {
          const [hours, minutes] = parseTime(slot.startTime);
          const slotTime = new Date();
          slotTime.setHours(hours, minutes, 0, 0);

          if (slotTime < now) {
            daysUntil = 7; // Move to next week
          }
        }

        nextDate.setDate(now.getDate() + daysUntil);

        // Set time for sorting
        const [startHours, startMinutes] = parseTime(slot.startTime);
        nextDate.setHours(startHours, startMinutes, 0, 0);

        upcomingList.push({
          subjectCode: subject.subjectId,
          subjectName: subject.description || subject.name,
          startTime: slot.startTime,
          endTime: slot.endTime,
          room: typeof slot.room === "object" ? slot.room.name : "TBA",
          day: slot.day,
          date: nextDate,
        });
      });
    });

    // Sort by date
    return upcomingList
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  };

  const parseTime = (timeStr: string): [number, number] => {
    // Handle "HH:mm" or "HH:mm AM/PM"
    // Assuming 24h format for simplicity based on typical backend, but let's be robust
    // If format is "08:00" or "14:30"
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier) {
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
    }

    return [hours, minutes];
  };

  if (loading) return <div className="skeleton h-32 w-full"></div>;

  if (upcoming.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming Classes
          </h3>
          <p className="text-gray-500">No upcoming classes found.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="card bg-base-100 shadow-xl"
    >
      <div className="card-body">
        <h3 className="card-title text-lg flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-primary" />
          Upcoming Classes
        </h3>

        <div className="space-y-4 min-h-[400px] overflow-y-auto pr-2">
          {upcoming.map((cls, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4 p-3 bg-base-200 rounded-lg border-l-4 border-primary"
            >
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-base-content">
                    {cls.subjectCode}
                  </h4>
                  <span className="badge badge-sm badge-ghost">{cls.day}</span>
                </div>
                <p className="text-sm text-base-content/70 truncate">
                  {cls.subjectName}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {cls.startTime} - {cls.endTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {cls.room}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default UpcomingClasses;
