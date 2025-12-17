import { SectionModel } from "../../infrastructure/database/SectionModel";
import { ConflictError } from "../../interfaces/http/middleware/HttpErrors";

export class SectionValidationService {
  async validateRoomAvailability(
    roomId: string,
    schoolYear: string,
    excludeSectionId?: string
  ): Promise<void> {
    const query: Record<string, any> = {
      designatedRoom: roomId,
      schoolYear: schoolYear,
    };

    if (excludeSectionId) {
      query._id = { $ne: excludeSectionId };
    }

    const existingSection = await SectionModel.findOne(query);

    if (existingSection) {
      throw new ConflictError(
        `Room is already occupied by section "${existingSection.name}" in ${schoolYear}`
      );
    }
  }

  async validateAdviserAvailability(
    adviserId: string,
    schoolYear: string,
    excludeSectionId?: string
  ): Promise<void> {
    if (adviserId === "TBA") return;

    const query: any = {
      adviserId: adviserId,
      schoolYear: schoolYear,
    };

    if (excludeSectionId) {
      query._id = { $ne: excludeSectionId };
    }

    const existingSection = await SectionModel.findOne(query);

    if (existingSection) {
      throw new ConflictError(
        `Teacher is already advising section "${existingSection.name}" in ${schoolYear}`
      );
    }
  }
}
