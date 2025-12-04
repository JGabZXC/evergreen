import mongoose from "mongoose";
import { BaseClassSchedule } from "../../../domain/ClassSchedule";
import { ClassScheduleModel } from "../../../infrastructure/database/ClassScheduleModel";
import { ConflictError } from "../../../interfaces/http/middleware/HttpErrors";

export class ManageClassScheduleUseCase {
  async execute(data: BaseClassSchedule, session?: mongoose.ClientSession) {
    if (data.teacherId && data.teacherId !== "TBA") {
      const conflicts = await ClassScheduleModel.find({
        teacherId: data.teacherId,
        schoolYear: data.schoolYear,
        semester: data.semester,
      }).session(session || null);

      for (const conflict of conflicts) {
        for (const newSlot of data.schedules) {
          const hasOverlap = conflict.schedules.some(
            (existingSlot) =>
              existingSlot.day === newSlot.day &&
              existingSlot.startTime === newSlot.startTime
          );
          if (hasOverlap) {
            throw new ConflictError(
              `Teacher is already booked on ${newSlot.day} at ${newSlot.startTime}`
            );
          }
        }
      }
    }

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
}
