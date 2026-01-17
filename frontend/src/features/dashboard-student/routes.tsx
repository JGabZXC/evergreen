import StudentLayout from "../../shared/layouts/StudentLayout.tsx";
import {DashboardStudent} from "./pages/DashboardStudent.tsx";
import MyCurriculumChecklist from "./components/MyCurriculumChecklist.tsx";

export const studentDashboardRoutes = [
    {
        element: <StudentLayout />,
        children: [
            {
                index: true,
                element: <DashboardStudent />
            },
            {
                path: "my-curriculum",
                element: <MyCurriculumChecklist />
            }
        ]
    }
]