import mongoose, { Schema } from "mongoose";
import { Student } from "../../domain/Student";

const StudentSchema = new Schema<Student & Document>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: { type: String, required: true, unique: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    isActive: { type: Boolean, default: true }, // Matched this for UserModel
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

StudentSchema.index({ studentId: 1, isActive: 1 });

export const StudentModel = mongoose.model<Student & Document>(
  "Student",
  StudentSchema
);
