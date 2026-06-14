import { useMutation } from "@tanstack/react-query";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createStripeIntent,
  confirmStripePayment,
} from "../services/payment.service";

export function useCreateRazorpayOrderMutation() {
  return useMutation({
    mutationFn: async ({ datasetId, amountPaise }: { datasetId: string; amountPaise: number }) => {
      return createRazorpayOrder(datasetId, amountPaise);
    },
  });
}

export function useVerifyRazorpayPaymentMutation() {
  return useMutation({
    mutationFn: verifyRazorpayPayment,
  });
}

export function useCreateStripeIntentMutation() {
  return useMutation({
    mutationFn: async ({
      datasetId,
      amountCents,
      currency,
    }: {
      datasetId: string;
      amountCents: number;
      currency?: string;
    }) => {
      return createStripeIntent(datasetId, amountCents, currency);
    },
  });
}

export function useConfirmStripePaymentMutation() {
  return useMutation({
    mutationFn: confirmStripePayment,
  });
}
