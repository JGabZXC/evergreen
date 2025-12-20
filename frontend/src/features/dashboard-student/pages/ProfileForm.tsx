import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { studentService } from "../services/studentService";
import type { StudentProfile } from "../../../shared/types";

export function ProfileForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StudentProfile>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phoneNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: 0,
    },
    guardianDetails: {
      name: "",
      contact: "",
      relation: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await studentService.getDashboardData();
      if (data.student.profile) {
        setFormData(data.student.profile);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await studentService.updateProfile(formData);
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Student Profile</h1>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">First Name</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">Last Name</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">Phone Number</label>
                <input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="input input-bordered"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control md:col-span-2">
                <label className="label">Street</label>
                <input
                  name="address.street"
                  value={formData.address?.street}
                  onChange={handleChange}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">City</label>
                <input
                  name="address.city"
                  value={formData.address?.city}
                  onChange={handleChange}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">State/Province</label>
                <input
                  name="address.state"
                  value={formData.address?.state}
                  onChange={handleChange}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">Zip Code</label>
                <input
                  type="number"
                  name="address.zipCode"
                  value={formData.address?.zipCode}
                  onChange={handleChange}
                  className="input input-bordered"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Guardian Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">Guardian Name</label>
                <input
                  name="guardianDetails.name"
                  value={formData.guardianDetails?.name}
                  onChange={handleChange}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">Contact Number</label>
                <input
                  name="guardianDetails.contact"
                  value={formData.guardianDetails?.contact}
                  onChange={handleChange}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">Relation</label>
                <input
                  name="guardianDetails.relation"
                  value={formData.guardianDetails?.relation}
                  onChange={handleChange}
                  className="input input-bordered"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`btn btn-primary ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
