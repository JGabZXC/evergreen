import type { Adviser } from "../types";

export default function AdviserCard({ adviser }: { adviser: Adviser }) {
  return (
    <div className="card bg-base-100 shadow-md border border-base-200 h-full dark:border-white/10">
      <div className="card-body">
        <h3 className="card-title text-xs uppercase text-gray-500 tracking-wider mb-2">
          Academic Adviser
        </h3>
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-12">
              <span className="text-xl">{adviser.name.charAt(0)}</span>
            </div>
          </div>
          <div>
            <p className="font-bold">{adviser.name}</p>
            <p className="text-xs text-gray-500">{adviser.department}</p>
            <a
              href={`mailto:${adviser.email}`}
              className="link link-primary text-xs no-underline hover:underline"
            >
              {adviser.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
