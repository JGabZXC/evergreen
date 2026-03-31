import {Request, Response} from "express";
import {IAuthService} from "../../../domain/interfaces/IAuthService";
import {UserLoginRequest} from "../../../application/dto/UserLoginRequest";
import {BadRequestError, UnauthorizedError} from "../middleware/HttpErrors";
import {HttpStatus} from "../../../domain/enums/HttpStatus";
import {AuthenticatedRequest} from "../middleware/authGuard";
import {
    UserAddressRequest,
    UserCreateRequest,
    UserErrorCreateRequest,
    UserProfileRequest,
    UserRequestBase
} from "../../../application/dto/UserCreateRequest";
import {ValidationUtils} from "../../../shared/utils/ValidationUtils";

export class AuthController {
    constructor(
        private readonly authService: IAuthService,
    ) {
        this.login = this.login.bind(this);
        this.create = this.create.bind(this);
        this.logout = this.logout.bind(this);
        this.refreshToken = this.refreshToken.bind(this);
    }

    public async login(req: Request, res: Response) {
        const loginDto = req.body as UserLoginRequest;
        this.validateLoginDTO(loginDto);

        const result = await this.authService.login(loginDto.identifier, loginDto.password);

        this.setCookie(res, result.access_token, result.refresh_token);
        return res.status(HttpStatus.OK).json({
            user: result.user
        })
    }

    public async create(req: AuthenticatedRequest, res: Response) {
        if(!req.user?.isAdminOrRegistrar()) throw new UnauthorizedError("Unauthorized to create user");

        const createDTO = req.body as UserCreateRequest;
        this.validateCreateDTO(createDTO);
        const user = await this.authService.create(createDTO, req.user!.id)

        return res.status(HttpStatus.OK).json({
            user: user?.toObjectSimple()
        })
    }

    public async refreshToken(req: Request, res: Response) {
        const oldRefreshToken = req.cookies.refresh_token;
        if (!oldRefreshToken) throw new BadRequestError("Refresh token is required");

        const {access_token, refresh_token, user} = await this.authService.refreshToken(oldRefreshToken);

        this.setCookie(res, access_token, refresh_token);

        return res.status(HttpStatus.OK).json({
            user
        });
    }

    public async logout(req: Request, res: Response) {
        await this.authService.logout(res);

        return res.status(HttpStatus.OK).json({
            message: "Logged out",
        });
    }

    // HELPERS
    private validateLoginDTO(data: UserLoginRequest) {
        const {identifier, password} = data;

        if (!identifier || !password) {
            throw new BadRequestError("Identifier and password are required");
        }

        if(identifier) {
            const isEmail = identifier.includes("@");
            if(isEmail) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
                if (!emailRegex.test(identifier)) {
                    throw new BadRequestError("Invalid email format");
                }
            } else {
                const accountNumberRegex = /'\d+$/;
                if (!accountNumberRegex.test(identifier)) {
                    throw new BadRequestError("Invalid account number format");
                }
            }
        }
    }

    private validateCreateDTO(data: UserCreateRequest) {
        const {user, userProfile, userAddress} = data;

        const errors: UserErrorCreateRequest = {
            user: {},
            userProfile: {},
            userAddress: {}
        };

        this.validateUserRequest(user, errors);
        this.validateUserProfileRequest(userProfile, errors);
        this.validateUserAddressRequest(userAddress, errors);

        if(Object.keys(errors.user).length > 0 || Object.keys(errors.userProfile).length > 0 || Object.keys(errors.userAddress).length > 0) {
            throw new BadRequestError("Validation failed", errors);
        }

    }

    private validateUserRequest(user: UserRequestBase, errors: UserErrorCreateRequest) {
        if(!user.email || !user.email.trim()) {
            errors.user.email = "Email is required";
        } else if(user.email && !ValidationUtils.isEmail(user.email)) {
            errors.user.email = "Invalid email address";
        }

        if(!user.password || !user.password.trim()) {
            errors.user.password = "Password is required";
        } else if(user.password.length < 10) {
            errors.user.password = "Password must be at least 10 characters long";
        }

        if(!user.role || !user.role.trim()) {
            errors.user.role = "Role is required";
        } else if(!ValidationUtils.isValidRole(user.role)) {
            errors.user.role = "Invalid role";
        }
    }
    private validateUserProfileRequest(user: UserProfileRequest, errors: UserErrorCreateRequest) {
        if(!user.firstName || !user.firstName.trim()) {
            errors.userProfile.firstname = "First name is required";
        }

        if(!user.lastName || !user.lastName.trim()) {
            errors.userProfile.lastName = "Last name is required";
        }

        if(!user.dateOfBirth || !user.dateOfBirth.trim()) {
            errors.userProfile.dateOfBirth = "Date of birth is required";
        }

        if(!user.contactNumber || !user.contactNumber.trim()) {
            errors.userProfile.contactNumber = "Contact number is required";
        }

        if(!user.dateOfBirth || !user.dateOfBirth.trim()) {
            errors.userProfile.dateOfBirth = "Date of birth is required";
        } else if(!ValidationUtils.isValidDate(user.dateOfBirth)) {
            errors.userProfile.dateOfBirth = "Invalid date of birth format";
        }

        if(!user.contactNumber || !user.contactNumber.trim()) {
            errors.userProfile.contactNumber = "Contact number is required";
        } else if (user.contactNumber.length < 11 || user.contactNumber.length > 11) {
            errors.userProfile.contactNumber = "Contact number is invalid";
        }
    }
    private validateUserAddressRequest(user: UserAddressRequest, errors: UserErrorCreateRequest) {
        if(!user.homeAddress || !user.homeAddress.trim()) {
            errors.userAddress.homeAddress = "Home address is required";
        }

        if (!user.barangay || !user.barangay.trim()) {
            errors.userAddress.barangay = "Barangay address is required";
        }

        if (!user.municipality || !user.municipality.trim()) {
            errors.userAddress.municipality = "Municipality address is required";
        }

        if (!user.province || !user.province.trim()) {
            errors.userAddress.province = "Province is required";
        }

        if (!user.region || !user.region.trim()) {
            errors.userAddress.region = "Region is required";
        }
    }

    private setCookie(res: Response, accessToken: string, refreshToken: string): void {
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "strict",
            expires: new Date(Date.now() + 1000 * 60 * 10) // 10 minutes,

        })
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "strict",
            expires: new Date(Date.now() + 1000 * 60 * 60) // 1 hour
        })
    }
}