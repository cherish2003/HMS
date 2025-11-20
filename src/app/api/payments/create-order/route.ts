import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Create Razorpay Order
 * POST /api/payments/create-order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, invoiceId, currency = "INR" } = body;

    if (!amount || !invoiceId) {
      return NextResponse.json(
        { error: "Missing required fields: amount, invoiceId" },
        { status: 400 }
      );
    }

    // In production, use Razorpay SDK to create order
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

    if (!RAZORPAY_KEY_SECRET || RAZORPAY_KEY_SECRET === "your_razorpay_key_secret_here") {
      // Demo mode - return mock order
      const orderId = `order_demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      return NextResponse.json({
        success: true,
        orderId,
        amount,
        currency,
        demo: true,
      });
    }

    // Production mode - integrate with Razorpay SDK
    // Uncomment and configure when ready for production
    /*
    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paisa
      currency,
      receipt: invoiceId,
      notes: {
        invoiceId,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
    */

    // Fallback for demo
    const orderId = `order_demo_${Date.now()}`;
    return NextResponse.json({
      success: true,
      orderId,
      amount,
      currency,
      demo: true,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
