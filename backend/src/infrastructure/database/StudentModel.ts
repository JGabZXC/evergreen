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

StudentSchema.virtual("formattedId").get(function () {
  if (typeof this.studentId === "string" && this.studentId.startsWith("STU-")) {
    const num = this.studentId.split("-")[1] || "1";
    return `STU-${num.padStart(9, "0")}`;
  }
  return this.studentId;
});

StudentSchema.index({ studentId: 1, isActive: 1 });

export const StudentModel = mongoose.model<Student & Document>(
  "Student",
  StudentSchema
);
