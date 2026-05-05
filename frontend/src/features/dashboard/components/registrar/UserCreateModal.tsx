import { useState } from "react";
import axios from "axios";
import { useForm, type FieldPath, type FieldPathValue, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { userCreateSchema, type UserCreate } from "../../types/userCreate.schema";
import { createUser } from "../../../../shared/services/registrarService";
import { Role } from "../../../auth/types/auth.types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function UserCreateModal({ open, onClose, onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<UserCreate>({
    // zodResolver types can be slightly incompatible for coerced values; cast to the expected Resolver type
    resolver: zodResolver(userCreateSchema) as unknown as Resolver<UserCreate>,
    mode: "onTouched",
  });

  const next = async () => {
    let fields: string[] = [];
    if (step === 0) fields = ["user.email", "user.password", "user.role"];
    if (step === 1)
      fields = [
        "userProfile.firstName",
        "userProfile.lastName",
        "userProfile.dateOfBirth",
        "userProfile.contactNumber",
      ];
    if (step === 2)
      fields = [
        "userAddress.homeAddress",
        "userAddress.barangay",
        "userAddress.municipality",
        "userAddress.province",
        "userAddress.region",
      ];

    const ok = await trigger(fields as FieldPath<UserCreate>[]);
    if (ok) setStep((s) => Math.min(s + 1, 2));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (data: UserCreate) => {
    try {
      await createUser(data);
      onSuccess?.();
      onClose();
    } catch (err) {
      // map server validation details (backend zod tree) into form errors
      if (axios.isAxiosError(err)) {
        type ZodDetailsNode = {
          errors?: string[];
          properties?: Record<string, ZodDetailsNode>;
        };

        const details = (err.response?.data as unknown as { error?: { details?: ZodDetailsNode } })?.error?.details;
        if (details?.properties) {
          const walk = (node: ZodDetailsNode, prefix = "") => {
            const props = node.properties || {};
            Object.keys(props).forEach((k) => {
              const item = props[k];
              const path = prefix ? `${prefix}.${k}` : k;
              if (item.errors && Array.isArray(item.errors) && item.errors.length > 0) {
                const msg = item.errors.join(", ");
                try {
                  setError(path as FieldPath<UserCreate>, { type: "server", message: msg });
                } catch {
                  // ignore if path doesn't match form fields
                }
              }
              if (item.properties) walk(item, path);
            });
          };

          walk(details);
        }
      }

      console.error("Create user failed", err);
    }
  };

  if (!open) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-3xl">
        <h3 className="font-bold text-lg">Create User</h3>

        <div className="pt-4">
          <ul className="steps w-full">
            <li className={`step ${step >= 0 ? "step-primary" : ""}`}>User</li>
            <li className={`step ${step >= 1 ? "step-primary" : ""}`}>Profile</li>
            <li className={`step ${step >= 2 ? "step-primary" : ""}`}>Address</li>
          </ul>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
            {step === 0 && (
              <div className="space-y-3">
                <div>
                  <label className="label">Email</label>
                  <input className="input input-bordered w-full" {...register("user.email")} />
                  {errors.user?.email && <p className="text-sm text-error">{String(errors.user.email.message)}</p>}
                </div>

                <div>
                  <label className="label">Password</label>
                  <input type="password" className="input input-bordered w-full" {...register("user.password")} />
                  {errors.user?.password && (
                    <p className="text-sm text-error">{String(errors.user.password.message)}</p>
                  )}
                </div>

                <div>
                  <label className="label">Role</label>
                  <select className="select select-bordered w-full" {...register("user.role" as FieldPath<UserCreate>)}>
                    {Object.values(Role).map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  {errors.user?.role && <p className="text-sm text-error">{String(errors.user.role?.message ?? "")}</p>}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <div>
                  <label className="label">First name</label>
                  <input className="input input-bordered w-full" {...register("userProfile.firstName")} />
                  {errors.userProfile?.firstName && (
                    <p className="text-sm text-error">{String(errors.userProfile.firstName.message)}</p>
                  )}
                </div>

                <div>
                  <label className="label">Middle name</label>
                  <input className="input input-bordered w-full" {...register("userProfile.middleName")} />
                </div>

                <div>
                  <label className="label">Last name</label>
                  <input className="input input-bordered w-full" {...register("userProfile.lastName")} />
                  {errors.userProfile?.lastName && (
                    <p className="text-sm text-error">{String(errors.userProfile.lastName.message)}</p>
                  )}
                </div>

                <div>
                  <label className="label">Date of birth</label>
                  <DayPicker
                    mode="single"
                    onSelect={(d) =>
                      setValue(
                        "userProfile.dateOfBirth" as FieldPath<UserCreate>,
                        d as FieldPathValue<UserCreate, "userProfile.dateOfBirth">
                      )
                    }
                  />
                  {errors.userProfile?.dateOfBirth && (
                    <p className="text-sm text-error">{String(errors.userProfile.dateOfBirth?.message ?? "")}</p>
                  )}
                </div>

                <div>
                  <label className="label">Contact number</label>
                  <input className="input input-bordered w-full" {...register("userProfile.contactNumber")} />
                  {errors.userProfile?.contactNumber && (
                    <p className="text-sm text-error">{String(errors.userProfile.contactNumber.message)}</p>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div>
                  <label className="label">Home address</label>
                  <input className="input input-bordered w-full" {...register("userAddress.homeAddress")} />
                  {errors.userAddress?.homeAddress && (
                    <p className="text-sm text-error">{String(errors.userAddress.homeAddress.message)}</p>
                  )}
                </div>

                <div>
                  <label className="label">Barangay</label>
                  <input className="input input-bordered w-full" {...register("userAddress.barangay")} />
                  {errors.userAddress?.barangay && (
                    <p className="text-sm text-error">{String(errors.userAddress.barangay.message)}</p>
                  )}
                </div>

                <div>
                  <label className="label">Municipality</label>
                  <input className="input input-bordered w-full" {...register("userAddress.municipality")} />
                  {errors.userAddress?.municipality && (
                    <p className="text-sm text-error">{String(errors.userAddress.municipality.message)}</p>
                  )}
                </div>

                <div>
                  <label className="label">Province</label>
                  <input className="input input-bordered w-full" {...register("userAddress.province")} />
                  {errors.userAddress?.province && (
                    <p className="text-sm text-error">{String(errors.userAddress.province.message)}</p>
                  )}
                </div>

                <div>
                  <label className="label">Region</label>
                  <input className="input input-bordered w-full" {...register("userAddress.region")} />
                  {errors.userAddress?.region && (
                    <p className="text-sm text-error">{String(errors.userAddress.region.message)}</p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 justify-end">
              <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              {step > 0 && (
                <button type="button" className="btn" onClick={prev} disabled={isSubmitting}>
                  Prev
                </button>
              )}
              {step < 2 && (
                <button type="button" className="btn btn-primary" onClick={next} disabled={isSubmitting}>
                  Next
                </button>
              )}
              {step === 2 && (
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create User"}
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="modal-action">
          {/* empty to keep modal-box layout consistent */}
        </div>
      </div>
    </div>
  );
}






