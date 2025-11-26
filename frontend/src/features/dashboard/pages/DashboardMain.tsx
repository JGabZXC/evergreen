import { useNavigate, useSearchParams } from "react-router";
import { useEffect } from "react";
import { DashboardStudent } from "../../dashboard-student/pages/DashboardStudent";
import { DashboardTeacher } from "../../dashboard-teacher/pages/DashboardTeacher";

export default function DashboardMain() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const navigate = useNavigate();

  // TODO: We will based on user role, query params for now

  useEffect(() => {
    if (type !== "student" && type !== "teacher") {
      navigate("/", { replace: true });
    }
  }, [type, navigate]);

  if (type === "student") {
    return <DashboardStudent />;
  }

  if (type === "teacher") {
    return <DashboardTeacher />;
  }
  // Render nothing while redirecting
  return null;
}
