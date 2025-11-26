import { useNavigate, useSearchParams } from "react-router";
import { useEffect } from "react";
import { DashboardStudent } from "../../dashboard-student/pages/DashboardStudent";
import { DashboardTeacher } from "../../dashboard-teacher/pages/DashboardTeacher";
import DashboardRegistrar from "../../dashboard-registrar/pages/DashboardRegistrar";
import DashboardAppointer from "../../dashboard-appointer/pages/DashboardAppointer";

export default function DashboardMain() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const navigate = useNavigate();

  // TODO: We will based on user role, query params for now

  useEffect(() => {
    if (
      type !== "student" &&
      type !== "teacher" &&
      type !== "registrar" &&
      type !== "appointer"
    ) {
      navigate("/", { replace: true });
    }
  }, [type, navigate]);

  if (type === "student") {
    return <DashboardStudent />;
  }

  if (type === "teacher") {
    return <DashboardTeacher />;
  }

  if (type === "registrar") {
    return <DashboardRegistrar />;
  }

  if (type === "appointer") {
    return <DashboardAppointer />;
  }

  return null;
}
