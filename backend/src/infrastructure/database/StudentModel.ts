import mongoose, { Schema } from "mongoose";
import { Student } from "../../domain/Student";

const StudentModelSchema = new Schema<Student & Document>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

export const StudentModel = mongoose.model<Student & Document>(
  "Student",
  StudentModelSchema
);
