import type { TeacherProfile } from "../types";

export default function TeacherProfileSummary({
  profile,
}: {
  profile: TeacherProfile;
}) {
  return (
    <div className="card bg-base-100 shadow-xl border border-base-200 h-full dark:border-white/10">
      <div className="card-body flex flex-row items-center gap-5">
        <div className="avatar">
          <div className="w-20 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2">
            <img src={profile.avatarUrl} alt="avatar" />
          </div>
        </div>
        <div>
          <h2 className="card-title text-2xl">{profile.name}</h2>
          <p className="text-secondary font-medium text-sm">
            {profile.position}
          </p>
          <p className="text-gray-500 text-xs mt-1">{profile.department}</p>
          <div className="badge badge-ghost badge-sm mt-2 font-mono">
            {profile.employeeId}
          </div>
        </div>
      </div>
    </div>
  );
}
