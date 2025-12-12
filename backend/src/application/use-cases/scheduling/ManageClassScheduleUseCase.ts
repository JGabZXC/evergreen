import mongoose from "mongoose";
import {
  BaseSubjectSchedule,
  SubjectSchedule,
  TimeSlot,
} from "../../../domain/SubjectSchedule";
import { SubjectScheduleModel } from "../../../infrastructure/database/SubjectScheduleModel";
import {
  ConflictError,
  BadRequestError,
  NotFoundError,
} from "../../../interfaces/http/middleware/HttpErrors";
import { SubjectModel } from "../../../infrastructure/database/SubjectModel";
import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";

export class ManageClassScheduleUseCase {
  async execute(data: BaseSubjectSchedule, session?: mongoose.ClientSession) {
    // 1. Validate Time Format & Logic
    this.validateTimeSlots(data.schedules);

    // 2. VALIDATE SUBJECT EXISTENCE [NEW]
    // Check if the subject actually exists in the Subject collection
    const subjectExists = await SubjectModel.findById(data.subject).session(
      session || null
    );

    if (!subjectExists) {
      throw new NotFoundError(`Subject with ID '${data.subject}' not found.`);
    }

    // 3. CHECK TEACHER CONFLICTS
    if (data.teacherId && data.teacherId !== "TBA") {
      const teacherConflicts = await SubjectScheduleModel.find({
        teacherId: data.teacherId,
        schoolYear: data.schoolYear,
        semester: data.semester,
        subject: { $ne: data.subject },
      }).session(session || null);

      this.checkConflicts(
        data.schedules,
        teacherConflicts,
        `Teacher (${data.teacherId}) is already booked`
      );
    }

    // 4. CHECK CLASSROOM (SECTION) CONFLICTS
    const sectionConflicts = await SubjectScheduleModel.find({
      classroomId: data.classroomId,
      schoolYear: data.schoolYear,
      semester: data.semester,
      subject: { $ne: data.subject },
    }).session(session || null);

    this.checkConflicts(
      data.schedules,
      sectionConflicts,
      "This section already has a class scheduled"
    );

    // 5. Persist Data (Upsert)
    const schedule = await SubjectScheduleModel.findOneAndUpdate(
      {
        classroomId: data.classroomId,
        subject: data.subject,
        schoolYear: data.schoolYear,
      },
      {
        ...data,
        teacherId: data.teacherId || "TBA",
      },
      { new: true, upsert: true, session: session || null }
    );

    if (schedule) {
      await SubjectTakenModel.updateMany(
        {
          classroomId: data.classroomId,
          subject: data.subject,
          schoolYear: data.schoolYear,
          semester: data.semester,
        },
        {
          $set: { teacherId: schedule.teacherId },
        },
        session ? { session } : undefined
      );
    }

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
