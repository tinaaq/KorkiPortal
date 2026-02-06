import { useEffect, useState } from "react";
import { getTutorProfile, isTutorProfileComplete } from "../services/profileService";

export function useTutorProfile() {
  const [profile, setProfile] = useState(null);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getTutorProfile();
        const p = res.data;
        setProfile(p);
        setComplete(isTutorProfileComplete(p));
      } catch (e) {
        console.error("useTutorProfile error", e);
        setProfile(null);
        setComplete(false);
        setError(
          e?.response?.data?.error || "Nie udało się pobrać profilu korepetytora"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { profile, complete, loading, error };
}