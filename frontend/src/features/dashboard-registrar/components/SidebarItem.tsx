import { motion } from "framer-motion";

export default function SidebarItem({
  icon: Icon,
  label,
  isActive,
  isOpen,
  onClick,
}: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${
        isActive
          ? "bg-primary text-primary-content shadow-md"
          : "hover:bg-base-200 text-base-content/80"
      }`}
    >
      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
      {isOpen && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-medium whitespace-nowrap"
        >
          {label}
        </motion.span>
      )}
    </button>
  );
}
