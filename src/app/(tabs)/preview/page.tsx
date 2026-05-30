"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Download,
  CheckCircle2,
  ArrowLeft,
  Globe,
  Tag,
  Users,
} from "lucide-react";
import type { PreviewResponse } from "@/lib/api";

export default function PreviewPage() {
  const router = useRouter();
  const [data, setData] = useState<PreviewResponse | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("datasetPreview");
    if (raw) {
      setData(JSON.parse(raw));
    } else {
      router.replace("/query");
    }
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#eeeeee]/45">
        Loading preview...
      </div>
    );
  }

  const {
    dataset_id,
    total_count,
    items,
    price_inr,
    price_usd,
    niche,
    country,
    signal,
    niches = [],
    countries = [],
    signal_names = [],
  } = data;

  const handleUnlock = () => {
    // Store dataset info for the payment page
    sessionStorage.setItem(
      "paymentContext",
      JSON.stringify({
        dataset_id,
        price_inr,
        price_usd,
        niche,
        country,
        signal,
        total_count,
        niches,
        countries,
        signal_names,
      })
    );
    router.push(`/payment?datasetId=${dataset_id}`);
  };

  return (
    <div className="min-h-screen px-4 sm:px-8 py-10 max-w-7xl mx-auto">
      {/* Back link */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-[#eeeeee]/40 hover:text-[#eeeeee] mb-8 transition-colors"
      >
        <ArrowLeft size={15} /> Back to query
      </button>

      {/* Header row */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#eeeeee] mb-2">Dataset Preview</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {(niches.length ? niches : niche ? [niche] : []).map((n) => (
              <span
                key={`n-${n}`}
                className="flex items-center gap-1.5 bg-[#00adb5]/10 border border-[#00adb5]/20 text-[#00adb5] px-3 py-1 rounded-full"
              >
                <Tag size={12} /> {n}
              </span>
            ))}
            {(countries.length ? countries : country ? [country] : []).map((c) => (
              <span
                key={`c-${c}`}
                className="flex items-center gap-1.5 bg-[#fff2eb]/08 border border-[#fff2eb]/15 text-[#fff2eb] px-3 py-1 rounded-full"
              >
                <Globe size={12} /> {c}
              </span>
            ))}
            {(signal_names.length ? signal_names : signal ? [signal] : []).map((s) => (
              <span
                key={`s-${s}`}
                className="flex items-center gap-1.5 bg-[#ffd6ba]/10 border border-[#ffd6ba]/20 text-[#ffd6ba] px-3 py-1 rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
          <p className="text-[#eeeeee]/50 mt-3 flex items-center gap-1.5">
            <Users size={15} className="text-[#00adb5]" />
            <span>
              <strong className="text-[#eeeeee]">{total_count.toLocaleString()}</strong> targeted leads
              in this dataset
            </span>
          </p>
        </div>

        {/* Pricing & CTA */}
        <div className="glass-card p-5 flex flex-col items-center gap-3 min-w-[200px]">
          <div className="text-center">
            {price_usd && (
              <div className="text-3xl font-extrabold text-[#eeeeee]">${price_usd}</div>
            )}
            {price_inr && (
              <div className="text-sm text-[#eeeeee]/35">or ₹{price_inr.toLocaleString()}</div>
            )}
            <div className="text-xs text-[#eeeeee]/25 mt-1">one-time · instant download</div>
          </div>
          <button
            id="preview-unlock-btn"
            onClick={handleUnlock}
            className="btn-primary w-full px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Lock size={16} /> Unlock Full List
          </button>
        </div>
      </div>

      {/* Leads table */}
      <div className="glass-card relative overflow-hidden rounded-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#393e46]/50 border-b border-[#00adb5]/12">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-[#eeeeee]/50">#</th>
              <th className="px-6 py-4 text-sm font-semibold text-[#eeeeee]/50">Store Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-[#eeeeee]/50">URL</th>
              <th className="px-6 py-4 text-sm font-semibold text-[#eeeeee]/50">Country</th>
              <th className="px-6 py-4 text-sm font-semibold text-[#eeeeee]/50">Signal</th>
              <th className="px-6 py-4 text-sm font-semibold text-[#eeeeee]/50 text-right">
                Verified
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={idx}
                className="border-b border-[#00adb5]/06 hover:bg-[#393e46]/30 transition-colors"
              >
                <td className="px-6 py-4 text-[#eeeeee]/30 text-sm">{idx + 1}</td>
                <td className="px-6 py-4 font-medium text-[#eeeeee]">{item.store_name}</td>
                <td className="px-6 py-4">
                  <span className="text-[#00adb5] font-mono text-sm truncate max-w-[200px] block">
                    {item.url}
                  </span>
                </td>
                <td className="px-6 py-4 text-[#eeeeee]/60">{item.country}</td>
                <td className="px-6 py-4">
                  <span className="bg-[#ffd6ba]/12 text-[#ffd6ba] px-3 py-1 rounded-full text-xs font-medium">
                    {item.signal}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <CheckCircle2 className="text-[#00adb5] inline-block w-4 h-4" />
                </td>
              </tr>
            ))}

            {/* Blurred locked rows */}
            {Array.from({ length: 7 }).map((_, i) => (
              <tr key={`blur-${i}`} className="border-b border-[#00adb5]/05 select-none">
                <td className="px-6 py-4">
                  <div className="h-3 w-4 bg-[#eeeeee]/08 blur-sm rounded" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-3 bg-[#eeeeee]/08 blur-sm rounded w-3/4" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-3 bg-[#eeeeee]/08 blur-sm rounded w-full" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-3 bg-[#eeeeee]/08 blur-sm rounded w-1/2" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-5 bg-[#eeeeee]/08 blur-sm rounded-full w-28" />
                </td>
                <td className="px-6 py-4 text-right">
                  <Lock className="text-[#eeeeee]/20 inline-block w-4 h-4" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Gradient + CTA overlay */}
        <div className="absolute inset-x-0 bottom-0 h-52 blur-overlay flex items-end justify-center pb-8">
          <div className="glass-card border-[#00adb5]/20 p-6 text-center space-y-3 w-full max-w-lg mx-4">
            <h3 className="text-xl font-bold text-[#eeeeee]">
              Unlock {total_count.toLocaleString()} leads
            </h3>
            <p className="text-[#eeeeee]/45 text-sm">
              Instant CSV download · one-time payment · no subscription
            </p>
            <button
              onClick={handleUnlock}
              className="btn-primary px-8 py-3 rounded-xl font-bold w-full flex justify-center items-center gap-2"
            >
              <Download size={16} />
              Purchase &amp; Download — ${price_usd}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
