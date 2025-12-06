import mongoose from "mongoose";
import { BaseClassSchedule, TimeSlot } from "../../../domain/ClassSchedule";
import { ClassScheduleModel } from "../../../infrastructure/database/ClassScheduleModel";
import {
  ConflictError,
  BadRequestError,
  NotFoundError,
} from "../../../interfaces/http/middleware/HttpErrors";
import { SubjectModel } from "../../../infrastructure/database/SubjectModel";

export class ManageClassScheduleUseCase {
  async execute(data: BaseClassSchedule, session?: mongoose.ClientSession) {
    // 1. Validate Time Format & Logic
    this.validateTimeSlots(data.schedules);

    // 2. VALIDATE SUBJECT EXISTENCE [NEW]
    // Check if the subjectId actually exists in the Subject collection
    const subjectExists = await SubjectModel.findOne({
      subjectId: data.subjectId,
    }).session(session || null);

    if (!subjectExists) {
      throw new NotFoundError(`Subject with ID '${data.subjectId}' not found.`);
    }

    // 3. CHECK TEACHER CONFLICTS
    if (data.teacherId && data.teacherId !== "TBA") {
      const teacherConflicts = await ClassScheduleModel.find({
        teacherId: data.teacherId,
        schoolYear: data.schoolYear,
        semester: data.semester,
        subjectId: { $ne: data.subjectId },
      }).session(session || null);

      this.checkConflicts(
        data.schedules,
        teacherConflicts,
        `Teacher (${data.teacherId}) is already booked`
      );
    }

    // 4. CHECK CLASSROOM (SECTION) CONFLICTS
    const sectionConflicts = await ClassScheduleModel.find({
      classroomId: data.classroomId,
      schoolYear: data.schoolYear,
      semester: data.semester,
      subjectId: { $ne: data.subjectId },
    }).session(session || null);

    this.checkConflicts(
      data.schedules,
      sectionConflicts,
      "This section already has a class scheduled"
    );

    // 5. CHECK ROOM (PHYSICAL LOCATION) CONFLICTS
    for (const newSlot of data.schedules) {
      if (newSlot.room && newSlot.room !== "TBA") {
        const roomConflicts = await ClassScheduleModel.find({
          "schedules.room": newSlot.room,
          "schedules.day": newSlot.day,
          schoolYear: data.schoolYear,
          semester: data.semester,
          classroomId: { $ne: data.classroomId },
        }).session(session || null);

        const flatConflicts = roomConflicts
          .flatMap((c) => c.schedules)
          .filter((s) => s.room === newSlot.room);

        for (const existingSlot of flatConflicts) {
          if (this.isOverlap(newSlot, existingSlot)) {
            throw new ConflictError(
              `Room ${newSlot.room} is already occupied on ${newSlot.day} between ${existingSlot.startTime} - ${existingSlot.endTime}`
            );
          }
        }
      }
    }

    // 6. Persist Data (Upsert)
    const schedule = await ClassScheduleModel.findOneAndUpdate(
      {
        classroomId: data.classroomId,
        subjectId: data.subjectId,
        schoolYear: data.schoolYear,
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
