/**
 * Razorpay Payment Integration Service
 * Handles payment processing for patient billing
 */

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

export interface PaymentOptions {
  amount: number; // in paisa (multiply by 100)
  currency?: string;
  invoiceId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  description?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
}

/**
 * Load Razorpay script dynamically
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Create Razorpay order (server-side in production)
 * For demo, we'll create a mock order client-side
 */
async function createOrder(
  amount: number,
  invoiceId: string
): Promise<{ orderId: string; amount: number }> {
  // In production, this should call your backend API
  // For demo purposes, we'll create a mock order ID
  
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock order creation
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  return {
    orderId,
    amount,
  };
}

/**
 * Initialize and display Razorpay payment modal
 */
export async function initiatePayment(
  options: PaymentOptions
): Promise<PaymentResult> {
  // Check if Razorpay is configured
  if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === "your_razorpay_key_id_here") {
    console.warn("Razorpay not configured, simulating successful payment");
    
    // Simulate payment delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    return {
      success: true,
      paymentId: `pay_demo_${Date.now()}`,
      orderId: `order_demo_${Date.now()}`,
      signature: "demo_signature",
    };
  }

  try {
    // Load Razorpay script
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      throw new Error("Failed to load Razorpay SDK");
    }

    // Create order
    const order = await createOrder(options.amount, options.invoiceId);

    // Return payment promise
    return new Promise((resolve) => {
      const razorpayOptions = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: options.currency || "INR",
        name: "Medstar Hospitals",
        description: options.description || `Payment for Invoice ${options.invoiceId}`,
        order_id: order.orderId,
        prefill: {
          name: options.patientName,
          email: options.patientEmail || "",
          contact: options.patientPhone || "",
        },
        theme: {
          color: "hsl(var(--primary))",
        },
        handler: function (response: any) {
          resolve({
            success: true,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: function () {
            resolve({
              success: false,
              error: "Payment cancelled by user",
            });
          },
        },
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.on("payment.failed", function (response: any) {
        resolve({
          success: false,
          error: response.error.description || "Payment failed",
        });
      });

      razorpay.open();
    });
  } catch (error) {
    console.error("Payment error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment failed",
    };
  }
}

/**
 * Verify payment signature (should be done server-side in production)
 */
export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  // In production, this should call your backend API to verify the signature
  // using Razorpay secret key (never expose secret on client)
  
  // For demo, we'll simulate verification
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  // Always return true for demo mode
  return true;
}

/**
 * Get payment details
 */
export async function getPaymentDetails(paymentId: string): Promise<{
  status: string;
  amount: number;
  method?: string;
  createdAt: string;
} | null> {
  // In production, call backend API to fetch payment details
  
  // For demo, return mock data
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  return {
    status: "captured",
    amount: 0,
    method: "card",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Refund payment
 */
export async function refundPayment(
  paymentId: string,
  amount?: number
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  // In production, call backend API to process refund
  
  // For demo, simulate refund
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  return {
    success: true,
    refundId: `rfnd_demo_${Date.now()}`,
  };
}

/**
 * Payment service with convenience methods
 */
export const PaymentService = {
  /**
   * Process invoice payment
   */
  payInvoice: async (
    invoiceId: string,
    amount: number,
    patientDetails: {
      name: string;
      email?: string;
      phone?: string;
    }
  ) => {
    return initiatePayment({
      amount: amount * 100, // Convert to paisa
      invoiceId,
      patientName: patientDetails.name,
      patientEmail: patientDetails.email,
      patientPhone: patientDetails.phone,
      description: `Payment for Invoice ${invoiceId}`,
    });
  },

  /**
   * Process appointment booking payment
   */
  payAppointment: async (
    appointmentId: string,
    amount: number,
    patientDetails: {
      name: string;
      email?: string;
      phone?: string;
    }
  ) => {
    return initiatePayment({
      amount: amount * 100,
      invoiceId: appointmentId,
      patientName: patientDetails.name,
      patientEmail: patientDetails.email,
      patientPhone: patientDetails.phone,
      description: `Appointment Booking Fee - ${appointmentId}`,
    });
  },

  /**
   * Process deposit payment
   */
  payDeposit: async (
    patientId: string,
    amount: number,
    patientDetails: {
      name: string;
      email?: string;
      phone?: string;
    }
  ) => {
    return initiatePayment({
      amount: amount * 100,
      invoiceId: `deposit_${patientId}`,
      patientName: patientDetails.name,
      patientEmail: patientDetails.email,
      patientPhone: patientDetails.phone,
      description: "Admission Deposit",
    });
  },

  /**
   * Verify payment signature
   */
  verify: verifyPayment,

  /**
   * Get payment status and details
   */
  getDetails: getPaymentDetails,

  /**
   * Process refund
   */
  refund: refundPayment,
};
