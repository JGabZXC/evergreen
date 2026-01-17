import {Outlet} from "react-router";
import StudentNavbar from "../components/StudentNavbar.tsx";

export default function StudentLayout() {
    return (
        <>
            <StudentNavbar />
            <main className="min-h-screen">
                <Outlet/>
            </main>
        </>
    )
}