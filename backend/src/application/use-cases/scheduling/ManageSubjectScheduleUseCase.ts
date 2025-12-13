import mongoose from "mongoose";
import { BaseSubjectSchedule, TimeSlot } from "../../../domain/SubjectSchedule";
import { SubjectScheduleModel } from "../../../infrastructure/database/SubjectScheduleModel";
import { RoomModel } from "../../../infrastructure/database/RoomModel";
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
} from "../../../interfaces/http/middleware/HttpErrors";
import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";

export class ManageSubjectScheduleUseCase {
  async execute(data: BaseSubjectSchedule, session?: mongoose.ClientSession) {
    // 1. Validate Time Format & Logic
    this.validateTimeSlots(data.schedules);

    this.checkInternalDuplicates(data.schedules);

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
        if (this.isOverlap(newSlot, existingSlot)) {
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

      this.checkConflicts(
        data.schedules,
        teacherConflicts,
        `Teacher (${data.teacherId}) is already booked`
      );
    }

    // const sectionConflicts = await ClassScheduleModel.find({
    //   classroomId: data.classroomId,
    //   schoolYear: data.schoolYear,
    //   semester: data.semester,
    //   subject: { $ne: data.subject },
    // }).session(session || null);

    // this.checkConflicts(data.schedules, sectionConflicts, "This section already has a class scheduled");

    // for (const newSlot of data.schedules) {
    //   if (newSlot.room && newSlot.room !== "TBA") {
    //     const roomConflicts = await ClassScheduleModel.find({
    //       "schedules.room": newSlot.room,
    //       "schedules.day": newSlot.day,
    //       schoolYear: data.schoolYear,
    //       semester: data.semester,
    //       classroomId: { $ne: data.classroomId }, // Ignore conflicts within same section
    //     }).session(session || null);

    //     // Filter Strict Time Overlaps
    //     const flatConflicts = roomConflicts
    //       .flatMap((c) => c.schedules)
    //       .filter((s) => s.room === newSlot.room);

    //     for (const existingSlot of flatConflicts) {
    //       if (this.isOverlap(newSlot, existingSlot)) {
    //         throw new ConflictError(
    //           `Room ${newSlot.room} is already occupied on ${newSlot.day} between ${existingSlot.startTime} - ${existingSlot.endTime}`
    //         );
    //       }
    //     }
    //   }
    // }

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

  // --- HELPER FUNCTIONS ---

  private checkInternalDuplicates(schedules: TimeSlot[]) {
    const sorted = [...schedules].sort((a, b) => {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      if (a.day !== b.day) {
        return days.indexOf(a.day) - days.indexOf(b.day);
      }

      return this.toMinutes(a.startTime) - this.toMinutes(b.startTime);
    });

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      if (!current || !next) continue;

      if (current.day === next.day) {
        const currentEnd = this.toMinutes(current.endTime);
        const nextStart = this.toMinutes(next.startTime);

        if (currentEnd > nextStart) {
          throw new BadRequestError(
            `Overlapping time slots detected on ${current.day}: ${current.startTime}-${current.endTime} overlaps with ${next.startTime}-${next.endTime}`
          );
        }
      }
    }
  }

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
    existingRecords: any[],
    errorMsg: string
  ) {
    for (const record of existingRecords) {
      for (const existingSlot of record.schedules) {
        for (const newSlot of newSchedules) {
          if (this.isOverlap(newSlot, existingSlot)) {
            throw new ConflictError(
              `${errorMsg} on ${newSlot.day} ${newSlot.startTime}-${newSlot.endTime}`
            );
          }
        }
      }
    }
  }

  private isOverlap(slotA: TimeSlot, slotB: TimeSlot): boolean {
    if (slotA.day !== slotB.day) return false;
    const sA = this.toMinutes(slotA.startTime);
    const eA = this.toMinutes(slotA.endTime);
    const sB = this.toMinutes(slotB.startTime);
    const eB = this.toMinutes(slotB.endTime);
    // (StartA < EndB) and (EndA > StartB)
    return sA < eB && eA > sB;
  }

  private toMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    if (!h || !m) {
      throw new BadRequestError(`Invalid time format: ${time}`);
    }
    return h * 60 + m;
  }
}
