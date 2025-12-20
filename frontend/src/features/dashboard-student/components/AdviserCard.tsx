import { type Section, type Staff } from "../../../shared/types";

export default function AdviserCard({ section }: { section?: Section }) {
  const adviser =
    typeof section?.adviserId === "object"
      ? (section.adviserId as Staff)
      : undefined;

  return (
    <div className="card bg-base-100 shadow-md border border-base-200 h-full dark:border-white/10">
      <div className="card-body">
        <h3 className="card-title text-xs uppercase text-gray-500 tracking-wider mb-2">
          Academic Adviser
        </h3>
        {adviser ? (
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-12">
                {
                  <span className="text-xl">
                    {adviser.profile?.firstName.charAt(0) || "?"}
                  </span>
                }
              </div>
            </div>
            <div>
              <p className="font-bold">{`${adviser.profile?.firstName || "?"} ${
                adviser.profile?.lastName || "?"
              }`}</p>
              <p className="text-xs text-gray-500">
                {adviser.profile?.department || "Department N/A"}
              </p>
              <a
                href={`mailto:${adviser.userId}`}
                className="link link-primary text-xs no-underline hover:underline"
              >
                Email
              </a>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-12">
                <span className="text-xl">?</span>
              </div>
            </div>
            <div>
              <p className="font-bold">TBA</p>
              <p className="text-xs text-gray-500">Adviser not assigned yet</p>
            </div>
          </div>
        )}
        {section && (
          <div className="mt-4 pt-4 border-t border-base-200 dark:border-white/10">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Section
            </p>
            <p className="font-bold">{section.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}
