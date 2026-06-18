"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Check,
  Mail,
  Calendar,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  DollarSign,
  Info
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import {
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
  useCreateStripeIntentMutation,
  useConfirmStripePaymentMutation,
} from "@/features/payment/hooks/usePayment";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

function PreviewContent() {
  const router = useRouter();

  // State
  const [context, setContext] = useState<any>({});
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro">("pro");
  const [stripeLoading, setStripeLoading] = useState(false);
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // TanStack Payment Mutations
  const createRazorpayOrderMutation = useCreateRazorpayOrderMutation();
  const verifyRazorpayPaymentMutation = useVerifyRazorpayPaymentMutation();
  const createStripeIntentMutation = useCreateStripeIntentMutation();
  const confirmStripePaymentMutation = useConfirmStripePaymentMutation();

  // Load query context
  useEffect(() => {
    const raw = sessionStorage.getItem("datasetPreview");
    if (raw) {
      setContext(JSON.parse(raw));
    } else {
      // Default fallback context for visual rendering
      setContext({
        dataset_id: "mock-dataset-preview",
        price_inr: 3999,
        price_usd: 49,
        niche: "Skincare & Beauty",
        country: "United States",
        total_count: 500,
      });
    }
  }, []);

  const loadRazorpay = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleRazorpay = async () => {
    setRazorpayLoading(true);
    setError("");
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Failed to load Razorpay checkout script.");

      const priceINR = selectedPlan === "pro" ? 3999 : 2800; // Rs 3999 for Pro, Rs 2800 for Starter
      const amountPaise = priceINR * 100;
      const datasetId = context.dataset_id || "mock-dataset-123";

      const order = await createRazorpayOrderMutation.mutateAsync({
        datasetId,
        amountPaise,
      });

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "LeadFlow",
        description: `Unlock ${selectedPlan === "pro" ? "500" : "200"} Leads Dataset`,
        order_id: order.order_id,
        handler: async (response: any) => {
          try {
            await verifyRazorpayPaymentMutation.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              dataset_id: datasetId,
            });
            // Show alert in library
            localStorage.setItem("library_alert", `Dataset successfully added to your library. ${selectedPlan === "pro" ? "500" : "200"} new leads are now available for export.`);
            setSuccess(true);
            setTimeout(() => router.push("/lead-library"), 2000);
          } catch {
            setError("Verification failed. Please check your dashboard or contact support.");
            setRazorpayLoading(false);
          }
        },
        prefill: {},
        theme: { color: "#6366f1" },
        modal: {
          ondismiss: () => setRazorpayLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setRazorpayLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err?.message || "Razorpay connection failed. Check backend.");
      setRazorpayLoading(false);
    }
  };

  const handleStripe = async () => {
    setStripeLoading(true);
    setError("");
    try {
      const priceUSD = selectedPlan === "pro" ? 49 : 35; // $49 for Pro, $35 for Starter
      const amountCents = priceUSD * 100;
      const datasetId = context.dataset_id || "mock-dataset-123";

      const { loadStripe } = await import("@stripe/stripe-js");
      const intent = await createStripeIntentMutation.mutateAsync({
        datasetId,
        amountCents,
      });
      const stripe = await loadStripe(intent.publishable_key);
      if (!stripe) throw new Error("Stripe loading failed.");

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        intent.client_secret,
        {
          payment_method: "pm_card_visa",
        }
      );

      if (stripeError) {
        setError(stripeError.message || "Stripe transaction failed.");
        setStripeLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        await confirmStripePaymentMutation.mutateAsync({
          payment_intent_id: paymentIntent.id,
          dataset_id: datasetId,
        });
        localStorage.setItem("library_alert", `Dataset successfully added to your library. ${selectedPlan === "pro" ? "500" : "200"} new leads are now available for export.`);
        setSuccess(true);
        setTimeout(() => router.push("/lead-library"), 2000);
      }
    } catch (err: any) {
      setError(err?.message || "Stripe checkout failed. Check server.");
      setStripeLoading(false);
    }
  };



  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc]">
        <div className="bg-white border border-slate-100/80 w-full max-w-md p-10 text-center space-y-5 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.03)]">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="text-emerald-500 w-9 h-9" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Payment Successful!</h2>
          <p className="text-slate-500 text-sm">Your dataset leads have been successfully added to your library.</p>
          <p className="text-xs text-slate-400 font-medium">Redirecting to your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 max-w-6xl mx-auto space-y-8 select-none">
      
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} /> 
        <span>Back to query</span>
      </button>

      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Opportunity Finder
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Refine your selection and secure your intelligence dataset. All leads are verified and updated in real-time.
        </p>
      </div>

      {error && (
        <div className="bg-[#ffdcdc]/20 border border-[#ffdcdc] text-[#ef4444] px-4 py-3.5 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}



      {/* Dataset Selection Cards (Starter and Pro) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto w-full pt-4">
        
        {/* Starter Plan */}
        <div
          onClick={() => setSelectedPlan("starter")}
          className={`cursor-pointer bg-white p-8 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
            selectedPlan === "starter"
              ? "border-2 border-[#6366f1] shadow-[0_20px_50px_-12px_rgba(99,102,241,0.08)]"
              : "border-slate-100/85 shadow-[0_10px_35px_-12px_rgba(0,0,0,0.02)] hover:border-slate-200"
          }`}
        >
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center">
                <span className="text-indigo-600 text-xs font-bold">⚡</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Starter</h3>
              <p className="text-slate-400 text-xs mt-1">Perfect for niche outreach campaigns.</p>
            </div>
            
            <div className="flex items-baseline">
              <span className="text-4xl font-extrabold text-slate-900">$35</span>
              <span className="text-slate-400 text-xs font-semibold ml-2">/ dataset</span>
            </div>

            <ul className="space-y-3.5 text-slate-500 text-xs font-semibold pt-4">
              <li className="flex items-center gap-3">
                <Check className="text-indigo-600 w-4 h-4 shrink-0" strokeWidth={2.5} />
                <span>200 Verified Leads</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-indigo-600 w-4 h-4 shrink-0" strokeWidth={2.5} />
                <span>CSV Download</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-indigo-600 w-4 h-4 shrink-0" strokeWidth={2.5} />
                <span>Niche/Country/Signal included</span>
              </li>
              <li className="flex items-center gap-3 opacity-40">
                <span className="text-slate-400 w-4 h-4 shrink-0 flex items-center justify-center text-[10px]">⊘</span>
                <span className="line-through">Priority Support</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className={`w-full mt-8 py-3 rounded-xl text-xs font-bold border transition-all duration-200 ${
              selectedPlan === "starter"
                ? "bg-[#6366f1] text-white border-transparent"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Select Starter
          </button>
        </div>

        {/* Pro Plan (Highlighted) */}
        <div
          onClick={() => setSelectedPlan("pro")}
          className={`cursor-pointer p-8 rounded-2xl relative flex flex-col justify-between transition-all duration-300 ${
            selectedPlan === "pro"
              ? "bg-[#6366f1] text-white border-2 border-transparent shadow-[0_20px_50px_-12px_rgba(99,102,241,0.22)]"
              : "bg-white border border-slate-100/85 shadow-[0_10px_35px_-12px_rgba(0,0,0,0.02)] hover:border-slate-200 text-slate-800"
          }`}
        >
          {selectedPlan === "pro" && (
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#ffffff] text-indigo-600 text-[8px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-md select-none">
              MOST POPULAR
            </div>
          )}

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                selectedPlan === "pro" 
                  ? "bg-white/10 border-white/20 text-white" 
                  : "bg-indigo-50 border-indigo-100/50 text-indigo-600"
              }`}>
                <span className="text-xs font-bold">🚀</span>
              </div>
            </div>
            <div>
              <h3 className={`text-xl font-extrabold ${selectedPlan === "pro" ? "text-white" : "text-slate-900"}`}>Pro</h3>
              <p className={`text-xs mt-1 ${selectedPlan === "pro" ? "text-indigo-200" : "text-slate-400"}`}>Maximize your sales pipeline depth.</p>
            </div>
            
            <div className="flex items-baseline">
              <span className={`text-4xl font-extrabold ${selectedPlan === "pro" ? "text-white" : "text-slate-900"}`}>$49</span>
              <span className={`text-xs font-semibold ml-2 ${selectedPlan === "pro" ? "text-indigo-200" : "text-slate-400"}`}>/ dataset</span>
            </div>

            <ul className={`space-y-3.5 text-xs font-semibold pt-4 ${selectedPlan === "pro" ? "text-indigo-100" : "text-slate-500"}`}>
              <li className="flex items-center gap-3">
                <Check className={`${selectedPlan === "pro" ? "text-white" : "text-indigo-600"} w-4 h-4 shrink-0`} strokeWidth={2.5} />
                <span>500 Verified Leads</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className={`${selectedPlan === "pro" ? "text-white" : "text-indigo-600"} w-4 h-4 shrink-0`} strokeWidth={2.5} />
                <span>CSV & CRM Export</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className={`${selectedPlan === "pro" ? "text-white" : "text-indigo-600"} w-4 h-4 shrink-0`} strokeWidth={2.5} />
                <span>Niche/Country/Signal included</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className={`${selectedPlan === "pro" ? "text-white" : "text-indigo-600"} w-4 h-4 shrink-0`} strokeWidth={2.5} />
                <span>Priority Data Refresh</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className={`w-full mt-8 py-3 rounded-xl text-xs font-bold border transition-all duration-200 ${
              selectedPlan === "pro"
                ? "bg-white text-indigo-600 border-transparent shadow-sm"
                : "bg-[#6366f1] text-white border-transparent"
            }`}
          >
            Select Pro
          </button>
        </div>

      </div>

      {/* Payment Checkout Selection Row */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.02)] p-8 max-w-4xl mx-auto w-full text-center space-y-6">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-indigo-600 mb-3 select-none">
            <ShieldCheck size={20} />
          </div>
          <h3 className="text-base font-bold text-slate-900">Secure Checkout</h3>
          <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
            One-time payment · Instant CSV access · Selected: <strong className="text-indigo-600">{selectedPlan === "pro" ? "Pro ($49)" : "Starter ($35)"}</strong>
          </p>
        </div>

        {/* Action Checkout Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto w-full">
          <button
            onClick={handleStripe}
            disabled={stripeLoading || razorpayLoading}
            className="bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
          >
            {stripeLoading ? <Loader2 size={13} className="animate-spin" /> : <CreditCard size={14} />}
            <span>Pay with Stripe</span>
          </button>
          <button
            onClick={handleRazorpay}
            disabled={stripeLoading || razorpayLoading}
            className="bg-indigo-50 border border-indigo-100 text-[#6366f1] hover:bg-indigo-100/50 text-xs font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
          >
            {razorpayLoading ? <Loader2 size={13} className="animate-spin" /> : <DollarSign size={14} />}
            <span>Pay with Razorpay</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1">
          <Info size={11} className="text-slate-300" />
          <span>Bank-level encryption and secure data handling guaranteed.</span>
        </p>
      </div>

    </div>
  );
}

export default function PreviewPage() {
  return (
    <AuthGuard>
      <PreviewContent />
    </AuthGuard>
  );
}
