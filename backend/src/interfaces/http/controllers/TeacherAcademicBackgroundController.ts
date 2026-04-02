import {Response} from "express";
import {IUserRepository} from "../../../domain/interfaces/IUserRepository";
import {AuthenticatedRequest} from "../middleware/authGuard";
import {IUseCase} from "../../../domain/common/IUseCase";
import {
    GetAllTeacherAcademicBackgroundRepositoryRequest
} from "../../../application/use-cases/teacher_academic_background/IGetAllTeacherAcademicBackgroundUseCase";
import {
    TeacherAcademicBackgroundNestedResponse,
    TeacherAcademicBackgroundResponse
} from "../../../application/dto/TeacherAcademicBackgroundResponse";
import {PaginatedResult} from "../../../domain/common/Pagination";
import { GetAllTeacherAcademicBackgroundFilter } from '../../../domain/interfaces/ITeacherAcademicBackgroundRepository';
import { TeacherDetailsType } from '../../../generated/prisma/enums';
import {BadRequestError, NotFoundError} from "../middleware/HttpErrors";
import {TeacherAcademicBackgroundRequest} from "../../../application/dto/TeacherAcademicBackgroundRequest";
import {
    CreateTeacherAcademicBackgroundRequest
} from "../../../application/use-cases/teacher_academic_background/ICreateTeacherAcademicBackgroundUseCase";

export class TeacherAcademicBackgroundController {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly getAllTeacherUseCase: IUseCase<GetAllTeacherAcademicBackgroundRepositoryRequest, PaginatedResult<TeacherAcademicBackgroundNestedResponse>>,
        private readonly createUserUseCase: IUseCase<CreateTeacherAcademicBackgroundRequest, TeacherAcademicBackgroundResponse>
    ) {
        this.getAllTeacherAcademicBackground = this.getAllTeacherAcademicBackground.bind(this);
        this.createTeacherAcademicBackground = this.createTeacherAcademicBackground.bind(this);
    }

    public async getAllTeacherAcademicBackground(req: AuthenticatedRequest, res: Response) {
        /*
        * @PARAMS
        * userId: (userId of the teacher whose backgrounds we want to fetch, optional - defaults to the authenticated user)
        *
        * @SUPPORTED FILTER
        * type: TeacherDetailsType
        * isApproved: "true" | "false"
        * approvedBy: string (userId of the approver)
        */

        let userId = req.params.userId;

        // Only admins/registrars may request other users' data
        if (userId && !req.user?.isAdminOrRegistrar()) {
            userId = req.user!.id;
        }

        const filter: GetAllTeacherAcademicBackgroundFilter = {};
        if (userId) {
            const user = await this.userRepository.findById(userId);
            if(!user) throw new NotFoundError("User not found");
            filter.userId = user.id
        }

        const query = req.query;
        if (query.type) {
            filter.type = query.type as TeacherDetailsType;
        }

        if (query.isApproved) {
           filter.isApproved = String(query.isApproved).toLowerCase() === "true";
        }

        if (query.approvedBy) {
            filter.approvedBy = String(query.approvedBy);
        }

        const page = Number(query.page) || 1;
        let limit = Number(query.limit) || 10;
        if (page < 1 || limit < 1 || !Number.isInteger(page) || !Number.isInteger(limit)) {
            throw new BadRequestError("Pagination parameters must be positive integers.");
        }

        if (limit > 100) {
            limit = 100;
        }

        const request: GetAllTeacherAcademicBackgroundRepositoryRequest = {
            filter,
            page,
            limit,
        };

        const result = await this.getAllTeacherUseCase.execute(request);

        return res.status(200).json(result);
    }

    public async createTeacherAcademicBackground(req: AuthenticatedRequest<TeacherAcademicBackgroundRequest>, res: Response) {
        /*
        * This route is for Role.TEACHER only!
        */

        const data = req.body;

        const request: CreateTeacherAcademicBackgroundRequest = {
            data,
            creatorId: req.user!.id
        }

        const response = await this.createUserUseCase.execute(request)
        return res.status(200).json({
            data: response,
        });
    }
}