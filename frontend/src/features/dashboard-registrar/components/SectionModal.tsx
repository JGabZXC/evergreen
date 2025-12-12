import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { GradeLevel, type CreateSectionPayload, type Section } from "../types";
import { useRooms } from "../hooks/useRooms";
import { useTeachers } from "../hooks/useTeachers";
import { getCurrentSchoolYear } from "../../../utils/schoolYear";

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSectionPayload) => Promise<boolean>;
  initialData?: Section | null;
  isLoading: boolean;
}

export default function SectionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: SectionModalProps) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [adviserId, setAdviserId] = useState("TBA");
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(GradeLevel.Grade1);
  const [schoolYear, setSchoolYear] = useState(getCurrentSchoolYear()); // Should be dynamic
  const [capacity, setCapacity] = useState(40);
  const [designatedRoom, setDesignatedRoom] = useState("");

  // Fetch rooms for selection
  const { rooms } = useRooms(1, 100, "", "", "Open");
  // Fetch teachers for selection
  const { teachers, loading: loadingTeachers } = useTeachers(true);
  console.log(teachers);

  useEffect(() => {
    if (!modalRef.current) return;
    if (isOpen) {
      modalRef.current.showModal();
    } else {
      modalRef.current.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAdviserId(initialData.adviserId);
      setGradeLevel(initialData.gradeLevel);
      setSchoolYear(initialData.schoolYear);
      setCapacity(initialData.capacity);
      setDesignatedRoom(initialData.designatedRoom || "");
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setName("");
    setAdviserId("TBA");
    setGradeLevel(GradeLevel.Grade1);
    setSchoolYear(getCurrentSchoolYear());
    setCapacity(40);
    setDesignatedRoom("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit({
      name,
      adviserId: adviserId || "TBA",
      gradeLevel,
      schoolYear,
      capacity,
      designatedRoom: designatedRoom || undefined,
    });
    if (success) {
      onClose();
    }
  };

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box">
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h3 className="font-bold text-lg mb-4">
          {initialData ? "Edit Section" : "Add New Section"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Section Name</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Section A"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Adviser</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={adviserId}
              onChange={(e) => setAdviserId(e.target.value)}
              disabled={loadingTeachers}
            >
              <option value="TBA">TBA</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher.employeeId}>
                  {teacher.profile?.firstName} {teacher.profile?.lastName} (
                  {teacher.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Grade Level</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
            >
              {Object.values(GradeLevel).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">School Year</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 2023-2024"
              className="input input-bordered w-full"
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Capacity</span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              min={1}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Designated Room (Optional)</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={designatedRoom}
              onChange={(e) => setDesignatedRoom(e.target.value)}
            >
              <option value="">None</option>
              {rooms.map((room) => (
                <option key={room._id} value={room._id}>
                  {room.name} ({room.type})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : initialData ? (
                "Update"
              ) : (
                "Create"
              )}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
