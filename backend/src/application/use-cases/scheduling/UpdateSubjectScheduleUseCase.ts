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

    // 5. Check Teacher Conflicts (if schedules updated)
    if (updates.schedules) {
      for (const newSlot of mergedData.schedules) {
        if (newSlot.teacherId && newSlot.teacherId !== "TBA") {
          // Find schedules where this teacher is teaching on the same day (excluding self)
          const teacherConflicts = await SubjectScheduleModel.find({
            _id: { $ne: scheduleId }, // Exclude self
            "schedules.teacherId": newSlot.teacherId,
            "schedules.day": newSlot.day,
            schoolYear: mergedData.schoolYear,
            semester: mergedData.semester,
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
    }

    // 6. Perform Update
    const updatedSchedule = await SubjectScheduleModel.findByIdAndUpdate(
      scheduleId,
      { $set: updates },
      { new: true, session: session || null }
    );

    // 7. Sync Teacher with SubjectTaken (if teacher changed)
    // REMOVED: We no longer store teacherId in SubjectTaken.
    // The link is dynamic via scheduleId.

    return updatedSchedule;
  }
}
