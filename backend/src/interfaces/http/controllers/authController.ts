import { Request, Response } from "express";
import { BaseUser, User } from "../../../domain/User";
import { HttpStatus } from "../../../domain/HttpStatus";
import { UserModel } from "../../../infrastructure/database/UserModel";
import { AuthService } from "../../../application/services/authService";
import { BadRequestError, UnauthorizedError } from "../middleware/HttpErrors";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { StaffRole, StudentRole, type Role } from "../../../domain/types/Role";
import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { StaffModel } from "../../../infrastructure/database/StaffModel";
import { RegisterStaffUseCase } from "../../../application/use-cases/RegisterStaffUseCase";
import { RegisterStudentUseCase } from "../../../application/use-cases/RegisterStudentUseCase";

const authService = new AuthService();
const registerStaff = new RegisterStaffUseCase();
const registerStudent = new RegisterStudentUseCase();

const validateAndCreateUser = async (
  userData: BaseUser,
  currentUserRole: Role
) => {
  const errors: { [key: string]: string } = {};
  const { email, password, role } = userData;

  // 1. Validate required fields and format
  if (!email) {
    errors["email"] = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors["email"] = "Email format is invalid";
  }
  if (!password) {
    errors["password"] = "Password is required";
  }

  const validRoles: Role[] = [
    ...Object.values(StudentRole),
    ...Object.values(StaffRole),
  ];
  if (!role || !validRoles.includes(role)) {
    errors["role"] = "Invalid role specified";
  }

  if (role === StaffRole.Admin && currentUserRole !== StaffRole.Admin) {
    errors["role"] = "Only admins can create admin users";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, user: userData };
  }

  try {
    const user =
      userData.role === StudentRole.Student
        ? await registerStudent.execute(userData)
        : await registerStaff.execute(userData);
    return { success: true, user };
  } catch (err: any) {
    return { success: false, errors: { general: err.message }, user: userData };
  }
};

export const register = async (
  req: Request & AuthenticatedRequest,
  res: Response
) => {
  const bulk = req.query.bulk === "true";

  if (bulk) {
    if (!Array.isArray(req.body)) {
      throw new BadRequestError("Bulk registration requires an array of users");
    }

    const usersToRegister: BaseUser[] = req.body;
    const results = await Promise.all(
      usersToRegister.map((user) =>
        validateAndCreateUser(user, req.user!.role!)
      )
    );

    const successfulCreations = results
      .filter((r) => r.success)
      .map((r) => (r as { success: true; user: BaseUser }).user);

    const failedCreations = results
      .filter((r) => !r.success)
      .map((r) => ({
        user: (r as { success: false; errors: any; user: BaseUser }).user,
        errors: (r as { success: false; errors: any; user: BaseUser }).errors,
      }));

    if (successfulCreations.length === 0) {
      throw new BadRequestError("All bulk registrations failed", {
        failedUsers: failedCreations,
      });
    }

    const status =
      failedCreations.length > 0 ? HttpStatus.MULTI_STATUS : HttpStatus.CREATED;

    return res.status(status).json({
      message: `${successfulCreations.length} user(s) created successfully.`,
      successfulCreations,
      failedCreations: failedCreations.length > 0 ? failedCreations : undefined,
    });
  } else {
    let user;
    try {
      const userData: BaseUser = req.body;
      user = await validateAndCreateUser(userData, req.user!.role!);
    } catch (err: any) {
      throw err;
    }

    return res.status(HttpStatus.CREATED).json({ user });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const errors: { [key: string]: string } = {};

  if (!email) {
    errors["email"] = "Email is required";
  }

  if (!password) {
    errors["password"] = "Password is required";
  }

  if (Object.keys(errors).length > 0) {
    throw new BadRequestError("Validation errors", errors);
  }

  const user = await UserModel.findOne({ email, active: true }).select(
    "+password"
  );

  if (!user) {
    throw new BadRequestError("User not found", { email });
  }

  if (!(await authService.comparePasswords(password, user.password))) {
    throw new BadRequestError("Invalid email or password");
  }

  let roleData: {
    studentId?: string;
    employeeId?: string;
    formattedId?: string;
  } = {};

  if (user.role === StudentRole.Student) {
    const student = await StudentModel.findOne({ userId: user._id });
    if (student) {
      roleData = {
        studentId: student.studentId,
        formattedId: student.formattedId,
      };
    }
  } else if (Object.values(StaffRole).includes(user.role)) {
    const staff = await StaffModel.findOne({ userId: user._id });
    if (staff) {
      roleData = {
        employeeId: staff.employeeId,
        formattedId: staff.formattedId,
      };
    }
  }

  const { accessToken, refreshToken } = await authService.generateTokens(
    user,
    roleData
  );
  authService.setAuthCookies(res, accessToken, refreshToken);

  return res.status(HttpStatus.OK).json({
    user,
    ...roleData,
  });
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await authService.invalidateRefreshToken(refreshToken);
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res.status(HttpStatus.OK).json({ message: "Logged out" });
};

export const refresh = async (req: Request, res: Response) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    throw new UnauthorizedError("No refresh token provided");
  }
  const tokens =
    await authService.validateAndRotateRefreshToken(oldRefreshToken);
  if (!tokens) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
  const user = await UserModel.findOne({ email: tokens.email });
  if (!user || !user.active) {
    throw new UnauthorizedError("User is inactive or does not exist");
  }
  authService.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  return res.status(HttpStatus.OK).json({ message: "Token refreshed" });
};

export const testProtected = async (
  req: Request & AuthenticatedRequest,
  res: Response
) => {
  return res.status(HttpStatus.OK).json({
    message: "You have accessed a protected route",
    user: req.user,
  });
};
