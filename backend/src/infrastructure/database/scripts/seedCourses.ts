import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { SubjectModel } from "../SubjectModel";
import { CourseModel } from "../CourseModel";
import { Semester } from "../../../domain/types/Semester";
import { GradeLevel } from "../../../domain/types/GradeLevel";
import { BaseSubject } from "../../../domain/Subject";

dotenv.config({ path: "../../.env" });

// Helper to infer GradeLevel from Subject ID
const getGradeLevel = (subjectId: string): GradeLevel => {
  // Match first digit after letters
  const match = subjectId.match(/[A-Z]+(\d)/);
  if (match && match[1]) {
    const year = parseInt(match[1]);
    switch (year) {
      case 1:
        return GradeLevel.College1;
      case 2:
        return GradeLevel.College2;
      case 3:
        return GradeLevel.College3;
      case 4:
        return GradeLevel.College4;
      default:
        return GradeLevel.College1;
    }
  }
  return GradeLevel.College1;
};

// Helper to infer Semester from Subject ID or use available
const getSemester = (subjectId: string, available: number[]): Semester => {
  // If explicitly only 1 semester, use it
  if (available.length === 1) {
    return available[0] as Semester;
  }

  // Heuristic: 2nd digit is semester (common in trisemestral codes like 111, 121, 131)
  const match = subjectId.match(/[A-Z]+(\d)(\d)/);
  if (match && match[2]) {
    const sem = parseInt(match[2]);
    if (sem >= 1 && sem <= 3) {
      return sem as Semester;
    }
  }

  // Default to First if ambiguous
  return Semester.First;
};

// Explicit Curriculum Templates (Subject IDs)
const bsitCurriculumTemplate = [
  // Year 1
  {
    semester: Semester.First,
    gradeLevel: GradeLevel.College1,
    subjects: ["IT111", "GED101", "GED102", "FILI101", "PE101", "NSTP111"],
  },
  {
    semester: Semester.Second,
    gradeLevel: GradeLevel.College1,
    subjects: ["CS111", "GED106", "GED108", "GED104", "PE102", "NSTP121"],
  },
  {
    semester: Semester.Third,
    gradeLevel: GradeLevel.College1,
    subjects: ["CS131", "GED105", "GED109", "GED103", "FILI102"],
  },

  // Year 2
  {
    semester: Semester.First,
    gradeLevel: GradeLevel.College2,
    subjects: ["CS121", "CS211", "IT211", "MATH111", "PE103"],
  },
  {
    semester: Semester.Second,
    gradeLevel: GradeLevel.College2,
    subjects: ["IT221", "IT222", "IT212", "CPE405", "PHY101", "PE104"],
  },
  {
    semester: Semester.Third,
    gradeLevel: GradeLevel.College2,
    subjects: ["IT223", "MATH408", "ES101", "IT314"],
  },

  // Year 3
  {
    semester: Semester.First,
    gradeLevel: GradeLevel.College3,
    subjects: ["IT311", "IT312", "IT313", "IT321", "GED107"],
  },
  {
    semester: Semester.Second,
    gradeLevel: GradeLevel.College3,
    subjects: ["IT323", "IT322", "IT332", "IT325", "CS423"],
  },
  {
    semester: Semester.Third,
    gradeLevel: GradeLevel.College3,
    subjects: ["IT331", "IT414", "ELEC401", "ELEC402"],
  },

  // Year 4
  {
    semester: Semester.First,
    gradeLevel: GradeLevel.College4,
    subjects: ["IT324", "ENGG405", "IT412", "ELEC403"],
  },
  {
    semester: Semester.Second,
    gradeLevel: GradeLevel.College4,
    subjects: ["IT411", "IT413", "ELEC404", "ELEC405"],
  },
  {
    semester: Semester.Third,
    gradeLevel: GradeLevel.College4,
    subjects: ["IT421"],
  },
];

const bscsCurriculumTemplate = [
  // Year 1
  {
    semester: Semester.First,
    gradeLevel: GradeLevel.College1,
    subjects: [
      "IT111",
      "CS111",
      "GED101",
      "GED102",
      "FILI101",
      "PE101",
      "NSTP111",
    ],
  },
  {
    semester: Semester.Second,
    gradeLevel: GradeLevel.College1,
    subjects: ["CS121", "GED106", "GED108", "GED104", "PE102", "NSTP121"],
  },
  {
    semester: Semester.Third,
    gradeLevel: GradeLevel.College1,
    subjects: ["CS131", "GED105", "GED109", "GED103", "FILI102"],
  },

  // Year 2
  {
    semester: Semester.First,
    gradeLevel: GradeLevel.College2,
    subjects: ["CS211", "CS212", "IT211", "MATH111", "PE103"],
  },
  {
    semester: Semester.Second,
    gradeLevel: GradeLevel.College2,
    subjects: ["CS221", "CS222", "IT221", "IT212", "PHY101", "PE104"],
  },
  {
    semester: Semester.Third,
    gradeLevel: GradeLevel.College2,
    subjects: ["CS311", "CS312", "IT321", "IT314"],
  },

  // Year 3
  {
    semester: Semester.First,
    gradeLevel: GradeLevel.College3,
    subjects: ["IT331", "CS321", "CS322", "GED107"],
  },
  {
    semester: Semester.Second,
    gradeLevel: GradeLevel.College3,
    subjects: ["CS323", "CS324", "IT323", "CS423"],
  },
  {
    semester: Semester.Third,
    gradeLevel: GradeLevel.College3,
    subjects: ["CS331", "CSELEC1"],
  },

  // Year 4
  {
    semester: Semester.First,
    gradeLevel: GradeLevel.College4,
    subjects: ["CS411", "CS412", "CS413", "CS414", "CS415", "CSELEC2"],
  },
  {
    semester: Semester.Second,
    gradeLevel: GradeLevel.College4,
    subjects: ["CS421", "CS422", "ENGG405", "CSELEC3"],
  },
];

async function seedCourses() {
  try {
    // 1. Connect to Database
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // 2. Clear existing collections
    await CourseModel.deleteMany({});
    await SubjectModel.deleteMany({});
    console.log("Cleared Course and Subject collections.");

    // 3. Read JSON files
    const bscsRaw = JSON.parse(
      fs.readFileSync(path.join(__dirname, "json/bscs.subjects.json"), "utf8")
    );
    const bsitRaw = JSON.parse(
      fs.readFileSync(path.join(__dirname, "json/bsit.subjects.json"), "utf8")
    );

    // 4. Process Subjects (Merge and Insert)
    const allSubjectsMap = new Map<string, any>();

    const processSubjectList = (list: any[]) => {
      list.forEach((sub) => {
        if (!allSubjectsMap.has(sub.subjectId)) {
          allSubjectsMap.set(sub.subjectId, {
            ...sub,
            createdBy: "SYSTEM",
          });
        }
      });
    };

    processSubjectList(bscsRaw);
    processSubjectList(bsitRaw);

    const subjectsToInsert = Array.from(allSubjectsMap.values());
    const createdSubjects = await SubjectModel.insertMany(subjectsToInsert);
    console.log(`Seeded ${createdSubjects.length} unique subjects.`);

    // Map subjectId -> _id
    const subjectIdMap = new Map<string, mongoose.Types.ObjectId>();
    createdSubjects.forEach((s) => {
      subjectIdMap.set(s.subjectId, s._id as mongoose.Types.ObjectId);
    });

    // 5. Build Courses from Templates
    const buildCurriculumFromTemplate = (template: any[]) => {
      return template.map((item) => {
        const subjectIds = item.subjects
          .map((code: string) => {
            const id = subjectIdMap.get(code);
            if (!id)
              console.warn(
                `Warning: Subject ${code} not found in seeded subjects.`
              );
            return id;
          })
          .filter((id: any) => id !== undefined);

        return {
          semester: item.semester,
          gradeLevel: item.gradeLevel,
          subject: subjectIds,
        };
      });
    };

    const coursesData = [
      {
        name: "Bachelor of Science in Computer Science",
        code: "BSCS",
        gradeAvailable: "college",
        curriculum: buildCurriculumFromTemplate(bscsCurriculumTemplate),
      },
      {
        name: "Bachelor of Science in Information Technology",
        code: "BSIT",
        gradeAvailable: "college",
        curriculum: buildCurriculumFromTemplate(bsitCurriculumTemplate),
      },
    ];

    // 6. Seed Courses
    const createdCourses = await CourseModel.insertMany(coursesData);
    console.log(`Seeded ${createdCourses.length} courses.`);

    console.log("Seed complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding courses:", error);
    process.exit(1);
  }
}

seedCourses();
