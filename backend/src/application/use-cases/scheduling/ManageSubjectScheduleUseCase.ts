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

    // 3. CHECK TEACHER CONFLICTS
    if (data.teacherId && data.teacherId !== "TBA") {
      const teacherConflicts = await SubjectScheduleModel.find({
        teacherId: data.teacherId,
        schoolYear: data.schoolYear,
        semester: data.semester,
      }).session(session || null);

      ScheduleValidationService.checkConflicts(
        data.schedules,
        teacherConflicts,
        `Teacher (${data.teacherId}) is already booked`
      );
    }

    // 4. Create Schedule
    try {
      const [schedule] = await SubjectScheduleModel.create([data], {
        session: session || null,
      });

      if (schedule && schedule.teacherId !== "TBA") {
        console.log(
          `Syncing teacher ${schedule.teacherId} for subject ${data.subject} schedules`
        );

        await SubjectTakenModel.updateMany(
          {
            subject: new mongoose.Types.ObjectId(data.subject.toString()),
            schoolYear: data.schoolYear,
            semester: data.semester,
          },
          {
            $set: { teacherId: schedule.teacherId },
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
