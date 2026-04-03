import { TeacherAcademicBackgroundRequest } from "../../application/dto/TeacherAcademicBackgroundRequest";
import { PaginatedResult } from "../../domain/common/Pagination";
import { TeacherAcademicBackground } from "../../domain/entities/TeacherAcademicBackground";
import {
    GetAllTeacherAcademicBackgroundFilter,
    ITeacherAcademicBackgroundRepository,
} from "../../domain/interfaces/ITeacherAcademicBackgroundRepository";
import {Prisma, TeacherDetailsType} from "../../generated/prisma/client";
import prisma from "../database/prisma/db";
import {TeacherAcademicBackgroundMapper} from "../mapper/TeacherAcademicBackgroundMapper";
import {NotFoundError} from "../../interfaces/http/middleware/HttpErrors";

export class PrismaTeacherAcademicBackgroundRepository implements ITeacherAcademicBackgroundRepository {
    async getAll(filter: GetAllTeacherAcademicBackgroundFilter, page: number, limit: number): Promise<PaginatedResult<TeacherAcademicBackground>> {
        const skip = (page - 1) * limit;

        const where: Prisma.TeacherAcademicBackgroundWhereInput = {};

        if (filter.userId) {
            where.userProfile = {userId: filter.userId}
        }

        if (filter.type) {
            where.type = {
                equals: filter.type as TeacherDetailsType,
            }
        }

        if (filter.isApproved) {
            where.isApproved = filter.isApproved;
        }


        if (filter.approvedBy && filter.approvedBy !== "all") {
            where.approvedById = filter.approvedBy;
        }

        const [rawTeacherAcademicBackground, totalItems] = await Promise.all([
            prisma.teacherAcademicBackground.findMany({
                where,
                skip,
                take: limit,
                orderBy: {createdAt: "desc"},
                include: {
                    userProfile: {include: {user: true}},
                    approvedBy: true
                }
            }),
            prisma.teacherAcademicBackground.count({where})
        ]);

        const data = rawTeacherAcademicBackground.map(TeacherAcademicBackgroundMapper.toDomain);
        const totalPages = Math.ceil(totalItems / limit);

        return {
            data,
            meta: {
                totalItems,
                itemCount: data.length,
                totalPages,
                currentPage: page,
            }
        }
    }
    async findAllByUserId(userId: string, page: number, limit: number): Promise<PaginatedResult<TeacherAcademicBackground>> {
        return await this.getAll({userId}, page, limit);
    }
    async create(data: TeacherAcademicBackgroundRequest, userProfileId: string): Promise<TeacherAcademicBackground> {
        const rawTeacherAcademicBackground = await prisma.teacherAcademicBackground.create({
            data: {
                userProfileId,
                ...data,
            },
            include: {
                userProfile: {include: {user: true}},
                approvedBy: true,
            }
        });

        return TeacherAcademicBackgroundMapper.toDomain(rawTeacherAcademicBackground);
    }
    async update(data: Partial<TeacherAcademicBackgroundRequest>, teacherAcademicBackgroundId: string): Promise<boolean> {
       try {
           await prisma.teacherAcademicBackground.update({
               where: {id: teacherAcademicBackgroundId},
               data: {
                   ...data,
               }
           });

           return true;
       } catch(error) {
           if (error instanceof Prisma.PrismaClientKnownRequestError) {
               if (error.code === "P2025") {
                   throw new NotFoundError(`TeacherAcademicBackground with id ${teacherAcademicBackgroundId} not found`);
               }
           }

           throw error;
       }
    }

    async findById(teacherAcademicBackgroundId: string): Promise<TeacherAcademicBackground> {
        const raw = await prisma.teacherAcademicBackground.findUnique({
            where: { id: teacherAcademicBackgroundId },
            include: {
                userProfile: { include: { user: true } },
                approvedBy: true,
            }
        });

        if (!raw) {
            throw new NotFoundError(`TeacherAcademicBackground with id ${teacherAcademicBackgroundId} not found`);
        }

        return TeacherAcademicBackgroundMapper.toDomain(raw);
    }

}