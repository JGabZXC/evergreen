import mongoose from "mongoose";
import { BaseSubjectSchedule } from "../../../domain/SubjectSchedule";
import { SubjectScheduleModel } from "../../../infrastructure/database/SubjectScheduleModel";
import { RoomModel } from "../../../infrastructure/database/RoomModel";
import { SubjectModel } from "../../../infrastructure/database/SubjectModel"; // Import SubjectModel
import {
  ConflictError,
  NotFoundError,
} from "../../../interfaces/http/middleware/HttpErrors";
import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";
import { ScheduleValidationService } from "../../services/ScheduleValidationService";

// Define a return type that includes the schedule and potential warnings
export interface ScheduleResult {
  schedule: any; // Replace 'any' with the specific Mongoose Document type if available
  warnings: string[];
}

export class ManageSubjectScheduleUseCase {
  async execute(
    data: BaseSubjectSchedule,
    session?: mongoose.ClientSession
  ): Promise<ScheduleResult> {
    const warnings: string[] = [];

    // 0. FETCH SUBJECT & VALIDATE SEMESTER AVAILABILITY
    // We check the subject definition to see if this is an "off-semester" class
    const subjectDef = await SubjectModel.findById(data.subject).session(
      session || null
    );

    if (!subjectDef) {
      throw new NotFoundError(`Subject with ID ${data.subject} not found`);
    }

    // Check if the schedule's semester is within the subject's available semesters
    // Assuming data.semester is a single value (e.g., 1) and semesterAvailable is an array (e.g., [1, 2])
    if (
      subjectDef.semesterAvailable &&
      !subjectDef.semesterAvailable.includes(data.semester)
    ) {
      warnings.push(
        `Warning: '${subjectDef.name}' is typically offered in Semester ${subjectDef.semesterAvailable.join(" or ")}, but is being scheduled for Semester ${data.semester}.`
      );
    }

    // 1. Validate Time Format & Logic
    ScheduleValidationService.validateTimeSlots(data.schedules);
    ScheduleValidationService.checkInternalDuplicates(data.schedules);

    // 2. CHECK ROOM EXISTENCE & EXTERNAL CONFLICTS
    for (const newSlot of data.schedules) {
      // Ensure Room Exists
      const room = await RoomModel.findById(newSlot.room).session(
        session || null
      );
      if (!room)
        throw new NotFoundError(`Room with ID ${newSlot.room} not found`);

      // Check DB for conflicts in this Room
      const roomConflicts = await SubjectScheduleModel.find({
        "schedules.room": newSlot.room,
        "schedules.day": newSlot.day,
        schoolYear: data.schoolYear,
        semester: data.semester,
      }).session(session || null);

      // Filter exact overlaps
      const flatConflicts = roomConflicts
        .flatMap((c) => c.schedules)
        .filter((s) => s.room.toString() === newSlot.room.toString());

      for (const existingSlot of flatConflicts) {
        if (ScheduleValidationService.isOverlap(newSlot, existingSlot)) {
          throw new ConflictError(
            `Room '${room.name}' is already occupied on ${newSlot.day} ${newSlot.startTime}-${newSlot.endTime}`
          );
        }
      }
    }

    // 3. CHECK TEACHER CONFLICTS (Per Slot)
    for (const newSlot of data.schedules) {
      if (newSlot.teacherId && newSlot.teacherId !== "TBA") {
        // Find schedules where this teacher is teaching on the same day
        const teacherConflicts = await SubjectScheduleModel.find({
          "schedules.teacherId": newSlot.teacherId,
          "schedules.day": newSlot.day,
          schoolYear: data.schoolYear,
          semester: data.semester,
        }).session(session || null);

        // Flatten and filter for the specific teacher
        const flatConflicts = teacherConflicts
          .flatMap((c) => c.schedules)
          .filter((s) => s.teacherId === newSlot.teacherId);

        for (const existingSlot of flatConflicts) {
          if (ScheduleValidationService.isOverlap(newSlot, existingSlot)) {
            throw new ConflictError(
              `Teacher (${newSlot.teacherId}) is already booked on ${newSlot.day} ${existingSlot.startTime}-${existingSlot.endTime}`
            );
          }
        }
      }
    }

    // 4. Create Schedule
    try {
      const [schedule] = await SubjectScheduleModel.create([data], {
        session: session || null,
      });

      if (schedule) {
        console.log(`Syncing schedules for subject ${data.subject}`);

        // Find SubjectTaken records that match this subject/year/semester
        // AND have no schedule yet.
        // Since we removed sectionId, we rely on the fact that students enrolled
        // but not yet assigned to a schedule should be assigned to this one.
        // NOTE: This logic assumes that if a student is enrolled in a subject,
        // and a new schedule is created, they belong to it if they don't have one.
        // This might need refinement if multiple schedules exist for the same subject
        // and we need to distinguish which students go where.

        await SubjectTakenModel.updateMany(
          {
            subject: new mongoose.Types.ObjectId(data.subject.toString()),
            schoolYear: data.schoolYear,
            semester: data.semester,
            scheduleId: { $exists: false }, // Only update those without a schedule
          },
          {
            $set: {
              scheduleId: schedule._id,
            },
          },
          session ? { session } : {}
        );
      }

      // Return both the created schedule and any warnings generated
      return { schedule, warnings };
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictError(
          "A schedule for this subject, school year, and semester already exists."
        );
      }
      throw error;
    }
  }
}
