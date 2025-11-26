import { AnimatePresence, motion } from "framer-motion";
import { Search, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { StaffMember } from "../types";

const MOCK_STAFF: StaffMember[] = [
  {
    id: "A-001",
    name: "Jane Doe",
    role: "Admin",
    department: "Registrar Office",
    dateAppointed: "2020-01-15",
    status: "Active",
  },
  {
    id: "T-001",
    name: "Benigno Cruz",
    role: "Teacher",
    department: "Mathematics",
    dateAppointed: "2021-06-23",
    status: "Active",
  },
  {
    id: "S-001",
    name: "Maria Clara",
    role: "Staff",
    department: "Library",
    dateAppointed: "2022-03-10",
    status: "Active",
  },
  {
    id: "T-002",
    name: "Adela Santos",
    role: "Teacher",
    department: "Science",
    dateAppointed: "2019-11-05",
    status: "Active",
  },
  {
    id: "S-002",
    name: "Jose Rizal",
    role: "Staff",
    department: "Maintenance",
    dateAppointed: "2023-08-01",
    status: "On Leave",
  },
  {
    id: "T-003",
    name: "Carla Dizon",
    role: "Teacher",
    department: "English",
    dateAppointed: "2021-02-14",
    status: "Active",
  },
  {
    id: "A-002",
    name: "Admin Two",
    role: "Admin",
    department: "IT Support",
    dateAppointed: "2024-01-10",
    status: "Active",
  },
  {
    id: "T-004",
    name: "David Lim",
    role: "Teacher",
    department: "Engineering",
    dateAppointed: "2020-09-30",
    status: "Active",
  },
];

export default function StaffDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter Data
  const filteredStaff = MOCK_STAFF.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const currentData = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="card bg-base-100 shadow-md border border-base-200 overflow-hidden">
      <div className="p-6 border-b border-base-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-lg font-bold">Personnel Directory</h2>
        <div className="join w-full md:w-auto">
          <input
            className="input input-bordered join-item w-full md:w-64"
            placeholder="Search name, role, or dept..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to page 1 on search
            }}
          />
          <button className="btn join-item btn-square">
            <Search size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Date Appointed</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="wait">
              {currentData.map((staff) => (
                <motion.tr
                  key={staff.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td className="font-mono opacity-70">{staff.id}</td>
                  <td className="font-bold">{staff.name}</td>
                  <td>
                    <span
                      className={`badge ${
                        staff.role === "Admin"
                          ? "badge-primary"
                          : staff.role === "Teacher"
                          ? "badge-secondary"
                          : "badge-accent"
                      } badge-outline`}
                    >
                      {staff.role}
                    </span>
                  </td>
                  <td>{staff.department}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="opacity-50" />
                      {new Date(staff.dateAppointed).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        staff.status === "Active"
                          ? "badge-success text-white"
                          : "badge-warning text-white"
                      }`}
                    >
                      {staff.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredStaff.length === 0 && (
          <div className="p-12 text-center text-base-content/50">
            <Users size={48} className="mx-auto mb-4 opacity-20" />
            <p>No personnel found matching "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredStaff.length > 0 && (
        <div className="p-4 border-t border-base-200 flex justify-between items-center bg-base-50">
          <span className="text-sm text-base-content/60">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredStaff.length)} of{" "}
            {filteredStaff.length}
          </span>
          <div className="join">
            <button
              className="join-item btn btn-sm"
              onClick={handlePrev}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <button className="join-item btn btn-sm pointer-events-none">
              Page {currentPage} of {totalPages}
            </button>
            <button
              className="join-item btn btn-sm"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
