"use client";

import React, { useEffect, useState } from "react";
import { 
  Download, 
  Database,
  Globe,
  Tag,
  Loader2,
  X,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Info,
  Eye
} from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import AuthGuard from "@/components/AuthGuard";
import { usePurchases } from "@/features/dashboard/hooks/usePurchases";
import { useDownloadLeads } from "@/features/dashboard/hooks/useDownloadLeads";

function HoverBadgeTooltip({ items }: { items: string[] }) {
  if (items.length === 0) return <span className="text-slate-400 text-xs">—</span>;

  return (
    <div className="relative group inline-flex items-center gap-1.5 cursor-pointer">
      <span className="text-slate-700 font-semibold text-xs">{items.length}</span>
      <Info size={12} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
      
      {/* Tooltip Content - opens downwards to avoid vertical screen clipping */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 mb-2 hidden group-hover:flex flex-col gap-1.5 p-2.5 bg-white border border-slate-100 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-50 min-w-[150px] max-w-[250px] transition-all duration-200">
        <div className="flex flex-wrap gap-1">
          {items.map((val, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-slate-100 text-slate-500 border border-slate-200/20"
            >
              {val}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function LibraryContent() {
  const [alertMessage, setAlertMessage] = useState("");
  const { data: purchases = [], isLoading, error } = usePurchases();
  const downloadLeadsMutation = useDownloadLeads();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  
  // Excel preview states
  const [viewingPurchaseId, setViewingPurchaseId] = useState<string | null>(null);
  const [viewLeads, setViewLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [viewSearchQuery, setViewSearchQuery] = useState("");
  const [viewingPurchaseName, setViewingPurchaseName] = useState("");

  const queryClient = useQueryClient();

  useEffect(() => {
    // Check for success alert flag from the preview page
    const alert = localStorage.getItem("library_alert");
    if (alert) {
      setAlertMessage(alert);
      localStorage.removeItem("library_alert");
    }
  }, []);

  const formatDateString = (dateStr?: string) => {
    const date = dateStr ? new Date(dateStr) : new Date();
    try {
      const day = date.getDate();
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return "18-June-2026";
    }
  };

  const getItemsList = (str?: string) => {
    if (!str) return [];
    return str.split(",").map(x => x.trim()).filter(Boolean);
  };

  const handleSaveName = async (purchaseId: string) => {
    if (!editName.trim()) return;
    setSavingId(purchaseId);
    try {
      const { apiClient } = await import("@/lib/api/axios");
      await apiClient.patch(`/api/purchases/${purchaseId}/rename`, { name: editName.trim() });
      await queryClient.invalidateQueries({ queryKey: ["purchases"] });
    } catch (err: any) {
      alert(err?.message || "Failed to save name.");
    } finally {
      setSavingId(null);
      setEditingId(null);
    }
  };

  const handleDownload = async (datasetId: string, niche: string) => {
    try {
      await downloadLeadsMutation.mutateAsync({ datasetId, niche });
    } catch (err: any) {
      alert(err?.message || "CSV download failed.");
    }
  };

  const handleDownloadAll = async () => {
    if (purchases.length === 0) {
      alert("No purchased lists available to download.");
      return;
    }
    const first = purchases[0];
    handleDownload(first.dataset_id, first.niche);
  };

  const handleOpenExcelView = async (purchaseId: string, purchaseName: string) => {
    setViewingPurchaseId(purchaseId);
    setViewingPurchaseName(purchaseName);
    setLoadingLeads(true);
    setViewSearchQuery("");
    try {
      const { apiClient } = await import("@/lib/api/axios");
      const res = await apiClient.get(`/api/purchases/${purchaseId}/leads`);
      setViewLeads(res.data);
    } catch (err: any) {
      alert(err?.message || "Failed to load dataset leads.");
    } finally {
      setLoadingLeads(false);
    }
  };

  const listToRender = purchases.map((p: any) => {
    const defaultName = formatDateString(p.purchase_date);
    return {
      id: p.id,
      dataset_id: p.dataset_id,
      name: p.name || defaultName,
      url: `dataset-${p.dataset_id ? p.dataset_id.slice(0, 8) : "data"}.csv`,
      niche: p.niche ? p.niche.toUpperCase() : "",
      country: p.country || "",
      isReal: true
    };
  });

  const filteredLeads = viewLeads.filter((lead) => {
    const q = viewSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      lead.store_name?.toLowerCase().includes(q) ||
      lead.url?.toLowerCase().includes(q) ||
      lead.niche?.toLowerCase().includes(q) ||
      lead.country?.toLowerCase().includes(q) ||
      lead.signal?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen px-6 py-10 max-w-6xl mx-auto space-y-6 select-none">
      
      {/* Alert Banner */}
      {alertMessage && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex justify-between items-start gap-3 shadow-[0_10px_30px_-15px_rgba(99,102,241,0.05)]">
          <div className="flex gap-3 text-[#6366f1] text-xs font-semibold">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-extrabold text-slate-900 block">Dataset successfully added to your library</span>
              <p className="text-slate-500 font-medium">{alertMessage}</p>
            </div>
          </div>
          <button 
            onClick={() => setAlertMessage("")}
            className="text-slate-400 hover:text-slate-900 p-1 cursor-pointer transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Lead Library
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your purchased leads and export them to your sales tools.
          </p>
        </div>
        <button
          onClick={handleDownloadAll}
          className="bg-[#6366f1] text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-[#4f46e5] shadow-md hover:shadow-indigo-500/15 transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <Download size={14} />
          <span>Download All CSV</span>
        </button>
      </div>

      {/* Leads Library List Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.02)] p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
            <Loader2 className="animate-spin w-6 h-6 text-indigo-600" />
            <span className="text-xs font-semibold">Loading library...</span>
          </div>
        ) : error ? (
          <div className="bg-[#ffdcdc]/20 border border-[#ffdcdc] text-[#ef4444] px-4 py-3 rounded-xl text-xs font-semibold text-center">
            {error instanceof Error ? error.message : "Failed to load purchased leads."}
          </div>
        ) : purchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
            <Database className="w-8 h-8 text-slate-300 mb-2" />
            <span className="text-sm font-semibold text-slate-700">No leads</span>
            <span className="text-xs text-slate-400 font-medium">You haven't purchased any datasets yet.</span>
          </div>
        ) : (
          <div className="w-full">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/20">
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Niche</th>
                    <th className="px-6 py-4 font-semibold">Country</th>
                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                  {listToRender.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/20 transition-colors">
                      <td className="px-6 py-4.5">
                        {editingId === item.id ? (
                          <div className="flex items-center gap-2 w-full max-w-xs">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveName(item.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              className="border border-slate-200 focus:border-[#6366f1] rounded-xl px-3 py-1.5 text-xs font-semibold w-full outline-none transition-all"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveName(item.id)}
                              disabled={savingId === item.id}
                              className="text-[#6366f1] hover:text-[#4f46e5] cursor-pointer disabled:opacity-50 shrink-0 p-1"
                              title="Save"
                            >
                              {savingId === item.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={15} />
                              )}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0 p-1"
                              title="Cancel"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-900 font-medium">{item.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4.5">
                        <HoverBadgeTooltip items={getItemsList(item.niche)} />
                      </td>
                      <td className="px-6 py-4.5">
                        <HoverBadgeTooltip items={getItemsList(item.country)} />
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        {item.isReal ? (
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => handleOpenExcelView(item.id, item.name)}
                              className="text-slate-400 hover:text-[#6366f1] p-1.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                              title="View dataset like Excel"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(item.id);
                                setEditName(item.name);
                              }}
                              className="text-slate-400 hover:text-[#6366f1] p-1.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                              title="Rename dataset"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDownload(item.dataset_id, item.niche)}
                              disabled={downloadLeadsMutation.isPending}
                              className="text-slate-400 hover:text-[#6366f1] p-1.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-40"
                              title="Download CSV"
                            >
                              {downloadLeadsMutation.isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Download size={14} />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 pt-5 border-t border-slate-50 select-none">
              <span className="text-xs text-slate-400 font-medium">
                Showing 1-{listToRender.length} of {purchases.length} leads
              </span>
              <div className="flex gap-1.5">
                <button className="w-8 h-8 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors text-xs font-bold cursor-pointer disabled:opacity-40" disabled>
                  <ChevronLeft size={13} />
                </button>
                <button className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold border border-transparent">
                  1
                </button>
                <button className="w-8 h-8 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors text-xs font-bold cursor-pointer disabled:opacity-40" disabled>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Excel-like Spread Sheet Preview Modal Overlay */}
      {viewingPurchaseId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 select-text">
          <div className="bg-white w-full max-w-6xl h-[85vh] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Excel View: {viewingPurchaseName}</span>
                </h2>
                <p className="text-slate-400 text-[10px] font-semibold mt-0.5">
                  Spreadsheet-style catalog preview · {filteredLeads.length} leads found
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Search bar inside modal */}
                <input
                  type="text"
                  placeholder="Search cells..."
                  value={viewSearchQuery}
                  onChange={(e) => setViewSearchQuery(e.target.value)}
                  className="border border-slate-200 focus:border-[#6366f1] rounded-xl px-3 py-1.5 text-xs font-semibold w-48 sm:w-64 outline-none transition-all"
                />
                
                {/* Close button */}
                <button
                  onClick={() => {
                     setViewingPurchaseId(null);
                     setViewLeads([]);
                  }}
                  className="text-slate-400 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Excel Content Wrapper */}
            <div className="flex-1 min-h-0 overflow-auto p-4 bg-slate-50">
              {loadingLeads ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="animate-spin w-8 h-8 text-emerald-600" />
                  <span className="text-xs font-semibold">Loading spreadsheet records...</span>
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-1.5">
                  <Database className="w-8 h-8 text-slate-300" />
                  <span className="text-sm font-semibold text-slate-700">No matching records found</span>
                  <span className="text-xs text-slate-400 font-medium">Try clearing or changing your search query.</span>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full max-h-full">
                  {/* Excel Table */}
                  <div className="overflow-auto flex-1 text-[11px] font-mono text-slate-700">
                    <table className="w-full border-collapse border-spacing-0 relative">
                      {/* Column Headers (A, B, C...) */}
                      <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 z-10 select-none">
                        <tr className="divide-x divide-slate-200">
                          <th className="bg-slate-200/60 w-10 text-center text-[9px] font-extrabold text-slate-400 py-1.5 border-r border-slate-200"></th>
                          <th className="px-4 py-1.5 font-bold text-slate-500 uppercase text-center w-[12%]">A</th>
                          <th className="px-4 py-1.5 font-bold text-slate-500 uppercase text-center w-[18%]">B</th>
                          <th className="px-4 py-1.5 font-bold text-slate-500 uppercase text-center w-[12%]">C</th>
                          <th className="px-4 py-1.5 font-bold text-slate-500 uppercase text-center w-[12%]">D</th>
                          <th className="px-4 py-1.5 font-bold text-slate-500 uppercase text-center w-[20%]">E</th>
                          <th className="px-4 py-1.5 font-bold text-slate-500 uppercase text-center w-[12%]">F</th>
                          <th className="px-4 py-1.5 font-bold text-slate-500 uppercase text-center w-[14%]">G</th>
                        </tr>
                        <tr className="divide-x divide-slate-200 bg-slate-50 text-[10px] text-slate-500 text-left border-b border-slate-200">
                          <th className="bg-slate-200/60 w-10 text-center py-2 border-r border-slate-200"></th>
                          <th className="px-4 py-2 font-bold">Store Name</th>
                          <th className="px-4 py-2 font-bold">Store URL</th>
                          <th className="px-4 py-2 font-bold">Niche</th>
                          <th className="px-4 py-2 font-bold">Country</th>
                          <th className="px-4 py-2 font-bold">Signal</th>
                          <th className="px-4 py-2 font-bold">Product Count</th>
                          <th className="px-4 py-2 font-bold">Avg Price (USD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredLeads.map((lead, index) => (
                          <tr key={lead.id} className="divide-x divide-slate-200 hover:bg-slate-50/50 transition-colors">
                            <td className="bg-slate-50/80 text-center text-[9px] font-extrabold text-slate-400 py-1.5 border-r border-slate-200 select-none sticky left-0 z-0">{index + 1}</td>
                            <td className="px-4 py-1.5 font-semibold text-slate-800 break-all">{lead.store_name}</td>
                            <td className="px-4 py-1.5 break-all text-indigo-600 font-medium hover:underline">
                              <a href={lead.url} target="_blank" rel="noopener noreferrer">
                                {lead.url}
                              </a>
                            </td>
                            <td className="px-4 py-1.5 break-all">{lead.niche}</td>
                            <td className="px-4 py-1.5 break-all">{lead.country}</td>
                            <td className="px-4 py-1.5 break-all">{lead.signal}</td>
                            <td className="px-4 py-1.5 text-center">{lead.product_count ?? "—"}</td>
                            <td className="px-4 py-1.5 text-right font-semibold text-slate-800">
                              {lead.avg_price ? `$${parseFloat(lead.avg_price).toFixed(2)}` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default function LibraryPage() {
  return (
    <AuthGuard>
      <LibraryContent />
    </AuthGuard>
  );
}
