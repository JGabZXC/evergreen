import { PaginatedResult } from "../common/Pagination";
import { Section } from "../entities/Section";
import {
  CreateSectionRequest,
  UpdateSectionRequest,
} from "../../application/schemas/sectionSchemas";

export interface GetAllSectionFilter {
  roomId?: string;
  schoolYearId?: string;
  adviserId?: string;
  name?: string;
}

export interface ISectionRepository {
  getAll(
    filter: GetAllSectionFilter,
    page: number,
    limit: number,
    nested: boolean,
  ): Promise<PaginatedResult<Section>>;

  findById(sectionId: string, nested?: boolean): Promise<Section | null>;

  create(data: CreateSectionRequest): Promise<Section>;

  update(data: UpdateSectionRequest, sectionId: string): Promise<boolean>;

  delete(sectionId: string): Promise<boolean>;
}

