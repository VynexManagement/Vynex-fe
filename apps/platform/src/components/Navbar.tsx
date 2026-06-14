"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Navbar as SharedNavbar } from "@leadflow/ui";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          email: session.user.email,
          name: (session.user.user_metadata?.name || session.user.email) as string,
        });
      } else {
        setUser(null);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email,
          name: (session.user.user_metadata?.name || session.user.email) as string,
        });
      } else {
        setUser(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("http://localhost:3000"); // Redirect to website landing
  };

  return (
    <SharedNavbar
      isMarketing={false}
      user={user}
      onLogout={handleLogout}
      activePath={pathname}
      loginUrl="/login"
      signupUrl="/signup"
      dashboardUrl="/dashboard"
      queryUrl="/query"
      homeUrl="http://localhost:3000"
    />
  );
}
