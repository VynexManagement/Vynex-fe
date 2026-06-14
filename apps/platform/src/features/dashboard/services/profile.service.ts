import { supabase } from "@/lib/supabase";
import { ProfileData } from "../types/dashboard.types";

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }
  return data;
};

export const updateProfile = async (userId: string, profile: ProfileData) => {
  const { error } = await supabase
    .from("profiles")
    .update({
      name: profile.name,
      org: profile.org,
      purpose: profile.purpose,
      phone: profile.phone,
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
};
