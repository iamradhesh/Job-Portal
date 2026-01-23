"use client";

import { user_service, useAppData } from "@/context/AppContext";
import { User } from "@/types";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Loading from "@/app/components/loading";
import Info from "../components/info";
import Skills from "../components/skills";
import Company from "@/app/account/components/company";

const UserAccountPage = () => {
  const { user: loggedInUser } = useAppData();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  async function fetchUser() {
    const token = Cookies.get("token");
    try {
      const { data } = await axios.get(`${user_service}/api/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileUser(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, [id]);

  if (loading) return <Loading />;

  const isOwnProfile = Boolean(
    loggedInUser?.user_id &&
      profileUser?.user_id &&
      String(loggedInUser.user_id) === String(profileUser.user_id)
  );

  return (
    <>
      {profileUser && (
        <div className="w-[90%] md:w-[60%] m-auto space-y-6">
          <Info user={profileUser} isYourAccount={isOwnProfile} />

          {profileUser.role === "jobseeker" && (
            <Skills user={profileUser} isYourAccount={isOwnProfile} />
          )}

          {/* ✅ ONLY recruiter + own profile */}
          {loggedInUser?.role === "recruiter" && isOwnProfile && <Company />}
        </div>
      )}
    </>
  );
};

export default UserAccountPage;
