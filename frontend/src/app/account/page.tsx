"use client"
import { useAppData } from "@/context/AppContext";
import Loading from "../components/loading";
import Company from "./components/company";
import Info from "./components/info";
import Skills from "./components/skills";
import Appliedjobs from "./components/appliedJobs";

const AccountPage = () => {
  const { user, loading, applications } = useAppData();

  if (loading) return <Loading />;

  return (
    <>
      {user && (
        <div className="w-[90%] md:w-[60%] m-auto space-y-6">
          <Info user={user} isYourAccount={true} />

          {user.role === "jobseeker" && (
            <Skills user={user} isYourAccount={true} />
          )}
          {
            user.role ==="jobseeker" && <Appliedjobs applications={applications || []} />
          }
          {/* ✅ Recruiter tools ONLY on own profile */}
          {user.role === "recruiter" && <Company />}
        </div>
      )}
    </>
  );
};

export default AccountPage;
