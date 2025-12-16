import type { TeacherProfile } from "../types";
import { motion } from "framer-motion";

export default function TeacherProfileSummary({
  profile,
}: {
  profile: TeacherProfile;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="card bg-base-100 shadow-xl h-full"
    >
      <div className="card-body flex flex-row items-center gap-5">
        <motion.div whileHover={{ scale: 1.05 }} className="avatar">
          <div className="w-20 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2">
            <img src={profile.avatarUrl} alt="avatar" />
          </div>
        </motion.div>
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
    </motion.div>
  );
}
