import { Schema } from "mongoose";
import { EnrollmentStatus, Student } from "../../domain/Student";

const StudentModelSchema = new Schema<Student & Document>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  studentId: { type: String, required: true, unique: true },
  enrollments: {
    type: [
      {
        studentId: { type: String, required: true },
        gradeLevel: { type: String, required: true },
        section: { type: String },
        enrollmentDate: { type: Date, required: true },
        status: {
          type: String,
          required: true,
          validator: (value: string) => {
            return Object.values(EnrollmentStatus).includes(
              value as EnrollmentStatus
            );
          },
        },
        schoolYear: { type: String, required: true },
        adviser: { type: Schema.Types.ObjectId, ref: "Teacher" },
      },
    ],
  },
});
