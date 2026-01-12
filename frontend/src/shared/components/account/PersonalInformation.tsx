import type { UserProfile } from "../../hooks/useMyProfile";
import type { Address } from "../../types";

interface PersonalInformationProps {
    profile: UserProfile;
}

export default function PersonalInformation({ profile }: PersonalInformationProps) {
    const formatAddress = (addr?: Address) => {
        if (!addr) return "N/A";
        return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
    };

    const firstName = profile.student?.profile?.firstName || profile.staff?.profile?.firstName || "N/A";
    const lastName = profile.student?.profile?.lastName || profile.staff?.profile?.lastName || "N/A";
    const dob = profile.student?.profile?.dateOfBirth || profile.staff?.profile?.dateOfBirth;
    const phone = profile.student?.profile?.phoneNumber || profile.staff?.profile?.phoneNumber;
    const address = profile.student?.profile?.address || profile.staff?.profile?.address;

    return (
        <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-6">
                <h2 className="card-title text-xl font-bold mb-4 text-primary">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium text-base-content/70">First Name</span>
                        </label>
                        <input type="text" className="input input-bordered w-full bg-base-200 text-base-content" disabled value={firstName} />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium text-base-content/70">Last Name</span>
                        </label>
                        <input type="text" className="input input-bordered w-full bg-base-200 text-base-content" disabled value={lastName} />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium text-base-content/70">Date Of Birth</span>
                        </label>
                        <input type="text" className="input input-bordered w-full bg-base-200 text-base-content" disabled value={dob ? new Date(dob).toLocaleDateString() : "N/A"} />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium text-base-content/70">Phone Number</span>
                        </label>
                        <input type="text" className="input input-bordered w-full bg-base-200 text-base-content" disabled value={phone || "N/A"} />
                    </div>
                    <div className="form-control w-full md:col-span-2">
                        <label className="label">
                            <span className="label-text font-medium text-base-content/70">Address</span>
                        </label>
                        <input type="text" className="input input-bordered w-full bg-base-200 text-base-content" disabled value={formatAddress(address)} />
                    </div>
                </div>
            </div>
        </div>
    );
}

