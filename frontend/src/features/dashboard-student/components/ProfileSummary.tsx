import type { StudentAggregate } from "../types";

export default function ProfileSummary({
  student,
}: {
  student: StudentAggregate;
}) {
  const profile = student.profile;

  if (!profile) {
    return (
      <div className="card bg-base-100 shadow-md border border-base-200 dark:border-white/10">
        <div className="card-body">
          <div className="alert alert-warning">
            <span>Profile not set up. Please create your profile.</span>
          </div>
        </div>
      </div>
    );
  }

  const courseName =
    typeof student.course === "string" ? student.course : student.course?.name;

  return (
    <div className="card bg-base-100 shadow-md border border-base-200 dark:border-white/10">
      <div className="card-body flex flex-row items-center gap-4">
        <div className="avatar">
          <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="avatar" />
            ) : (
              <div className="bg-neutral text-neutral-content w-full h-full flex items-center justify-center text-2xl">
                {profile.firstName.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div>
          <h2 className="card-title text-2xl">{`${profile.firstName} ${profile.lastName}`}</h2>
          <p className="text-gray-500 font-mono text-sm">{student.studentId}</p>
          <div className="flex gap-2 mt-2">
            <div className="badge badge-secondary badge-outline">
              {courseName}
            </div>
            {/* Year level is not directly in Student model, usually derived from enrollment or calculated */}
            {/* <div className="badge badge-accent badge-outline">
              {student.yearLevel}
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
