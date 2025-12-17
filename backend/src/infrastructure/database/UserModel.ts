import { Schema, model } from "mongoose";
import { User } from "../../domain/User";
import { StaffRole, StudentRole } from "../../domain/types/Role";
import { StudentModel } from "./StudentModel";
import { StaffModel } from "./StaffModel";

const UserSchema = new Schema<User & Document>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: [...Object.values(StudentRole), ...Object.values(StaffRole)],
      default: StudentRole.Student,
      required: true,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

UserSchema.index({ role: 1, active: 1 });

UserSchema.set("toJSON", {
  transform: function (doc, ret) {
    const { __v, password, ...userObject } = ret;
    return userObject;
  },
});

UserSchema.virtual("student", {
  ref: "Student",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});

UserSchema.virtual("staff", {
  ref: "Staff",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});

UserSchema.post("save", async function (doc, next) {
  if (doc.isModified("active")) {
    if (doc.role === StudentRole.Student) {
      await StudentModel.updateOne(
        {
          userId: doc._id,
        },
        {
          $set: { isActive: doc.active },
        }
      );
    } else {
      await StaffModel.updateOne(
        {
          userId: doc._id,
        },
        {
          $set: { isActive: doc.active },
        }
      );
    }
  }

  next();
});

UserSchema.post("findOneAndUpdate", async function (doc, next) {
  if (doc) {
    if (doc.role === StudentRole.Student) {
      await StudentModel.updateOne(
        {
          userId: doc._id,
        },
        {
          $set: { isActive: doc.active },
        }
      );
    } else {
      await StaffModel.updateOne(
        {
          userId: doc._id,
        },
        {
          $set: { isActive: doc.active },
        }
      );
    }
  }
  next();
});

export const UserModel = model<User & Document>("User", UserSchema);
