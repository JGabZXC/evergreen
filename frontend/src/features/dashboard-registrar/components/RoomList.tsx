import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Filter,
  AlertCircle,
  DoorOpen,
  Users,
  Activity,
} from "lucide-react";
import { useRooms, useCreateRoom, useUpdateRoom } from "../hooks/useRooms";
import RoomModal from "./RoomModal";
import {
  RoomType,
  RoomStatus,
  type Room,
  type CreateRoomPayload,
} from "../types";
import { AnimatePresence, motion } from "framer-motion";

export default function RoomList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const ITEMS_PER_PAGE = 10;

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { rooms, totalPages, loading, error, refetch } = useRooms(
    currentPage,
    ITEMS_PER_PAGE,
    debouncedSearch,
    typeFilter,
    statusFilter
  );

  const { loading: createLoading, create } = useCreateRoom();
  const { loading: updateLoading, update } = useUpdateRoom();

  const handleAddClick = () => {
    setSelectedRoom(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: CreateRoomPayload) => {
    let success = false;
    if (selectedRoom) {
      success = await update(selectedRoom._id, data);
    } else {
      success = await create(data);
    }

    if (success) {
      refetch();
    }
    return success;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-4">
      {error && (
        <div role="alert" className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-3 items-start xl:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-2 w-full xl:w-auto flex-1">
          <div className="input input-bordered flex items-center gap-2 flex-1 w-full md:w-auto">
            <Search size={18} className="text-base-content/60" />
            <input
              type="text"
              placeholder="Search rooms..."
              className="grow min-w-[150px]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="relative flex-1 md:flex-none">
            <select
              className="select select-bordered w-full pl-9"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Types</option>
              {Object.values(RoomType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60 pointer-events-none z-10"
            />
          </div>

          <div className="relative flex-1 md:flex-none">
            <select
              className="select select-bordered w-full pl-9"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Status</option>
              {Object.values(RoomStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Activity
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60 pointer-events-none z-10"
            />
          </div>
        </div>

        <button
          onClick={handleAddClick}
          className="btn btn-primary gap-2 w-full xl:w-auto"
        >
          <Plus size={18} />
          Add Room
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <motion.div
            key={
              currentPage +
              typeFilter +
              statusFilter +
              searchTerm +
              rooms.length
            }
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {rooms.map((room) => (
              <motion.div
                key={room._id}
                variants={itemVariants}
                className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="card-body p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <DoorOpen size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{room.name}</h3>
                        <p className="text-xs text-base-content/60">
                          {room.type}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`badge ${
                        room.isActive
                          ? "badge-success badge-outline"
                          : "badge-error badge-outline"
                      }`}
                    >
                      {room.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>

                  <div className="divider my-2"></div>

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1 text-base-content/70">
                      <Users size={16} />
                      <span>Capacity: {room.capacity}</span>
                    </div>
                    <div
                      className={`badge badge-sm ${
                        room.status === RoomStatus.Open
                          ? "badge-ghost"
                          : "badge-warning"
                      }`}
                    >
                      {room.status}
                    </div>
                  </div>

                  <div className="card-actions justify-end mt-4">
                    <button
                      onClick={() => handleEditClick(room)}
                      className="btn btn-sm btn-ghost"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {rooms.length === 0 && (
              <div className="col-span-full text-center py-10 text-base-content/50">
                No rooms found.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <div className="join">
            <button
              className="join-item btn btn-sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              «
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`join-item btn btn-sm ${
                  currentPage === page ? "btn-active" : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="join-item btn btn-sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              »
            </button>
          </div>
        </div>
      )}

      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedRoom}
        isLoading={createLoading || updateLoading}
      />
    </div>
  );
}
