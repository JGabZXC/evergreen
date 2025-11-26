import { MapPinIcon } from "lucide-react";
import type { EventItem } from "../types";
import { motion } from "framer-motion";
import { slideInRight } from "../../../shared/animations";

export function EventsWidget({ events }: { events: EventItem[] }) {
  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6 border-b border-base-200 pb-2">
        <h2 className="text-2xl font-bold text-base-content border-l-8 border-secondary pl-4">
          Events
        </h2>
        <button className="text-xs font-bold text-secondary hover:underline uppercase tracking-wide">
          Calendar
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {events.map((event) => {
          // Simple parsing for demo purposes to match Homepage "Day/Month" box
          const [month, day] = event.date.split(" ");

          return (
            <motion.div
              key={event.id}
              className="group flex items-center bg-base-100 p-4 rounded-xl shadow-sm border border-base-200 hover:shadow-md hover:border-secondary transition-all cursor-pointer dark:border-white/10"
              whileHover={{ x: 5 }}
              initial="hidden"
              whileInView="visible"
              variants={slideInRight}
              viewport={{ once: true }}
            >
              <div className="flex flex-col items-center justify-center w-16 h-16 bg-secondary/10 text-secondary rounded-lg mr-4 group-hover:bg-secondary group-hover:text-white transition-colors">
                <span className="text-xl font-black leading-none">{day}</span>
                <span className="text-xs font-bold uppercase">{month}</span>
              </div>
              <div>
                <h4 className="font-bold text-base-content leading-tight group-hover:text-secondary transition-colors">
                  {event.title}
                </h4>
                <span className="text-xs text-base-content/50 mt-1 flex gap-2 items-center">
                  <MapPinIcon className="w-3 h-3" /> {event.location}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
