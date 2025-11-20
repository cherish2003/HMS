import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/gemini";

/**
 * API Route: Generate AI Content
 * POST /api/ai/generate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, context } = body;

    if (!type) {
      return NextResponse.json(
        { error: "Missing required field: type" },
        { status: 400 }
      );
    }

    let result;

    // Route to appropriate AI service based on type
    switch (type) {
      case "discharge-summary":
        result = await AIService.generateDischargeSummary(context);
        break;
      case "invoice-explanation":
        result = await AIService.explainInvoice(context);
        break;
      case "counseling-note":
        result = await AIService.generateCounselingNote(context);
        break;
      case "lab-interpretation":
        result = await AIService.interpretLabResults(context);
        break;
      case "reception-script":
        result = await AIService.generateReceptionScript(context);
        break;
      case "handover-note":
        result = await AIService.generateHandoverNote(context);
        break;
      case "care-checklist":
        result = await AIService.generateCareChecklist(context);
        break;
      case "visit-summary":
        result = await AIService.summarizeVisit(context);
        break;
      case "prescription-guidance":
        result = await AIService.providePrescriptionGuidance(context);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown AI type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate AI content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
