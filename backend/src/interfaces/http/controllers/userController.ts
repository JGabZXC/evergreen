import { Response } from "express";
import { UpdateStaffProfileUseCase } from "../../../application/use-cases/user-use-cases/UpdateStaffProfileUseCase";
import { UpdateStudentProfileUseCase } from "../../../application/use-cases/user-use-cases/UpdateStudentProfileUseCase";
import { HttpStatus } from "../../../domain/HttpStatus";
import { StudentRole } from "../../../domain/types/Role";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { GetStudentProfileUseCase } from "../../../application/use-cases/user-use-cases/GetStudentProfileUseCase";
import { GetStaffProfileUseCase } from "../../../application/use-cases/user-use-cases/GetStaffProfileUseCase";
import { UpdatePasswordUseCase } from "../../../application/use-cases/user-use-cases/UpdatePasswordUseCase";
import { BadRequestError } from "../middleware/HttpErrors";

const updateStudentProfile = new UpdateStudentProfileUseCase();
const getStudentProfile = new GetStudentProfileUseCase();
const updateStaffProfile = new UpdateStaffProfileUseCase();
const getStaffProfile = new GetStaffProfileUseCase();
const updatePassword = new UpdatePasswordUseCase();

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let profile;
    if (req.user!.role! === StudentRole.Student) {
      profile = await getStudentProfile.execute(req.user!.studentId!);
    } else {
      profile = await getStaffProfile.execute(req.user!.employeeId!);
    }

    return res.status(HttpStatus.OK).json({ profile });
  } catch (err: any) {
    throw err;
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    let updatedProfile;
    if (req.user!.role! === StudentRole.Student) {
      updatedProfile = await updateStudentProfile.execute(
        req.user!.studentId!,
        req.body
      );
    } else {
      updatedProfile = await updateStaffProfile.execute(
        req.user!.employeeId!,
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
    await updatePassword.execute(req.user!._id!, currentPassword, newPassword);
    return res
      .status(HttpStatus.OK)
      .json({ message: "Password updated successfully" });
  } catch (err: any) {
    throw err;
  }
};
