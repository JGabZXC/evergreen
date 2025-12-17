import mongoose, { Document, Schema } from "mongoose";
import { Staff } from "../../domain/Staff";
import { StaffRole } from "../../domain/types/Role";

const AddressSchema = new Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: Number, required: true },
  },
  { _id: false }
);

const DegreeSchema = new Schema(
  {
    field: { type: String, required: true },
    institution: { type: String, required: true },
    yearCompleted: { type: Number, required: true },
  },
  { _id: false }
);

const TeacherDetailsSchema = new Schema(
  {
    specializations: [{ type: String }],
    masteralDegree: [DegreeSchema],
    doctoralDegree: [DegreeSchema],
  },
  { _id: false }
);

const StaffProfileSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    phoneNumber: { type: String },
    address: { type: AddressSchema },
    department: { type: String, required: true },
    hireDate: { type: Date, required: true },
    teacherDetails: { type: TeacherDetailsSchema },
  },
  { _id: false }
);

const StaffSchema = new Schema<Staff & Document>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    employeeId: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    profile: { type: StaffProfileSchema },
  },
  {
    timestamps: true,
  }
);

StaffSchema.index({ employeeId: 1, isActive: 1 });

// Validation to ensure teacherDetails is only present if role is Teacher
StaffSchema.pre("save", async function (next) {
  if (this.profile && this.profile.teacherDetails) {
    const User = mongoose.model("User");
    const user = await User.findById(this.userId);
    if (user && user.role !== StaffRole.Teacher) {
      return next(
        new Error(
          "Teacher details can only be added for users with Teacher role"
        )
      );
    }
  }
  next();
});

export const StaffModel = mongoose.model<Staff & Document>(
  "Staff",
  StaffSchema
);
