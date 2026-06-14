import { apiClient } from "@/lib/api/axios";

export const createRazorpayOrder = async (
  datasetId: string,
  amountPaise: number
): Promise<{ order_id: string; amount: number; currency: string; key_id: string }> => {
  const res = await apiClient.post("/api/create-razorpay-order", {
    dataset_id: datasetId,
    amount: amountPaise,
  });
  return res.data;
};

export const verifyRazorpayPayment = async (params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  dataset_id: string;
}): Promise<{ success: boolean; dataset_id: string }> => {
  const res = await apiClient.post("/api/verify-razorpay-payment", {
    razorpay_order_id: params.razorpay_order_id,
    razorpay_payment_id: params.razorpay_payment_id,
    razorpay_signature: params.razorpay_signature,
    dataset_id: params.dataset_id,
  });
  return res.data;
};

export const createStripeIntent = async (
  datasetId: string,
  amountCents: number,
  currency = "usd"
): Promise<{
  client_secret: string;
  amount: number;
  currency: string;
  publishable_key: string;
}> => {
  const res = await apiClient.post("/api/create-stripe-intent", {
    dataset_id: datasetId,
    amount: amountCents,
    currency,
  });
  return res.data;
};

export const confirmStripePayment = async (params: {
  payment_intent_id: string;
  dataset_id: string;
}): Promise<{ success: boolean; dataset_id: string }> => {
  const res = await apiClient.post("/api/confirm-stripe-payment", {
    payment_intent_id: params.payment_intent_id,
    dataset_id: params.dataset_id,
  });
  return res.data;
};
