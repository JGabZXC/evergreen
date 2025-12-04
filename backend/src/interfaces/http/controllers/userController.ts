import { Response } from "express";
import { HttpStatus } from "../../../domain/HttpStatus";
import { StudentRole } from "../../../domain/types/Role";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { BadRequestError } from "../middleware/HttpErrors";
import {
  GetStaffProfileUseCase,
  GetStudentProfileUseCase,
  UpdateStaffProfileUseCase,
  UpdateStudentProfileUseCase,
  UpdatePasswordUseCase,
  CreateStudentProfileUseCase,
  CreateStaffProfileUseCase,
} from "../../../application/use-cases/user/index";

// STUDENT
const createStudentProfileUseCase = new CreateStudentProfileUseCase();
const updateStudentProfileUseCase = new UpdateStudentProfileUseCase();
const getStudentProfileUseCase = new GetStudentProfileUseCase();
// STAFF
const createStaffProfileUseCase = new CreateStaffProfileUseCase();
const updateStaffProfileUseCase = new UpdateStaffProfileUseCase();
const getStaffProfileUseCase = new GetStaffProfileUseCase();
const updatePasswordUseCase = new UpdatePasswordUseCase();

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let profile;
    if (req.user!.role! === StudentRole.Student) {
      profile = await getStudentProfileUseCase.execute(req.user!.studentId!);
    } else {
      profile = await getStaffProfileUseCase.execute(req.user!.employeeId!);
    }

    return res.status(HttpStatus.OK).json({ profile });
  } catch (err: any) {
    throw err;
  }
};

export const createProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    let createdProfile;
    const existingProfile =
      req.user!.role! === StudentRole.Student
        ? await getStudentProfileUseCase.execute(req.user!.studentId!)
        : await getStaffProfileUseCase.execute(req.user!.employeeId!);

    if (existingProfile) {
      throw new BadRequestError("Profile already exists");
    }

    if (req.user!.role! === StudentRole.Student) {
      createdProfile = await createStudentProfileUseCase.execute(
        req.user!.studentId!,
        req.body
      );
    } else {
      createdProfile = await createStaffProfileUseCase.execute(
        req.user!.employeeId!,
        req.body
      );
    }
    return res.status(HttpStatus.CREATED).json({ profile: createdProfile });
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
      updatedProfile = await updateStudentProfileUseCase.execute(
        req.user!.studentId!,
        req.body
      );
    } else {
      updatedProfile = await updateStaffProfileUseCase.execute(
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
