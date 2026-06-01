"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, ArrowRight, Loader2, ChevronDown, Check, Sparkles } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { getCatalog, getLeadsPreview, fetchSignals, type CatalogResponse } from "@/lib/api";
import { NICHES, COUNTRIES } from "@/lib/config";

interface SavedQuery {
  id: string;
  name: string;
  niches: string[];
  countries: string[];
  signalIds: string[];
  signalNames: string[];
  timestamp: string;
}

function toggleMember(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

function QueryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);

  const [niches, setNiches] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  /** From GET /api/catalog (UUIDs from `signals` table) */
  const [signalIds, setSignalIds] = useState<string[]>([]);
  /** When catalog is unavailable: filter by signal name / legacy `leads.signal` text */
  const [signalNamesPick, setSignalNamesPick] = useState<string[]>([]);

  const [dynamicSignals, setDynamicSignals] = useState<any[]>([]);

  // Saved Search Template state
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    getCatalog()
      .then(setCatalog)
      .catch(() => setCatalog(null));
    
    fetchSignals()
      .then(setDynamicSignals)
      .catch((err) => console.error("Signals fetch error:", err));
  }, []);

  // Parse URL search parameters on mount (if loaded from Saved Searches)
  useEffect(() => {
    const isLoaded = searchParams.get("load");
    if (isLoaded) {
      const nichesParam = searchParams.get("niches");
      if (nichesParam) {
        setNiches(nichesParam.split(",").filter(Boolean));
      }
      const countriesParam = searchParams.get("countries");
      if (countriesParam) {
        setCountries(countriesParam.split(",").filter(Boolean));
      }
      const signalIdsParam = searchParams.get("signal_ids");
      if (signalIdsParam) {
        setSignalIds(signalIdsParam.split(",").filter(Boolean));
      }
      const signalNamesParam = searchParams.get("signal_names");
      if (signalNamesParam) {
        setSignalNamesPick(signalNamesParam.split(",").filter(Boolean));
      }
    }
  }, [searchParams]);

  const nicheOptions = catalog?.niches?.length ? catalog.niches.map(n => ({ label: n, value: n })) : NICHES;
  const countryOptions = catalog?.countries?.length ? catalog.countries.map(c => ({ label: c, value: c })) : COUNTRIES;
  const hasUuidCatalog = !!(catalog?.signals && catalog.signals.length > 0);
  const signalOptions = hasUuidCatalog ? catalog!.signals : dynamicSignals;

  const hasFilter =
    niches.length + countries.length + (hasUuidCatalog ? signalIds.length : signalNamesPick.length) >
    0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!hasFilter) {
      setError("Choose at least one niche, country, or marketing signal.");
      return;
    }
    setLoading(true);

    // Save as Template if checked
    if (saveAsTemplate) {
      try {
        const savedRaw = localStorage.getItem("savedLeadQueries");
        const existing: SavedQuery[] = savedRaw ? JSON.parse(savedRaw) : [];
        
        // Resolve selected signal names
        const signalNames = signalOptions
          .filter((s: any) => hasUuidCatalog ? signalIds.includes(s.id) : signalNamesPick.includes(s.name))
          .map((s: any) => s.name);

        const nameToUse = templateName.trim() || `${niches.join(", ") || "All Niches"} | ${countries.join(", ") || "All Countries"}`;
        
        const newQuery: SavedQuery = {
          id: typeof window !== "undefined" && window.crypto ? window.crypto.randomUUID() : Math.random().toString(36).substring(2),
          name: nameToUse,
          niches,
          countries,
          signalIds: hasUuidCatalog ? signalIds : [],
          signalNames: hasUuidCatalog ? signalNames : signalNamesPick,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem("savedLeadQueries", JSON.stringify([newQuery, ...existing]));
      } catch (err) {
        console.error("Failed to save template", err);
      }
    }

    try {
      const data = await getLeadsPreview({
        niches,
        countries,
        signal_ids: hasUuidCatalog ? signalIds : [],
        signal_names: hasUuidCatalog ? [] : signalNamesPick,
        persist: true,
      });

      if (!data.dataset_id) {
        setError(
          data.total_count === 0
            ? "No leads match these filters. Try widening your selection."
            : "Could not prepare this dataset. Try again or contact support."
        );
        setLoading(false);
        return;
      }

      sessionStorage.setItem("datasetPreview", JSON.stringify(data));
      router.push("/preview");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch preview. Is the backend running?";
      setError(msg);
      setLoading(false);
    }
  };

  const chipClass =
    "flex items-center gap-2 rounded px-3 py-1.5 text-xs font-semibold border cursor-pointer transition-all duration-150 select-none";
  const chipOff = "bg-[#191919] border-[#2f2f2f] hover:border-[#3f3f3f] text-[#a3a3a3] hover:text-white";
  const chipOn = "bg-[#2f2f2f] border-[#4f4f4f] text-white";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#202020] border border-[#2f2f2f] px-3 py-1 rounded text-white text-[10px] font-bold tracking-wider uppercase mb-4">
            <Sparkles size={11} className="text-[#a3a3a3]" /> Configure your lead query
          </div>
          <h1 className="text-4xl font-extrabold text-[#fafafa] tracking-tight">Find Your Leads</h1>
          <p className="text-[#a3a3a3] mt-2 text-sm max-w-md mx-auto">
            Multi-select niches, countries, and marketing signals to unlock highly targeted lead catalogs.
          </p>
        </div>

        {/* DOUBLE-BEZEL GLASS CARD */}
        <div className="double-bezel-outer">
          <div className="double-bezel-inner p-6 sm:p-10 space-y-8">
            {error && (
              <div className="bg-[#ffdcdc]/08 border border-[#ffdcdc]/20 text-[#ffdcdc] px-4 py-3.5 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* TARGET NICHES */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#eeeeee]/50">Target niches</label>
                  {niches.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setNiches([])}
                      className="text-[10px] font-bold text-[#a3a3a3] hover:text-white hover:underline"
                    >
                      Clear ({niches.length})
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                  {nicheOptions.map((n: any) => {
                    const label = typeof n === "string" ? n : n.label;
                    const value = typeof n === "string" ? n : n.value;
                    const isSelected = niches.includes(value);
                    return (
                      <label key={value} className={`${chipClass} ${isSelected ? chipOn : chipOff}`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isSelected}
                          onChange={() => setNiches((prev) => toggleMember(prev, value))}
                        />
                        {label}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* TARGET COUNTRIES */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#eeeeee]/50">Target countries</label>
                  {countries.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCountries([])}
                      className="text-[10px] font-bold text-[#a3a3a3] hover:text-white hover:underline"
                    >
                      Clear ({countries.length})
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                  {countryOptions.map((c: any) => {
                    const label = typeof c === "string" ? c : c.label;
                    const value = typeof c === "string" ? c : c.value;
                    const isSelected = countries.includes(value);
                    return (
                      <label key={value} className={`${chipClass} ${isSelected ? chipOn : chipOff}`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isSelected}
                          onChange={() => setCountries((prev) => toggleMember(prev, value))}
                        />
                        {label}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* MARKETING SIGNALS */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#eeeeee]/50">Marketing signals</label>
                  {(hasUuidCatalog ? signalIds.length : signalNamesPick.length) > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSignalIds([]);
                        setSignalNamesPick([]);
                      }}
                      className="text-[10px] font-bold text-[#a3a3a3] hover:text-white hover:underline"
                    >
                      Clear ({hasUuidCatalog ? signalIds.length : signalNamesPick.length})
                    </button>
                  )}
                </div>
                {!hasUuidCatalog ? (
                  <p className="text-[10px] text-[#eeeeee]/35 mb-2 leading-relaxed">
                    Using built-in signal names — ensure the same names exist in your{" "}
                    <code className="text-white font-mono">signals</code> table for UUID matching, or use
                    legacy <code className="text-white font-mono">leads.signal</code> text.
                  </p>
                ) : null}
                <details className="group rounded border border-[#2f2f2f] bg-[#191919] overflow-hidden">
                  <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between text-[#eeeeee] select-none hover:bg-white/[0.02] transition-colors">
                    <div>
                      <div className="text-xs font-bold">Select one or more marketing signals</div>
                      <div className="text-[10px] text-[#eeeeee]/40 mt-0.5 font-semibold">
                        {(hasUuidCatalog ? signalIds.length : signalNamesPick.length) > 0
                          ? `${hasUuidCatalog ? signalIds.length : signalNamesPick.length} selected`
                          : "No signal selected yet"}
                      </div>
                    </div>
                    <ChevronDown size={14} className="text-[#a3a3a3] transition-transform group-open:rotate-180 duration-150" />
                  </summary>
                  <div className="px-4 pb-4 border-t border-[#2f2f2f] pt-3">
                    <div className="max-h-52 overflow-y-auto space-y-2 pr-1 pt-1">
                      {signalOptions.map((s) => {
                        const value = hasUuidCatalog ? (s as { id: string }).id : s.name;
                        const checked = hasUuidCatalog
                          ? signalIds.includes(value)
                          : signalNamesPick.includes(value);
                        return (
                          <label
                            key={value}
                            className={`flex items-start gap-3 rounded px-3 py-2 border cursor-pointer transition-all duration-150 ${
                              checked
                                ? "border-[#4f4f4f] bg-[#2f2f2f]"
                                : "border-[#2f2f2f] bg-[#191919] hover:bg-[#202020]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={checked}
                              onChange={() => {
                                if (hasUuidCatalog) {
                                  setSignalIds((prev) => toggleMember(prev, value));
                                } else {
                                  setSignalNamesPick((prev) => toggleMember(prev, value));
                                }
                              }}
                            />
                            <span className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all duration-150 ${
                              checked ? "border-white bg-white text-black" : "border-white/20 bg-transparent text-transparent"
                            }`}>
                              <Check size={10} strokeWidth={3} />
                            </span>
                            <div>
                              <span className="text-xs font-bold text-[#eeeeee] block">{s.name}</span>
                              {s.description ? (
                                <span className="block text-[10px] text-[#eeeeee]/40 mt-0.5 leading-relaxed">{s.description}</span>
                              ) : null}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </details>
              </div>

              {/* SAVE AS TEMPLATE SWITCH */}
              <div className="space-y-4 pt-6 border-t border-[#2f2f2f]">
                <label className="flex items-center gap-3.5 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={saveAsTemplate}
                      onChange={(e) => setSaveAsTemplate(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-[#191919] border border-[#2f2f2f] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 peer-checked:after:bg-white after:border-transparent after:border after:rounded-full after:h-5 after:w-5 after:transition-all duration-150 peer-checked:bg-[#2f2f2f] peer-checked:border-[#4f4f4f]"></div>
                  </div>
                  <span className="text-xs font-bold text-[#eeeeee]/70">Save this query as a template</span>
                </label>
                
                {saveAsTemplate && (
                  <div className="space-y-1.5 animate-premium duration-500 overflow-hidden">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#eeeeee]/40">Template Name (Optional)</label>
                    <input
                      type="text"
                      placeholder={`${niches.join(", ") || "All Niches"} | ${countries.join(", ") || "All Countries"}`}
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="w-full bg-[#191919] border border-[#2f2f2f] focus:border-[#4f4f4f] rounded px-3 py-2.5 text-[#eeeeee] text-xs focus:outline-none focus:ring-1 focus:ring-[#3f3f3f] transition-all duration-150"
                    />
                  </div>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <button
                id="query-submit"
                type="submit"
                disabled={loading || !hasFilter}
                className="w-full btn-primary group py-3 px-6 rounded font-bold text-sm flex items-center justify-center gap-2 mt-6 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-white"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4 text-white" />
                ) : (
                  <>
                    Generate Preview
                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-1 shrink-0 ml-1">
                      <ArrowRight size={12} />
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QueryPage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#191919]">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      }>
        <QueryForm />
      </Suspense>
    </AuthGuard>
  );
}
