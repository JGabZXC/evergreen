import mongoose from "mongoose";
import { BaseSubjectSchedule } from "../../../domain/SubjectSchedule";
import { SubjectScheduleModel } from "../../../infrastructure/database/SubjectScheduleModel";
import { RoomModel } from "../../../infrastructure/database/RoomModel";
import {
  ConflictError,
  NotFoundError,
} from "../../../interfaces/http/middleware/HttpErrors";
import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";
import { ScheduleValidationService } from "../../services/ScheduleValidationService";

export class ManageSubjectScheduleUseCase {
  async execute(data: BaseSubjectSchedule, session?: mongoose.ClientSession) {
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
            `Room '${room.name}' is already occupied on ${newSlot.day} ${existingSlot.startTime}-${existingSlot.endTime}`
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
            subject: new mongoose.Types.ObjectId(data.subject.toString()), // Ensure ObjectId
            schoolYear: data.schoolYear,
            semester: data.semester,
          },
          {
            $set: { teacherId: schedule.teacherId },
          },
          session ? { session } : {}
        );
      }

      return schedule;
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
