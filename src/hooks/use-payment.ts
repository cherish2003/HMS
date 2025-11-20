"use client";

import { useState } from "react";
import { PaymentService, type PaymentResult } from "@/lib/payment";

interface UsePaymentOptions {
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
}

interface UsePaymentResult {
  initiatePayment: (
    invoiceId: string,
    amount: number,
    patientDetails: {
      name: string;
      email?: string;
      phone?: string;
    }
  ) => Promise<void>;
  loading: boolean;
  error: string | null;
  result: PaymentResult | null;
}

/**
 * React hook for payment processing
 */
export function usePayment(options: UsePaymentOptions = {}): UsePaymentResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentResult | null>(null);

  const initiatePayment = async (
    invoiceId: string,
    amount: number,
    patientDetails: {
      name: string;
      email?: string;
      phone?: string;
    }
  ) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const paymentResult = await PaymentService.payInvoice(
        invoiceId,
        amount,
        patientDetails
      );

      setResult(paymentResult);

      if (paymentResult.success) {
        options.onSuccess?.(paymentResult);
      } else {
        const errorMsg = paymentResult.error || "Payment failed";
        setError(errorMsg);
        options.onError?.(errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment processing failed";
      setError(errorMessage);
      options.onError?.(errorMessage);
      console.error("Payment error:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    initiatePayment,
    loading,
    error,
    result,
  };
}
