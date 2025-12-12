import mongoose, { Schema } from "mongoose";
import { Course, CurriculumItem } from "../../domain/Course";
import { Semester } from "../../domain/types/Semester";
import { GradeLevel } from "../../domain/types/GradeLevel";

// TODO: In curriculum add effectiveYear to differentiate if the curriculum will update, e.g for 2023 curriculum vs 2024 curriculum

const CurriculumItemSchema = new Schema<CurriculumItem>({
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
    curriculum: {
      type: [CurriculumItemSchema],
      validate: {
        validator: function (items: CurriculumItem[]) {
          const seen = new Set();

          for (const item of items) {
            // Create a unique key for each item (e.g., "G-11-1")
            const key = `${item.gradeLevel}-${item.semester}`;

            if (seen.has(key)) return false;

            seen.add(key);
          }
          return true;
        },
        message:
          "Duplicate Grade Level and Semester combination found in curriculum.",
      },
    },
  },
  { timestamps: true }
);

// CourseSchema.index({ code: 1 });

export const CourseModel = mongoose.model<Course & Document>(
  "Course",
  CourseSchema
);
