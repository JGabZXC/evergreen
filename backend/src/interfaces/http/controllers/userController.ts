import { Response } from "express";
import { HttpStatus } from "../../../domain/HttpStatus";
import { StaffRole, StudentRole } from "../../../domain/types/Role";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { BadRequestError, ForbiddenError } from "../middleware/HttpErrors";
import {
  GetUserUseCase,
  UpdatePasswordUseCase,
  UpdateStaffUseCase,
  UpdateStudentUseCase,
} from "../../../application/use-cases/user/index";
import { FilterQuery } from "mongoose";
import GetAllUserUseCase, {
  GetAllUserFilter,
} from "../../../application/use-cases/user/GetAllUserUseCase";

const getUserUseCase = new GetUserUseCase();
const getAllUserUseCase = new GetAllUserUseCase();
const updateStudentUseCase = new UpdateStudentUseCase();
const updateStaffUseCase = new UpdateStaffUseCase();
const updatePasswordUseCase = new UpdatePasswordUseCase();

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  let { page = 1, limit = 10, email, role, active, embed } = req.query;
  let userId = req.params.id;

  if (userId && typeof userId !== "string") {
    throw new BadRequestError("User ID must be a string");
  }

  if (req.user?.role === StudentRole.Student) userId = req.user._id;
  const skip = (Number(page) - 1) * Number(limit);
  try {
    let users;
    if (userId) {
      users = await getUserUseCase.execute(userId as string);
    } else {
      const filter: FilterQuery<GetAllUserFilter> = {};
      if (email) filter.email = String(email);
      if (role) filter.role = String(role);
      if (active) filter.active = active === "true";
      if (embed) filter.embed = embed === "true";

      users = await getAllUserUseCase.execute(filter, skip, Number(limit));

      return res.status(HttpStatus.OK).json({ ...users });
    }
    return res.status(HttpStatus.OK).json(users);
  } catch (err: any) {
    throw err;
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    let userId = req.params.id;

    if (!userId) throw new BadRequestError("User ID is required");

    if (
      req.user!.role !== StaffRole.Registrar &&
      req.user!.role !== StaffRole.Admin
    ) {
      userId = req.user!._id!;
    }

    // Fetch target user to determine role and get studentId/employeeId
    const targetUser = await getUserUseCase.execute(userId);

    if (!targetUser) throw new BadRequestError("Target user not found");

    let updatedProfile;
    if (targetUser.role === StudentRole.Student) {
      if (!targetUser.student) {
        throw new BadRequestError("Student record not found for user");
      }
      updatedProfile = await updateStudentUseCase.execute(
        targetUser.student.studentId,
        req.body
      );
    } else {
      if (!targetUser.staff) {
        throw new BadRequestError("Staff record not found for user");
      }
      updatedProfile = await updateStaffUseCase.execute(
        targetUser.staff.employeeId,
        req.body
      );
    }

    return res.status(HttpStatus.OK).json({ profile: updatedProfile });
  } catch (err: any) {
    throw err;
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    throw new BadRequestError(
      "Current password, new password, and confirmation are all required"
    );
  }
  if (newPassword !== confirmNewPassword) {
    throw new BadRequestError("New password and confirmation do not match");
  }

  try {
    await updatePasswordUseCase.execute(
      req.user!._id!,
      currentPassword,
      newPassword
    );
    return res
      .status(HttpStatus.OK)
      .json({ message: "Password updated successfully" });
  } catch (err: any) {
    throw err;
  }
};
