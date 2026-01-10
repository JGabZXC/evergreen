import { BadRequestError } from "../../interfaces/http/middleware/HttpErrors";
import { TimeSlot } from "../../domain/SubjectSchedule";

export class ScheduleValidationService {
  static checkInternalDuplicates(schedules: TimeSlot[]) {
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

      if (current.day === next.day && current.room.toString() === next.room.toString()) {
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

  static validateTimeSlots(schedules: TimeSlot[]) {
    for (const slot of schedules) {
      if (this.toMinutes(slot.startTime) >= this.toMinutes(slot.endTime)) {
        throw new BadRequestError(
          `Invalid time range for ${slot.day}: End time must be after Start time.`
        );
      }
    }
  }

  static isOverlap(slotA: TimeSlot, slotB: TimeSlot): boolean {
    if (slotA.day !== slotB.day) return false;
    const sA = this.toMinutes(slotA.startTime);
    const eA = this.toMinutes(slotA.endTime);
    const sB = this.toMinutes(slotB.startTime);
    const eB = this.toMinutes(slotB.endTime);
    // (StartA < EndB) and (EndA > StartB)
    return sA < eB && eA > sB;
  }

  static toMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    if (h === undefined || m === undefined) {
      throw new BadRequestError(`Invalid time format: ${time}`);
    }
    return h * 60 + m;
  }
}
