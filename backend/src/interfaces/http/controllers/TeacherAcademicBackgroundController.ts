import {Response} from "express";
import {IUserRepository} from "../../../domain/interfaces/IUserRepository";
import {ITeacherAcademicBackgroundRepository} from '../../../domain/interfaces/ITeacherAcademicBackgroundRepository';
import {IApproveTeacherAcademicBackgroundUseCase} from '../../../application/use-cases/teacher_academic_background/IApproveTeacherAcademicBackgroundUseCase';
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
import {BadRequestError, NotFoundError, ForbiddenError} from "../middleware/HttpErrors";
import {TeacherAcademicBackgroundRequest} from "../../../application/dto/TeacherAcademicBackgroundRequest";
import {UpdateTeacherAcademicBackgroundRequest} from "../../../application/use-cases/teacher_academic_background/IUpdateTeacherAcademicBackgroundUseCase";
import {
    CreateTeacherAcademicBackgroundRequest
} from "../../../application/use-cases/teacher_academic_background/ICreateTeacherAcademicBackgroundUseCase";

export class TeacherAcademicBackgroundController {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly getAllTeacherUseCase: IUseCase<GetAllTeacherAcademicBackgroundRepositoryRequest, PaginatedResult<TeacherAcademicBackgroundNestedResponse>>,
        private readonly createUserUseCase: IUseCase<CreateTeacherAcademicBackgroundRequest, TeacherAcademicBackgroundResponse>,
        private readonly updateTeacherAcademicBackgroundUseCase: IUseCase<UpdateTeacherAcademicBackgroundRequest, boolean>,
        private readonly approveTeacherAcademicBackgroundUseCase: IApproveTeacherAcademicBackgroundUseCase,
        private readonly teacherRepository: ITeacherAcademicBackgroundRepository,
    ) {
        this.getAllTeacherAcademicBackground = this.getAllTeacherAcademicBackground.bind(this);
        this.createTeacherAcademicBackground = this.createTeacherAcademicBackground.bind(this);
        this.updateTeacherAcademicBackground = this.updateTeacherAcademicBackground.bind(this);
        this.approveTeacherAcademicBackground = this.approveTeacherAcademicBackground.bind(this);
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

    public async updateTeacherAcademicBackground(req: AuthenticatedRequest<Partial<TeacherAcademicBackgroundRequest>>, res: Response) {
        const id = String(req.params.id || "");

        if (!id) throw new BadRequestError("Missing teacher academic background id in params");

        const domainUser = await this.userRepository.findById(req.user!.id);
        if (!domainUser) throw new NotFoundError("Authenticated user not found");

        const teacherRecord = await this.teacherRepository.findById(id);
        if (!teacherRecord) throw new NotFoundError("Teacher academic background not found");

        const ownerUserId = teacherRecord.userProfile?.userId;
        if (ownerUserId !== req.user!.id) {
            throw new ForbiddenError("You are not allowed to update this teacher academic background");
        }

        const data = req.body;

        const result = await this.updateTeacherAcademicBackgroundUseCase.execute({id, data});

        return res.status(200).json({
            success: result,
        });
    }

    public async approveTeacherAcademicBackground(req: AuthenticatedRequest, res: Response) {
        // `id` is validated by the `validateParams` middleware attached to the route.
        // If the id is missing/invalid the middleware will throw a BadRequestError
        // and this controller will not be invoked. We only trust the presence
        // of a valid `id` here and proceed with business-level checks.
        const id = String(req.params.id);

        const approver = await this.userRepository.findById(req.user!.id);
        if (!approver) throw new NotFoundError("Authenticated user not found");

        const teacherRecord = await this.teacherRepository.findById(id);
        if (!teacherRecord) throw new NotFoundError("Teacher academic background not found");

        if (teacherRecord.isApproved) {
            throw new BadRequestError("Teacher academic background is already approved");
        }

        const result = await this.approveTeacherAcademicBackgroundUseCase.execute({
            teacherAcademicBackgroundId: id,
            approverId: req.user!.id,
        });

        return res.status(200).json({ success: result });
    }
}