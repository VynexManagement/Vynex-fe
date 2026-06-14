import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

let domain: string | undefined = undefined;
if (typeof window !== "undefined") {
  const parts = window.location.hostname.split(".");
  if (parts.length >= 2) {
    domain = `.${parts.slice(-2).join(".")}`;
  }
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookieOptions: {
    domain,
    path: "/",
    sameSite: "lax",
    secure: typeof window !== "undefined" ? window.location.protocol === "https:" : true,
  }
});
