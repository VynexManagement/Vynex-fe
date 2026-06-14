import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getProfile, updateProfile } from "../services/profile.service";
import { ProfileData } from "../types/dashboard.types";

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData>({ name: "", org: "", purpose: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fetchProfileData = async () => {
    setLoading(true);
    setError("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const data = await getProfile(user.id);
      if (data) {
        setProfile({
          name: data.name || "",
          org: data.org || "",
          purpose: data.purpose || "",
          phone: data.phone || "",
        });
      } else {
        setProfile({
          name: user.user_metadata.name || "",
          org: user.user_metadata.org || "",
          purpose: user.user_metadata.purpose || "",
          phone: user.user_metadata.phone || "",
        });
      }
    } catch (err) {
      console.error("Profile fetch failed:", err);
      setError("Could not fetch profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (updatedData: ProfileData) => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not logged in");

      await updateProfile(user.id, updatedData);
      setProfile(updatedData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Profile update failed:", err);
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  return {
    profile,
    setProfile,
    loading,
    saving,
    error,
    success,
    saveProfile: handleSaveProfile,
    refetch: fetchProfileData,
  };
}
