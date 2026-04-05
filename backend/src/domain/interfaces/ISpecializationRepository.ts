import {PaginatedResult} from "../common/Pagination";
import {Specialization} from "../entities/Specialization";
import {SpecializationCreateRequest} from "../../application/dto/SpecializationCreateRequest";
import {Prisma} from "../../generated/prisma/client";

export interface GetAllSpecializationFilter {
    userId?: string;
    name?: string;
    isApproved?: boolean;
    approvedById?: string;
}

export interface ISpecializationRepository {
    getAll(
        filter: GetAllSpecializationFilter,
        page: number,
        limit: number,
    ): Promise<PaginatedResult<Specialization>>;
    findAllByUserId(userId: string, page: number, limit: number): Promise<PaginatedResult<Specialization>>;
    create(data: SpecializationCreateRequest, userProfileId: string): Promise<Specialization>;
    update(data: Prisma.SpecializationUpdateInput, id: string): Promise<boolean>;
}