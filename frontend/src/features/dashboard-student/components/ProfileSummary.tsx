import type { StudentProfile } from "../types";

export default function ProfileSummary({
  profile,
}: {
  profile: StudentProfile;
}) {
  return (
    <div className="card bg-base-100 shadow-md border border-base-200 dark:border-white/10">
      <div className="card-body flex flex-row items-center gap-4">
        <div className="avatar">
          <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src={profile.avatarUrl} alt="avatar" />
          </div>
        </div>
        <div>
          <h2 className="card-title text-2xl">{profile.name}</h2>
          <p className="text-gray-500 font-mono text-sm">{profile.studentId}</p>
          <div className="flex gap-2 mt-2">
            <div className="badge badge-secondary badge-outline">
              {profile.program}
            </div>
            <div className="badge badge-accent badge-outline">
              {profile.yearLevel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
