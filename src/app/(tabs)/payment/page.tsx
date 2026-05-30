"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CreditCard,
  CheckCircle2,
  Loader2,
  IndianRupee,
  DollarSign,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createStripeIntent,
  confirmStripePayment,
} from "@/lib/api";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const datasetId = searchParams.get("datasetId") || "";

  const [context, setContext] = useState<{
    niche?: string;
    country?: string;
    signal?: string;
    niches?: string[];
    countries?: string[];
    signal_names?: string[];
    total_count?: number;
    price_inr?: number;
    price_usd?: number;
  }>({});

  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "stripe">("razorpay");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Load context from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem("paymentContext");
    if (raw) setContext(JSON.parse(raw));
  }, []);

  // Load Razorpay script on demand
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
    setLoading(true);
    setError("");
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Failed to load Razorpay checkout.");

      const amountPaise = (context.price_inr || 3999) * 100;
      const order = await createRazorpayOrder(datasetId, amountPaise);

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "LeadFlow",
        description: `${(context.niches?.length ? context.niches.join(", ") : context.niche) || "Dataset"} × ${(context.countries?.length ? context.countries.join(", ") : context.country) || ""} Leads`,
        order_id: order.order_id,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await verifyRazorpayPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              datasetId
            );
            sessionStorage.removeItem("paymentContext");
            setSuccess(true);
            setTimeout(() => router.push("/dashboard"), 2500);
          } catch {
            setError("Payment received but verification failed. Contact support.");
          }
        },
        prefill: {},
        theme: { color: "#00adb5" },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Payment failed.");
      setLoading(false);
    }
  };

  const handleStripe = async () => {
    setLoading(true);
    setError("");
    try {
      const amountCents = (context.price_usd || 49) * 100;
      const { loadStripe } = await import("@stripe/stripe-js");
      const intent = await createStripeIntent(datasetId, amountCents);
      const stripe = await loadStripe(intent.publishable_key);
      if (!stripe) throw new Error("Failed to load Stripe.js");

      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        clientSecret: intent.client_secret,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
          payment_method_data: { billing_details: {} },
        },
        redirect: "if_required",
      });

      if (stripeError) {
        setError(stripeError.message || "Stripe payment failed.");
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        await confirmStripePayment(paymentIntent.id, datasetId);
        sessionStorage.removeItem("paymentContext");
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 2500);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Stripe payment failed.");
      setLoading(false);
    }
  };

  const handlePay = () => {
    if (paymentMethod === "razorpay") handleRazorpay();
    else handleStripe();
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="glass-card w-full max-w-md p-12 text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-[#00adb5]/15 border border-[#00adb5]/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="text-[#00adb5] w-11 h-11 animate-bounce-once" />
          </div>
          <h2 className="text-3xl font-bold text-[#eeeeee]">Payment Successful!</h2>
          <p className="text-[#eeeeee]/50">Your dataset has been unlocked.</p>
          <p className="text-sm text-[#eeeeee]/30">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-[#eeeeee]/40 hover:text-[#eeeeee] mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="glass-card p-8 space-y-6">
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-[#00adb5]/15 border border-[#00adb5]/25 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-5 h-5 text-[#00adb5]" />
            </div>
            <h1 className="text-2xl font-bold text-[#eeeeee]">Secure Checkout</h1>
            <p className="text-[#eeeeee]/45 text-sm mt-1">One-time payment · Instant CSV access</p>
          </div>

          {/* Order summary */}
          <div className="bg-[#393e46]/50 border border-[#00adb5]/12 rounded-xl p-5 space-y-3 text-sm">
            {(context.niches?.length || context.niche) && (
              <div className="flex justify-between gap-4">
                <span className="text-[#eeeeee]/45 shrink-0">Niches</span>
                <span className="font-medium text-[#eeeeee] text-right">
                  {context.niches?.length ? context.niches.join(", ") : context.niche}
                </span>
              </div>
            )}
            {(context.countries?.length || context.country) && (
              <div className="flex justify-between gap-4">
                <span className="text-[#eeeeee]/45 shrink-0">Countries</span>
                <span className="font-medium text-[#eeeeee] text-right">
                  {context.countries?.length ? context.countries.join(", ") : context.country}
                </span>
              </div>
            )}
            {(context.signal_names?.length || context.signal) && (
              <div className="flex justify-between gap-4">
                <span className="text-[#eeeeee]/45 shrink-0">Signals</span>
                <span className="text-[#ffd6ba] text-right">
                  {context.signal_names?.length
                    ? context.signal_names.join(", ")
                    : context.signal}
                </span>
              </div>
            )}
            {context.total_count && (
              <div className="flex justify-between">
                <span className="text-[#eeeeee]/45">Total Leads</span>
                <span className="text-[#00adb5] font-semibold">{context.total_count.toLocaleString()}</span>
              </div>
            )}
            <hr className="border-[#00adb5]/12" />
            <div className="flex justify-between items-center">
              <span className="text-[#eeeeee]/70 font-semibold">Total</span>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-[#eeeeee]">
                  {paymentMethod === "razorpay"
                    ? `₹${(context.price_inr || 3999).toLocaleString()}`
                    : `$${context.price_usd || 49}`}
                </div>
              </div>
            </div>
          </div>

          {/* Payment method toggle */}
          <div>
            <p className="text-xs text-[#eeeeee]/35 mb-3 font-semibold uppercase tracking-wider">Payment Method</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="method-razorpay"
                onClick={() => setPaymentMethod("razorpay")}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all ${
                  paymentMethod === "razorpay"
                    ? "bg-[#00adb5]/15 border-[#00adb5] text-[#00adb5]"
                    : "bg-[#393e46]/40 border-[#00adb5]/15 text-[#eeeeee]/50 hover:border-[#00adb5]/30"
                }`}
              >
                <IndianRupee size={15} /> Razorpay
              </button>
              <button
                id="method-stripe"
                onClick={() => setPaymentMethod("stripe")}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all ${
                  paymentMethod === "stripe"
                    ? "bg-[#ffd6ba]/12 border-[#ffd6ba] text-[#ffd6ba]"
                    : "bg-[#393e46]/40 border-[#00adb5]/15 text-[#eeeeee]/50 hover:border-[#ffd6ba]/25"
                }`}
              >
                <DollarSign size={15} /> Stripe
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-[#ffdcdc]/08 border border-[#ffdcdc]/25 text-[#ffdcdc] px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            id="pay-now-btn"
            onClick={handlePay}
            disabled={loading}
            className="w-full btn-primary py-4 rounded-xl font-bold text-base flex justify-center items-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <>
                <CreditCard size={18} />
                {paymentMethod === "razorpay" ? "Pay with Razorpay" : "Pay with Stripe"}
              </>
            )}
          </button>

          <p className="text-center text-xs text-[#eeeeee]/28">
            🔒 Payments are processed securely. We never store card details.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin w-8 h-8 text-[#00adb5]" />
          </div>
        }
      >
        <PaymentContent />
      </Suspense>
    </AuthGuard>
  );
}
