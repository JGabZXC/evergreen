import mongoose from "mongoose";
import { BaseSubjectSchedule } from "../../../domain/SubjectSchedule";
import { SubjectScheduleModel } from "../../../infrastructure/database/SubjectScheduleModel";
import { RoomModel } from "../../../infrastructure/database/RoomModel";
import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";
import {
  ConflictError,
  NotFoundError,
} from "../../../interfaces/http/middleware/HttpErrors";
import { ScheduleValidationService } from "../../services/ScheduleValidationService";

export class UpdateSubjectScheduleUseCase {
  async execute(
    scheduleId: string,
    updates: Partial<BaseSubjectSchedule>,
    session?: mongoose.ClientSession
  ) {
    // 1. Fetch Existing Schedule
    const existingSchedule = await SubjectScheduleModel.findById(
      scheduleId
    ).session(session || null);

    if (!existingSchedule) {
      throw new NotFoundError("Schedule not found");
    }

    // 2. Merge Data for Validation
    const mergedData = {
      ...existingSchedule.toObject(),
      ...updates,
    } as BaseSubjectSchedule;

    // 3. Validate Time Slots & Internal Logic (if schedules updated)
    if (updates.schedules) {
      ScheduleValidationService.validateTimeSlots(mergedData.schedules);
      ScheduleValidationService.checkInternalDuplicates(mergedData.schedules);

      // 4. Check Room Conflicts
      for (const newSlot of mergedData.schedules) {
        // Ensure Room Exists
        const room = await RoomModel.findById(newSlot.room).session(
          session || null
        );
        if (!room)
          throw new NotFoundError(`Room with ID ${newSlot.room} not found`);

        // Check DB for conflicts in this Room (Excluding current schedule)
        const roomConflicts = await SubjectScheduleModel.find({
          _id: { $ne: scheduleId }, // Exclude self
          "schedules.room": newSlot.room,
          "schedules.day": newSlot.day,
          schoolYear: mergedData.schoolYear,
          semester: mergedData.semester,
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
    }

    // 5. Check Teacher Conflicts (if teacher or schedules updated)
    if (
      (updates.teacherId || updates.schedules) &&
      mergedData.teacherId &&
      mergedData.teacherId !== "TBA"
    ) {
      const teacherConflicts = await SubjectScheduleModel.find({
        _id: { $ne: scheduleId }, // Exclude self
        teacherId: mergedData.teacherId,
        schoolYear: mergedData.schoolYear,
        semester: mergedData.semester,
      }).session(session || null);

      ScheduleValidationService.checkConflicts(
        mergedData.schedules,
        teacherConflicts,
        `Teacher (${mergedData.teacherId}) is already booked`
      );
    }

    // 6. Perform Update
    const updatedSchedule = await SubjectScheduleModel.findByIdAndUpdate(
      scheduleId,
      { $set: updates },
      { new: true, session: session || null }
    );

    // 7. Sync Teacher with SubjectTaken (if teacher changed)
    if (
      updates.teacherId &&
      updates.teacherId !== existingSchedule.teacherId &&
      updates.teacherId !== "TBA"
    ) {
      console.log(
        `Syncing teacher ${updates.teacherId} for subject ${existingSchedule.subject} schedules`
      );

      await SubjectTakenModel.updateMany(
        {
          subject: existingSchedule.subject,
          schoolYear: existingSchedule.schoolYear,
          semester: existingSchedule.semester,
        },
        {
          $set: { teacherId: updates.teacherId },
        },
        session ? { session } : {}
      );
    }

    return updatedSchedule;
  }
}
