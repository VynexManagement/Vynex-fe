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
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { usePurchases } from "@/features/dashboard/hooks/usePurchases";
import { useDownloadLeads } from "@/features/dashboard/hooks/useDownloadLeads";

function LibraryContent() {
  const [alertMessage, setAlertMessage] = useState("");
  const { data: purchases = [], isLoading, error } = usePurchases();
  const downloadLeadsMutation = useDownloadLeads();

  useEffect(() => {
    // Check for success alert flag from the preview page
    const alert = localStorage.getItem("library_alert");
    if (alert) {
      setAlertMessage(alert);
      localStorage.removeItem("library_alert");
    }
  }, []);

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
    // Download the first purchased list as demo, or iterate
    const first = purchases[0];
    handleDownload(first.dataset_id, first.niche);
  };

  // Mock leads matching the wireframe screenshot exactly if DB is empty
  const mockLeads = [
    { initials: "LV", store_name: "Lumina Velvet", url: "luminavelvet.com", niche: "LUXURY APPAREL", country: "United States", dataset_id: "", isReal: false },
    { initials: "OG", store_name: "Ocean Gear", url: "oceangear.shop", niche: "SUSTAINABLE", country: "Australia", dataset_id: "", isReal: false },
    { initials: "NT", store_name: "Nordic Tech", url: "nordictech.io", niche: "ELECTRONICS", country: "Denmark", dataset_id: "", isReal: false },
    { initials: "HP", store_name: "Heritage Pottery", url: "heritage-pottery.com", niche: "HOME DECOR", country: "United Kingdom", dataset_id: "", isReal: false },
    { initials: "ZE", store_name: "Zenith Echo", url: "zenithecho.co", niche: "AUDIO TECH", country: "Canada", dataset_id: "", isReal: false },
  ];

  const hasPurchases = purchases.length > 0;
  const listToRender = hasPurchases 
    ? purchases.map((p: any) => ({
        initials: p.niche.substring(0, 2).toUpperCase(),
        store_name: `${p.niche} Lead List`,
        url: `dataset-${p.dataset_id.slice(0, 8)}.csv`,
        niche: p.niche.toUpperCase(),
        country: p.country,
        dataset_id: p.dataset_id,
        isReal: true
      }))
    : mockLeads;

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
        ) : (
          <div className="w-full">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/20">
                    <th className="px-6 py-4 font-semibold">Store Name</th>
                    <th className="px-6 py-4 font-semibold">URL</th>
                    <th className="px-6 py-4 font-semibold">Niche</th>
                    <th className="px-6 py-4 font-semibold">Country</th>
                    <th className="px-6 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                  {listToRender.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/20 transition-colors">
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 select-none">
                            {item.initials}
                          </div>
                          <span className="text-slate-900 font-bold">{item.store_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        {item.isReal ? (
                          <span className="text-indigo-600 font-mono text-xs hover:underline cursor-pointer select-none">
                            {item.url}
                          </span>
                        ) : (
                          <a 
                            href={`https://${item.url}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-indigo-600 font-mono text-xs hover:underline cursor-pointer"
                          >
                            {item.url}
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className="inline-flex px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-slate-100 text-slate-500 border border-slate-200/20">
                          {item.niche}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-slate-500 text-xs font-semibold">
                        {item.country}
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        {item.isReal ? (
                          <button
                            onClick={() => handleDownload(item.dataset_id, item.niche)}
                            disabled={downloadLeadsMutation.isPending}
                            className="text-indigo-600 hover:text-indigo-800 text-xs font-bold transition-all flex items-center gap-1.5 ml-auto hover:underline cursor-pointer"
                          >
                            <Download size={12} />
                            <span>Download</span>
                          </button>
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
                Showing 1-{listToRender.length} of {hasPurchases ? purchases.length : listToRender.length} leads
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
