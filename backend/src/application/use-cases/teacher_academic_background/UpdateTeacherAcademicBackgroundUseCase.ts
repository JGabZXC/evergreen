import {ITeacherAcademicBackgroundRepository} from "../../../domain/interfaces/ITeacherAcademicBackgroundRepository";
import {IUpdateTeacherAcademicBackgroundUseCase, UpdateTeacherAcademicBackgroundRequest} from "./IUpdateTeacherAcademicBackgroundUseCase";
import {IUserRepository} from "../../../domain/interfaces/IUserRepository";

export class UpdateTeacherAcademicBackgroundUseCase implements IUpdateTeacherAcademicBackgroundUseCase {
    constructor(
        public readonly teacherAcademicBackgroundRepository: ITeacherAcademicBackgroundRepository,
    ) {}

    async execute(request: UpdateTeacherAcademicBackgroundRequest): Promise<boolean> {
        const { id, data } = request;

        return await this.teacherAcademicBackgroundRepository.update(data, id);
    }
}


