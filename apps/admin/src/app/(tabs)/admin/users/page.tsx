"use client";

import { useEffect, useState } from "react";
import { Users, Loader2, ShieldCheck, UserX, UserCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { API_URL } from "@/lib/api";

interface Profile {
  id: string;
  name: string;
  email: string; // We'll map this from backend
  org: string;
  purpose: string;
  is_admin: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    setUpdating(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ is_admin: !currentStatus })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update role");
      }
      
      setUsers(users.map(u => u.id === userId ? { ...u, is_admin: !currentStatus } : u));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#eeeeee]/40">
        <Loader2 className="animate-spin w-8 h-8 mr-2 text-[#00adb5]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#00adb5]/10 border border-[#00adb5]/20 flex items-center justify-center">
          <Users className="w-6 h-6 text-[#00adb5]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#eeeeee]">User Management</h1>
          <p className="text-[#eeeeee]/60">View all users and manage admin privileges</p>
        </div>
      </div>

      {error ? (
        <div className="glass-card p-6 text-center text-[#ffdcdc]">{error}</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#00adb5]/20 bg-[#393e46]/30">
                  <th className="p-4 text-xs font-semibold text-[#eeeeee]/60 uppercase tracking-wider">User</th>
                  <th className="p-4 text-xs font-semibold text-[#eeeeee]/60 uppercase tracking-wider">Company/Purpose</th>
                  <th className="p-4 text-xs font-semibold text-[#eeeeee]/60 uppercase tracking-wider">Joined</th>
                  <th className="p-4 text-xs font-semibold text-[#eeeeee]/60 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-[#eeeeee]/60 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00adb5]/10">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#393e46]/20 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-[#eeeeee] flex items-center gap-2">
                        {user.name}
                        {user.is_admin && <ShieldCheck size={14} className="text-[#00adb5]" />}
                      </div>
                      <div className="text-sm text-[#eeeeee]/50">{user.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-[#eeeeee]">{user.org || "-"}</div>
                      <div className="text-xs text-[#eeeeee]/40 bg-[#393e46] inline-block px-2 py-0.5 rounded mt-1">
                        {user.purpose}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[#eeeeee]/60">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {user.is_admin ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#00adb5]/10 text-[#00adb5] border border-[#00adb5]/20">
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#393e46] text-[#eeeeee]/60 border border-[#eeeeee]/10">
                          User
                        </span>
                      )}
                    </td>
                    <td className="p-4 flex justify-end gap-2 text-right">
                      <button
                        onClick={(e) => toggleAdmin(user.id, user.is_admin, e)}
                        disabled={updating === user.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                          user.is_admin 
                            ? "bg-[#ffdcdc]/10 text-[#ffdcdc] hover:bg-[#ffdcdc]/20 border border-[#ffdcdc]/20" 
                            : "bg-[#00adb5]/10 text-[#00adb5] hover:bg-[#00adb5]/20 border border-[#00adb5]/20"
                        }`}
                      >
                        {updating === user.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : user.is_admin ? (
                          <><UserX size={14} /> Revoke Admin</>
                        ) : (
                          <><UserCheck size={14} /> Make Admin</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#eeeeee]/40">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
