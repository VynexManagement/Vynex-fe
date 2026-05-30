"use client";

import { useEffect, useState } from "react";
import { Zap, Plus, Loader2, Pencil, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { API_URL } from "@/lib/api";

interface SignalRow {
  id: string;
  name: string;
  slug?: string;
  type?: string;
  description?: string;
  rule_definition?: string;
  active?: boolean;
  is_active?: boolean;
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<SignalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSignal, setEditSignal] = useState({
    name: "",
    description: "",
    rule_definition: "",
    is_active: true,
  });
  const [newSignal, setNewSignal] = useState({
    name: "",
    slug: "",
    type: "base",
    description: "",
    rule_definition: "",
    is_active: true,
  });

  useEffect(() => {
    fetchSignals();
  }, []);

  const fetchSignals = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/admin/signals`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (res.ok) setSignals(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const normalizeActive = (sig: SignalRow) => sig.is_active ?? sig.active ?? false;

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${API_URL}/api/admin/signals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ is_active: !current, active: !current })
      });
      setSignals(signals.map(s => s.id === id ? { ...s, is_active: !current, active: !current } : s));
    } catch {
      alert("Failed to toggle");
    }
  };

  const createSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSignal.name.trim()) {
      alert("Signal name is required.");
      return;
    }
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const payload = {
        ...newSignal,
        slug: newSignal.slug || newSignal.name.toLowerCase().trim().replace(/\s+/g, "_"),
      };
      const res = await fetch(`${API_URL}/api/admin/signals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to create signal");
      }
      const created = await res.json();
      setSignals((prev) => [created, ...prev]);
      setNewSignal({ name: "", slug: "", type: "base", description: "", rule_definition: "", is_active: true });
      setShowNew(false);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to create signal");
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (signal: SignalRow) => {
    setEditingId(signal.id);
    setEditSignal({
      name: signal.name || "",
      description: signal.description || "",
      rule_definition: signal.rule_definition || "",
      is_active: normalizeActive(signal),
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/admin/signals/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(editSignal),
      });
      if (!res.ok) throw new Error("Failed to update signal");
      setSignals((prev) =>
        prev.map((signal) => (signal.id === editingId ? { ...signal, ...editSignal, active: editSignal.is_active } : signal))
      );
      setEditingId(null);
    } catch {
      alert("Failed to update signal");
    }
  };

  if (loading) return <div className="p-10"><Loader2 className="animate-spin text-[#00adb5]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#eeeeee]">Signal Engine</h1>
          <p className="text-[#eeeeee]/60">Manage detection rules for leads.</p>
        </div>
        <button
          onClick={() => setShowNew((prev) => !prev)}
          className="flex items-center gap-2 btn-primary px-4 py-2 font-semibold text-sm rounded-lg"
        >
          <Plus size={16} /> New Signal
        </button>
      </div>
      {showNew && (
        <form onSubmit={createSignal} className="glass-card p-5 space-y-3">
          <input
            value={newSignal.name}
            onChange={(e) => setNewSignal((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Signal name"
            className="w-full bg-[#393e46]/50 border border-[#00adb5]/18 rounded-xl px-4 py-2.5 text-sm text-[#eeeeee]"
          />
          <input
            value={newSignal.slug}
            onChange={(e) => setNewSignal((prev) => ({ ...prev, slug: e.target.value }))}
            placeholder="Slug (optional, auto-generated if empty)"
            className="w-full bg-[#393e46]/50 border border-[#00adb5]/18 rounded-xl px-4 py-2.5 text-sm text-[#eeeeee]"
          />
          <select
            value={newSignal.type}
            onChange={(e) => setNewSignal((prev) => ({ ...prev, type: e.target.value }))}
            className="w-full bg-[#393e46]/50 border border-[#00adb5]/18 rounded-xl px-4 py-2.5 text-sm text-[#eeeeee]"
          >
            <option value="base">Base</option>
            <option value="derived">Derived</option>
          </select>
          <input
            value={newSignal.description}
            onChange={(e) => setNewSignal((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Description"
            className="w-full bg-[#393e46]/50 border border-[#00adb5]/18 rounded-xl px-4 py-2.5 text-sm text-[#eeeeee]"
          />
          <textarea
            value={newSignal.rule_definition}
            onChange={(e) => setNewSignal((prev) => ({ ...prev, rule_definition: e.target.value }))}
            placeholder="Rule definition"
            rows={3}
            className="w-full bg-[#393e46]/50 border border-[#00adb5]/18 rounded-xl px-4 py-2.5 text-sm text-[#eeeeee]"
          />
          <div className="flex items-center justify-between">
            <label className="text-sm text-[#eeeeee]/70">
              <input
                type="checkbox"
                className="mr-2"
                checked={newSignal.is_active}
                onChange={(e) => setNewSignal((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
              Active
            </label>
            <button type="submit" disabled={creating} className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold">
              {creating ? "Creating..." : "Create Signal"}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {signals.map(sig => (
          <div key={sig.id} className="glass-card p-6 border-l-4" style={{borderLeftColor: normalizeActive(sig) ? "#22c55e" : "#ef4444"}}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-[#eeeeee] flex items-center gap-2">
                <Zap size={16} className={normalizeActive(sig) ? "text-[#22c55e]" : "text-[#ef4444]"} />
                {sig.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${normalizeActive(sig) ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                  {normalizeActive(sig) ? "Active" : "Inactive"}
                </span>
                <button onClick={() => toggleActive(sig.id, normalizeActive(sig))} className="text-xs bg-[#393e46]/60 px-2 py-1 rounded text-[#eeeeee]/60 hover:text-[#eeeeee]">
                  {normalizeActive(sig) ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => startEditing(sig)} className="text-xs bg-[#393e46]/60 px-2 py-1 rounded text-[#eeeeee]/60 hover:text-[#eeeeee] flex items-center gap-1">
                  <Pencil size={12} /> Edit
                </button>
              </div>
            </div>
            <p className="text-sm text-[#eeeeee]/50 h-10">{sig.description}</p>
            <p className="text-xs text-[#eeeeee]/40 mt-1">Slug: {sig.slug || "-"} | Type: {sig.type || "-"}</p>
            <div className="mt-4 bg-[#222831] p-3 rounded text-xs font-mono text-[#eeeeee]/40">
              {sig.rule_definition}
            </div>
            {editingId === sig.id && (
              <div className="mt-4 space-y-2 rounded-xl border border-[#00adb5]/20 bg-[#222831]/70 p-3">
                <input
                  value={editSignal.name}
                  onChange={(e) => setEditSignal((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-[#00adb5]/20 bg-[#393e46]/40 px-3 py-2 text-sm text-[#eeeeee]"
                  placeholder="Signal name"
                />
                <input
                  value={editSignal.description}
                  onChange={(e) => setEditSignal((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-lg border border-[#00adb5]/20 bg-[#393e46]/40 px-3 py-2 text-sm text-[#eeeeee]"
                  placeholder="Description"
                />
                <textarea
                  value={editSignal.rule_definition}
                  onChange={(e) => setEditSignal((prev) => ({ ...prev, rule_definition: e.target.value }))}
                  className="w-full rounded-lg border border-[#00adb5]/20 bg-[#393e46]/40 px-3 py-2 text-sm text-[#eeeeee]"
                  rows={3}
                  placeholder="Rule definition"
                />
                <label className="text-sm text-[#eeeeee]/70">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={editSignal.is_active}
                    onChange={(e) => setEditSignal((prev) => ({ ...prev, is_active: e.target.checked }))}
                  />
                  Active
                </label>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="rounded-lg bg-[#00adb5]/20 px-3 py-1.5 text-sm text-[#00adb5] flex items-center gap-1">
                    <Save size={14} /> Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="rounded-lg bg-[#393e46]/60 px-3 py-1.5 text-sm text-[#eeeeee]/70">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
