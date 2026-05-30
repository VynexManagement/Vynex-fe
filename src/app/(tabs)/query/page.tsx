"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Filter, ArrowRight, Loader2, ChevronDown, Check } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { getCatalog, getLeadsPreview, fetchSignals, type CatalogResponse } from "@/lib/api";
import { NICHES, COUNTRIES } from "@/lib/config";


function toggleMember(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

function QueryForm() {
  const router = useRouter();
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

  useEffect(() => {
    getCatalog()
      .then(setCatalog)
      .catch(() => setCatalog(null));
    
    fetchSignals()
      .then(setDynamicSignals)
      .catch((err) => console.error("Signals fetch error:", err));
  }, []);

  const nicheOptions = catalog?.niches?.length ? catalog.niches.map(n => ({ label: n, value: n })) : NICHES;
  const countryOptions = catalog?.countries?.length ? catalog.countries.map(c => ({ label: c, value: c })) : COUNTRIES;
  const hasUuidCatalog = !!(catalog?.signals && catalog.signals.length > 0);
  const signalOptions = hasUuidCatalog ? catalog!.signals : dynamicSignals;

  const hasFilter =
    niches.length + countries.length + (hasUuidCatalog ? signalIds.length : signalNamesPick.length) >
    0;

  // const refreshCount = useCallback(async () => {
  //   if (!hasFilter) {
  //     setLiveCount(null);
  //     return;
  //   }
  //   setCountLoading(true);
  //   try {
  //     const data = await getLeadsPreview({
  //       niches,
  //       countries,
  //       signal_ids: hasUuidCatalog ? signalIds : [],
  //       signal_names: hasUuidCatalog ? [] : signalNamesPick,
  //       persist: false,
  //     });
  //     setLiveCount(data.total_count);
  //   } catch {
  //     setLiveCount(null);
  //   } finally {
  //     setCountLoading(false);
  //   }
  // }, [hasFilter, niches, countries, signalIds, signalNamesPick, hasUuidCatalog]);

  // useEffect(() => {
  //   const t = window.setTimeout(() => {
  //     void refreshCount();
  //   }, 400);
  //   return () => window.clearTimeout(t);
  // }, [refreshCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!hasFilter) {
      setError("Choose at least one niche, country, or marketing signal.");
      return;
    }
    setLoading(true);

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
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm border cursor-pointer transition-colors";
  const chipOff = "bg-[#393e46]/40 border-[#00adb5]/12 text-[#eeeeee]/70 hover:border-[#00adb5]/25";
  const chipOn = "bg-[#00adb5]/15 border-[#00adb5]/45 text-[#eeeeee]";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#00adb5]/10 border border-[#00adb5]/20 px-4 py-1.5 rounded-full text-[#00adb5] text-sm font-medium mb-4">
            <Filter size={13} /> Configure your lead query
          </div>
          <h1 className="text-4xl font-bold text-[#eeeeee]">Find Your Leads</h1>
          <p className="text-[#eeeeee]/50 mt-2">
            Multi-select niches, countries, and signals. At least one filter is required — we show
            the live lead count as you choose.
          </p>
        </div>

        <div className="glass-card p-8 sm:p-10">
          {/* Live count */}
          {/* <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-[#00adb5]/15 bg-[#00adb5]/06 px-4 py-3">
            <div className="flex items-center gap-2 text-[#eeeeee]/55 text-sm">
              <Users size={16} className="text-[#00adb5]" />
              <span>Matching leads</span>
            </div>
            <div className="text-right">
              {countLoading ? (
                <Loader2 className="inline animate-spin w-5 h-5 text-[#00adb5]" />
              ) : !hasFilter ? (
                <span className="text-[#eeeeee]/35 text-sm">Select at least one filter</span>
              ) : (
                <span className="text-xl font-bold text-[#eeeeee] tabular-nums">
                  {(liveCount ?? 0).toLocaleString()}
                </span>
              )}
            </div>
          </div> */}

          {error && (
            <div className="mb-6 bg-[#ffdcdc]/08 border border-[#ffdcdc]/25 text-[#ffdcdc] px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-[#eeeeee]/55 block">Target niches</label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                {nicheOptions.map((n: any) => {
                  const label = typeof n === "string" ? n : n.label;
                  const value = typeof n === "string" ? n : n.value;
                  return (
                    <label key={value} className={`${chipClass} ${niches.includes(value) ? chipOn : chipOff}`}>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={niches.includes(value)}
                        onChange={() => setNiches((prev) => toggleMember(prev, value))}
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-[#eeeeee]/55 block">
                Target countries
              </label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                {countryOptions.map((c: any) => {
                  const label = typeof c === "string" ? c : c.label;
                  const value = typeof c === "string" ? c : c.value;
                  return (
                    <label
                      key={value}
                      className={`${chipClass} ${countries.includes(value) ? chipOn : chipOff}`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={countries.includes(value)}
                        onChange={() => setCountries((prev) => toggleMember(prev, value))}
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-[#eeeeee]/55 block">
                Marketing signals
              </label>
              {!hasUuidCatalog ? (
                <p className="text-xs text-[#eeeeee]/35 mb-2">
                  Using built-in signal names — ensure the same names exist in your{" "}
                  <code className="text-[#00adb5]/80">signals</code> table for UUID matching, or use
                  legacy <code className="text-[#00adb5]/80">leads.signal</code> text.
                </p>
              ) : null}
              <details className="group rounded-xl border border-[#00adb5]/18 bg-[#393e46]/45">
                <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between text-[#eeeeee]">
                  <div>
                    <div className="text-sm font-medium">Select one or more signals</div>
                    <div className="text-xs text-[#eeeeee]/45 mt-0.5">
                      {(hasUuidCatalog ? signalIds.length : signalNamesPick.length) > 0
                        ? `${hasUuidCatalog ? signalIds.length : signalNamesPick.length} selected`
                        : "No signal selected yet"}
                    </div>
                  </div>
                  <ChevronDown size={16} className="text-[#00adb5] transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-3 pb-3">
                  <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                    {signalOptions.map((s) => {
                      const value = hasUuidCatalog ? (s as { id: string }).id : s.name;
                      const checked = hasUuidCatalog
                        ? signalIds.includes(value)
                        : signalNamesPick.includes(value);
                      return (
                        <label
                          key={value}
                          className={`flex items-start gap-3 rounded-lg px-3 py-2 border cursor-pointer transition-colors ${
                            checked
                              ? "border-[#00adb5]/45 bg-[#00adb5]/12"
                              : "border-[#00adb5]/15 bg-[#222831]/35 hover:border-[#00adb5]/30"
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
                          <span className={`mt-0.5 ${checked ? "text-[#00adb5]" : "text-[#eeeeee]/35"}`}>
                            <Check size={14} />
                          </span>
                          <span>
                            <span className="text-sm text-[#eeeeee]">{s.name}</span>
                            {s.description ? (
                              <span className="block text-xs text-[#eeeeee]/45">{s.description}</span>
                            ) : null}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </details>
            </div>

            <button
              id="query-submit"
              type="submit"
              disabled={loading || !hasFilter}
              className="w-full btn-primary py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  Generate Preview <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function QueryPage() {
  return (
    <AuthGuard>
      <QueryForm />
    </AuthGuard>
  );
}
