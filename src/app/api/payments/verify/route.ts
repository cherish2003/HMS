import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * API Route: Verify Razorpay Payment Signature
 * POST /api/payments/verify
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentId, signature } = body;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Missing required fields: orderId, paymentId, signature" },
        { status: 400 }
      );
    }

    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

    // Demo mode - always return verified
    if (!RAZORPAY_KEY_SECRET || RAZORPAY_KEY_SECRET === "your_razorpay_key_secret_here") {
      return NextResponse.json({
        success: true,
        verified: true,
        demo: true,
      });
    }

    // Production mode - verify signature using Razorpay secret
    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const isValid = generatedSignature === signature;

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Invalid signature",
        },
        { status: 400 }
      );
    }

    // Update payment record in database here
    // await updatePaymentStatus(paymentId, "captured");

    return NextResponse.json({
      success: true,
      verified: true,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      {
        error: "Failed to verify payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
