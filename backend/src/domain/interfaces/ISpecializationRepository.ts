import {PaginatedResult} from "../common/Pagination";
import {Specialization} from "../entities/Specialization";
import {SpecializationRequest} from "../../application/dto/SpecializationRequest";

export interface GetAllSpecializationFilter {
    userId?: string;
    name?: string;
    isApproved?: boolean;
    approvedBy?: string;
}

export interface ISpecializationRepository {
    getAll(
        filter: GetAllSpecializationFilter,
        page: number,
        limit: number,
    ): Promise<PaginatedResult<Specialization>>;
    findByUserId(userId: string): Promise<PaginatedResult<Specialization>>;
    create(data: SpecializationRequest): Promise<Specialization>;
    update(data: Partial<SpecializationRequest>): Promise<Specialization>;

}