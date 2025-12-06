import mongoose from "mongoose";
import { BaseClassSchedule, TimeSlot } from "../../../domain/ClassSchedule";
import { ClassScheduleModel } from "../../../infrastructure/database/ClassScheduleModel";
import {
  ConflictError,
  BadRequestError,
} from "../../../interfaces/http/middleware/HttpErrors";

export class ManageClassScheduleUseCase {
  async execute(data: BaseClassSchedule, session?: mongoose.ClientSession) {
    // 1. Validate Time Format & Logic (Basic Sanity Check)
    this.validateTimeSlots(data.schedules);

    // 2. CHECK TEACHER CONFLICTS
    // "Is this teacher already teaching somewhere else at this time?"
    if (data.teacherId && data.teacherId !== "TBA") {
      const teacherConflicts = await ClassScheduleModel.find({
        teacherId: data.teacherId,
        schoolYear: data.schoolYear,
        semester: data.semester,
        // Exclude the current subject we are editing to avoid self-conflict
        subjectId: { $ne: data.subjectId },
      }).session(session || null);

      this.checkConflicts(
        data.schedules,
        teacherConflicts,
        "Teacher is already booked"
      );
    }

    // 3. CHECK CLASSROOM (SECTION) CONFLICTS [NEW]
    // "Is this section (e.g. 1-A) already taking a different class at this time?"
    const sectionConflicts = await ClassScheduleModel.find({
      classroomId: data.classroomId,
      schoolYear: data.schoolYear,
      semester: data.semester,
      // Exclude the current subject we are editing to avoid self-conflict
      subjectId: { $ne: data.subjectId },
    }).session(session || null);

    this.checkConflicts(
      data.schedules,
      sectionConflicts,
      "This section already has a class scheduled"
    );

    // 4. CHECK ROOM (PHYSICAL LOCATION) CONFLICTS [OPTIONAL BUT RECOMMENDED]
    // "Is the physical room (e.g. Lab 1) already occupied by another section?"
    // This requires a more complex query because 'room' is inside the array.
    // We iterate through the new slots to check specific rooms.
    for (const newSlot of data.schedules) {
      if (newSlot.room && newSlot.room !== "TBA") {
        const roomConflicts = await ClassScheduleModel.find({
          "schedules.room": newSlot.room,
          "schedules.day": newSlot.day,
          schoolYear: data.schoolYear,
          semester: data.semester,
          // Exclude current subject AND current section (same section staying in same room is fine)
          // But actually, even same section can't be in same room for DIFFERENT subject at SAME time (already caught by #3)
          // So we just check if ANYONE is in that room.
          classroomId: { $ne: data.classroomId },
        }).session(session || null);

        // We manually filter because the DB query matches the DOCUMENT, not the specific SLOT
        const flatConflicts = roomConflicts
          .flatMap((c) => c.schedules)
          .filter((s) => s.room === newSlot.room);

        // Check overlap against specific room usage
        for (const existingSlot of flatConflicts) {
          if (this.isOverlap(newSlot, existingSlot)) {
            throw new ConflictError(
              `Room ${newSlot.room} is already occupied on ${newSlot.day} at ${newSlot.startTime}`
            );
          }
        }
      }
    }

    // 5. Persist Data (Upsert)
    const schedule = await ClassScheduleModel.findOneAndUpdate(
      {
        classroomId: data.classroomId,
        subjectId: data.subjectId,
      },
      {
        ...data,
        teacherId: data.teacherId || "TBA",
      },
      { new: true, upsert: true, session: session || null }
    );

    return schedule;
  }

  // --- HELPER FUNCTIONS ---

  private validateTimeSlots(schedules: TimeSlot[]) {
    for (const slot of schedules) {
      if (this.toMinutes(slot.startTime) >= this.toMinutes(slot.endTime)) {
        throw new BadRequestError(
          `Invalid time range for ${slot.day}: End time must be after Start time.`
        );
      }
    }
  }

  private checkConflicts(
    newSchedules: TimeSlot[],
    existingRecords: any[], // Type as any or the Mongoose Interface
    errorMessagePrefix: string
  ) {
    for (const record of existingRecords) {
      for (const existingSlot of record.schedules) {
        for (const newSlot of newSchedules) {
          if (this.isOverlap(newSlot, existingSlot)) {
            throw new ConflictError(
              `${errorMessagePrefix} on ${newSlot.day} between ${newSlot.startTime} - ${newSlot.endTime}`
            );
          }
        }
      }
    }
  }

  private isOverlap(slotA: TimeSlot, slotB: TimeSlot): boolean {
    if (slotA.day !== slotB.day) return false;

    const startA = this.toMinutes(slotA.startTime);
    const endA = this.toMinutes(slotA.endTime);
    const startB = this.toMinutes(slotB.startTime);
    const endB = this.toMinutes(slotB.endTime);

    // Overlap logic: (StartA < EndB) && (EndA > StartB)
    return startA < endB && endA > startB;
  }

  private toMinutes(time: string): number {
    const parts = time.split(":");
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    if (isNaN(hours) || isNaN(minutes)) {
      throw new BadRequestError(`Invalid time format: ${time}`);
    }
    return hours * 60 + minutes;
  }
}
