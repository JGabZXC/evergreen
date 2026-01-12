import TeacherLayout from "../../shared/layouts/TeacherLayout.tsx";
import {DashboardTeacher} from "./pages/DashboardTeacher.tsx";
import MySections from "./pages/MySections.tsx";
import MyClasses from "./pages/MyClasses.tsx";
import MyAccount from "../../shared/components/MyAccount.tsx";
import MyStudents from "./pages/MyStudents.tsx";

export const teacherDashboardRoutes = [
    {
        element: <TeacherLayout/>,
        children: [
            {
                index: true,
                element: <DashboardTeacher/>
            },
            {
                path: "my-sections",
                element: <MySections/>
            },
            {
                path: "my-classes",
                element: <MyClasses/>
            },
            {
                path: "my-students",
                element: <MyStudents/>
            },
            {
                path: "my-account",
                element: <MyAccount/>
            }
        ],
    },
]