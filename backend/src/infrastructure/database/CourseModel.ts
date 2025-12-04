import mongoose, { Schema } from "mongoose";
import { Course, SubjectToBeTaken } from "../../domain/Course";
import { Semester } from "../../domain/types/Semester";
import { GradeLevel } from "../../domain/Subject";

const SubjectToBeTakenSchema = new Schema<SubjectToBeTaken>({
  semester: {
    type: Number,
    enum: Object.values(Semester).map(Number),
    required: true,
  },
  gradeLevel: { type: String, enum: Object.values(GradeLevel), required: true },
  subject: [{ type: Schema.Types.ObjectId, ref: "Subject", required: true }],
});

const CourseSchema = new Schema<Course & Document>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    gradeAvailable: { type: String, enum: ["shs", "college"], required: true },
    subjectToBeTaken: [SubjectToBeTakenSchema],
  },
  { timestamps: true }
);

export const CourseModel = mongoose.model<Course & Document>(
  "Course",
  CourseSchema
);
