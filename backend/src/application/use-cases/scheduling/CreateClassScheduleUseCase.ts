import mongoose from "mongoose";
import { ClassScheduleModel } from "../../../infrastructure/database/ClassScheduleModel";
import { BaseClassSchedule, TimeSlot } from "../../../domain/ClassSchedule";
import {
  ConflictError,
  BadRequestError,
} from "../../../interfaces/http/middleware/HttpErrors";

export class CreateClassScheduleUseCase {
  async execute(input: BaseClassSchedule) {
    // 1. Validate Input
    if (input.schedules.length === 0) {
      throw new BadRequestError("At least one time slot is required.");
    }

    // 2. Check Teacher Availability (Conflict Detection)
    // We check against ALL existing schedules for this teacher in this term
    const teacherExistingScheds = await ClassScheduleModel.find({
      teacherId: input.teacherId,
      schoolYear: input.schoolYear,
      semester: input.semester,
    });

    for (const newSlot of input.schedules) {
      const isConflict = teacherExistingScheds.some((existing) =>
        existing.schedules.some((existingSlot) =>
          this.checkOverlap(newSlot, existingSlot)
        )
      );

      if (isConflict) {
        throw new ConflictError(
          `Teacher is already booked on ${newSlot.day} between ${newSlot.startTime} - ${newSlot.endTime}`
        );
      }
    }

    // 3. (Optional) Check Room Availability
    // Similar logic: Find schedules with the same `room` and check overlap.

    // 4. Create Schedule
    const schedule = await ClassScheduleModel.create(input);

    // 5. [IMPORTANT] Update Students' "SubjectTaken"
    // If students are ALREADY enrolled, you must update their records to reflect this teacher/schedule
    // ... logic to update SubjectTakenModel updateMany({ classroomId, subjectId }, { teacherId })

    return schedule;
  }

  // Helper: Returns true if times overlap
  private checkOverlap(slotA: TimeSlot, slotB: TimeSlot): boolean {
    if (slotA.day !== slotB.day) return false;

    // Convert "08:30" to 510 minutes for easier math
    const startA = this.toMinutes(slotA.startTime);
    const endA = this.toMinutes(slotA.endTime);
    const startB = this.toMinutes(slotB.startTime);
    const endB = this.toMinutes(slotB.endTime);

    // Overlap formula: (StartA < EndB) and (EndA > StartB)
    return startA < endB && endA > startB;
  }

  private toMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);

    if (!hours || !minutes) {
      throw new BadRequestError(`Invalid time format: ${time}`);
    }

    return hours * 60 + minutes;
  }
}
