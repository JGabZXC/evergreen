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

StudentSchema.virtual("formattedStudentId").get(function () {
  if (typeof this.studentId === "string" && this.studentId.startsWith("STU-")) {
    const num = this.studentId.split("-")[1] || "1";
    return `STU-${num.padStart(9, "0")}`;
  }
  return this.studentId;
});

export const StudentModel = mongoose.model<Student & Document>(
  "Student",
  StudentSchema
);
