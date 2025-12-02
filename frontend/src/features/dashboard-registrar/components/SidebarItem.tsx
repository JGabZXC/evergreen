import { motion } from "framer-motion";

export default function SidebarItem({
  icon: Icon,
  label,
  isActive,
  isOpen,
  onClick,
}: {
  icon: any;
  label: string;
  isActive: boolean;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center w-full h-12 transition-colors duration-200 group ${
        isActive
          ? "text-primary bg-primary/10 border-r-4 border-primary"
          : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
      }`}
    >
      {/* FIXED ICON CONTAINER - Prevents movement */}
      <div className="min-w-[80px] h-full flex items-center justify-center flex-shrink-0">
        <Icon
          size={22}
          className={`transition-colors ${isActive ? "text-primary" : ""}`}
        />
      </div>

      {/* TEXT CONTAINER - Handles fade without layout shift */}
      <div className="flex-1 overflow-hidden whitespace-nowrap text-left">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.2 }} // Smooth fade without unmounting
          className="text-sm font-medium block"
        >
          {label}
        </motion.span>
      </div>
    </button>
  );
}
