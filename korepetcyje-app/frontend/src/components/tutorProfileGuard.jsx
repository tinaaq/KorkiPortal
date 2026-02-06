import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getTutorProfile, isTutorProfileComplete } from "../services/profileService";

export default function TutorProfileGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [complete, setComplete] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTutorProfile();
        const profile = res.data;

        const ok = isTutorProfileComplete(profile);
        console.log("TutorProfileGuard -> profile", profile);
        console.log("TutorProfileGuard -> complete?", ok);

        setComplete(ok);
      } catch (e) {
        console.error("TutorProfileGuard error", e);
        setComplete(false);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return null;

  if (!complete && location.pathname !== "/tutor/profile") {
    return <Navigate to="/tutor/profile" replace />;
  }

  return children;
}