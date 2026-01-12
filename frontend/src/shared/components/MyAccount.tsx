import {useMyProfile} from "../hooks/useMyProfile.ts";
import SimpleLoading from "./SimpleLoading.tsx";
import AccountDetails from "./account/AccountDetails";
import PersonalInformation from "./account/PersonalInformation";
import EmploymentDetails from "./account/EmploymentDetails";
import StudentInformation from "./account/StudentInformation";

export default function MyAccount() {
    const {profile, loading, error} = useMyProfile();

    return (
        <section className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-base-content">My Account</h1>
            </div>

            <div className="min-h-[50vh]">
                {loading ? (
                    <SimpleLoading/>
                ) : error ? (
                    <div className="alert alert-error shadow-lg">
                        <span>{error}</span>
                    </div>
                ) : profile && (
                    <div className="space-y-6">
                        <AccountDetails profile={profile} />
                        <PersonalInformation profile={profile} />
                        {profile.staff && <EmploymentDetails profile={profile} />}
                        {profile.student && <StudentInformation profile={profile} />}
                    </div>
                )}
            </div>
        </section>
    );
}

