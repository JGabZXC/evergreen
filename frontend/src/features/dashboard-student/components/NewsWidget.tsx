import { CalendarIcon } from "lucide-react";
import type { NewsItem } from "../types";

export default function NewsWidget({ news }: { news: NewsItem[] }) {
  return (
    <div className="card bg-base-100 shadow-md border border-base-200 h-full dark:border-white/10">
      <div className="card-body">
        <h3 className="card-title mb-4 border-l-4 border-primary pl-3">
          Featured News
        </h3>
        <ul className="space-y-4">
          {news.map((item) => (
            <li key={item.id} className="group cursor-pointer">
              <div className="flex justify-between items-start">
                <span className="font-bold group-hover:text-primary transition-colors">
                  {item.title}
                </span>
                <span className="badge badge-ghost badge-sm text-[10px] uppercase tracking-wide">
                  {item.category}
                </span>
              </div>
              <p className="text-sm text-base-content/60 mt-1 line-clamp-2">
                {item.summary}
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                <CalendarIcon className="w-3 h-3" />
                <span>{item.date}</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="card-actions justify-center mt-auto pt-4">
          <button className="btn btn-ghost btn-sm btn-block text-primary border-primary hover:bg-primary hover:text-primary-content">
            View All News
          </button>
        </div>
      </div>
    </div>
  );
}
