import { StudentAggregate } from "../../dashboard-registrar/types";
import { SubjectSchedule, SubjectTaken } from "../../../shared/types";

export type { StudentAggregate };

export interface StudentScheduleResponse {
  schedules: SubjectSchedule[];
  enrolledSubjects: SubjectTaken[];
}
