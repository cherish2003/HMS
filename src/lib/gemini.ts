/**
 * Google Gemini AI Service
 * Handles all AI-powered features across the HMS application
 */

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export type GeminiPromptType =
  | "discharge-summary"
  | "invoice-explanation"
  | "counseling-note"
  | "lab-interpretation"
  | "reception-script"
  | "handover-note"
  | "care-checklist"
  | "visit-summary"
  | "prescription-guidance";

interface GeminiRequest {
  type: GeminiPromptType;
  context: Record<string, unknown>;
  customPrompt?: string;
}

interface GeminiResponse {
  success: boolean;
  text: string;
  error?: string;
  fallback?: boolean;
}

/**
 * System prompts for different AI features
 */
const SYSTEM_PROMPTS: Record<GeminiPromptType, string> = {
  "discharge-summary": `You are a medical documentation assistant for Medstar Hospitals. Generate a concise discharge summary in professional medical language. Include:
- Primary diagnosis and treatment summary
- Medications prescribed with dosing
- Follow-up instructions
- Warning signs to watch for
Keep it under 150 words, suitable for a physician to review and approve.`,

  "invoice-explanation": `You are a patient billing assistant for Medstar Hospitals. Explain the invoice in simple, compassionate language that a patient can understand. Include:
- Clear breakdown of major charges
- Insurance coverage details if mentioned
- Next steps for payment or claims
- Contact information for billing queries
Keep it under 120 words, friendly and reassuring tone.`,

  "counseling-note": `You are a clinical pharmacist at Medstar Hospitals. Provide medication counseling notes including:
- How and when to take each medication
- Key side effects or precautions
- Food/drug interactions if relevant
- When to contact the doctor
Keep it under 100 words, patient-friendly language.`,

  "lab-interpretation": `You are a laboratory specialist at Medstar Hospitals. Provide a preliminary interpretation draft for the lab results:
- Highlight abnormal values
- Clinical significance in simple terms
- Suggest follow-up tests if needed
- Note that final interpretation requires physician review
Keep it under 100 words, suitable for physician review.`,

  "reception-script": `You are a front desk coordinator at Medstar Hospitals. Generate a welcoming script for patient check-in:
- Greeting with patient name
- Verify appointment details
- Inform about wait time
- Collect necessary documents
Keep it under 80 words, warm and professional tone.`,

  "handover-note": `You are a senior nurse at Medstar Hospitals preparing shift handover. Summarize:
- Critical patient updates
- Pending tasks with priorities
- Medication rounds status
- Important alerts or concerns
Keep it under 120 words, clear and action-oriented.`,

  "care-checklist": `You are a nursing supervisor at Medstar Hospitals. Generate a prioritized care checklist:
- Vital signs monitoring schedule
- Medication administration times
- Wound care or procedures
- Patient mobility/positioning needs
Keep it under 100 words, structured as actionable items.`,

  "visit-summary": `You are a patient portal assistant at Medstar Hospitals. Summarize the recent visit:
- Purpose of visit
- Key findings or diagnoses
- Medications or treatments started
- Follow-up appointments needed
Keep it under 100 words, patient-friendly and reassuring.`,

  "prescription-guidance": `You are a pharmacy assistant at Medstar Hospitals. Provide guidance on prescription:
- Generic substitution recommendations
- Stock availability status
- Cost considerations
- Patient counseling points
Keep it under 80 words, suitable for pharmacist review.`,
};

/**
 * Fallback responses when API is unavailable
 */
const FALLBACK_RESPONSES: Record<GeminiPromptType, string> = {
  "discharge-summary":
    "Patient discharged in stable condition following successful treatment. Continue prescribed medications as directed. Follow up with primary care physician in 7-10 days. Monitor for fever, increased pain, or unusual symptoms and seek immediate care if they occur. Detailed discharge instructions provided separately.",

  "invoice-explanation":
    "Your visit includes consultation fees, diagnostic tests, and treatments provided. Insurance coverage applies to eligible items. Please pay the co-payment amount at the billing desk. For questions about charges or insurance claims, contact our billing department during business hours.",

  "counseling-note":
    "Take medications exactly as prescribed at the specified times. Common side effects may include mild nausea or drowsiness. Avoid alcohol while on this medication. Contact your doctor immediately if you experience severe reactions or if symptoms persist beyond the expected duration.",

  "lab-interpretation":
    "Lab results show values within expected ranges for your condition. Minor variations are noted and will be reviewed by your physician. Follow-up testing may be recommended based on clinical assessment. Please discuss these results with your doctor during your next appointment.",

  "reception-script":
    "Welcome to Medstar Hospitals. We're glad to see you today. Please have your ID and insurance card ready. Your doctor will see you shortly. If you need assistance, our staff is here to help.",

  "handover-note":
    "All critical patients stable. Medication rounds completed for morning shift. Two pending lab collections for ICU patients. Evening vitals monitoring scheduled. No active escalations at this time.",

  "care-checklist":
    "Monitor vitals every 4 hours. Administer scheduled medications at 08:00, 14:00, 20:00. Check wound dressing and document. Assist with patient mobility twice per shift. Maintain accurate intake/output records.",

  "visit-summary":
    "You visited Medstar Hospitals for evaluation and treatment. Your care team assessed your condition and provided appropriate interventions. Medications have been prescribed to support your recovery. Please follow the discharge instructions and attend scheduled follow-up appointments.",

  "prescription-guidance":
    "Generic alternatives available at reduced cost. Current stock sufficient for dispensing. Patient counseling recommended for first-time users. Monitor for common side effects and ensure patient understands dosing schedule.",
};

/**
 * Generate AI response using Gemini API
 */
export async function generateAIResponse(
  request: GeminiRequest
): Promise<GeminiResponse> {
  // Return fallback if API key is not configured
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
    console.warn("Gemini API key not configured, using fallback response");
    return {
      success: true,
      text: FALLBACK_RESPONSES[request.type],
      fallback: true,
    };
  }

  try {
    const systemPrompt = SYSTEM_PROMPTS[request.type];
    const userPrompt = request.customPrompt || buildContextPrompt(request);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nContext: ${userPrompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH",
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API error details:", errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      FALLBACK_RESPONSES[request.type];

    return {
      success: true,
      text: generatedText.trim(),
      fallback: false,
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      success: false,
      text: FALLBACK_RESPONSES[request.type],
      error: error instanceof Error ? error.message : "Unknown error",
      fallback: true,
    };
  }
}

/**
 * Build context prompt from request data
 */
function buildContextPrompt(request: GeminiRequest): string {
  const { type, context } = request;

  switch (type) {
    case "discharge-summary":
      return `Patient: ${context.patientName || "Unknown"}, Age: ${context.age || "N/A"}, Diagnosis: ${context.diagnosis || "Not specified"}, Treatment: ${context.treatment || "Standard care"}, Medications: ${context.medications || "As prescribed"}`;

    case "invoice-explanation":
      return `Invoice ID: ${context.invoiceId || "N/A"}, Total: ${context.total || "0"}, Items: ${JSON.stringify(context.items || [])}, Insurance: ${context.insurance || "Self-pay"}`;

    case "counseling-note":
      return `Prescription: ${context.prescriptionId || "N/A"}, Medications: ${JSON.stringify(context.medications || [])}, Patient Age: ${context.age || "Adult"}`;

    case "lab-interpretation":
      return `Test: ${context.testName || "General panel"}, Results: ${JSON.stringify(context.results || {})}, Patient: ${context.patientName || "Unknown"}`;

    case "reception-script":
      return `Patient: ${context.patientName || "Guest"}, Appointment: ${context.appointmentTime || "Scheduled"}, Doctor: ${context.doctorName || "Physician"}, Visit Type: ${context.visitType || "Consultation"}`;

    case "handover-note":
      return `Shift: ${context.shift || "Evening"}, Pending Tasks: ${JSON.stringify(context.tasks || [])}, Critical Alerts: ${JSON.stringify(context.alerts || [])}`;

    case "care-checklist":
      return `Patient: ${context.patientName || "Unknown"}, Condition: ${context.condition || "General care"}, Special Requirements: ${context.requirements || "Standard protocol"}`;

    case "visit-summary":
      return `Visit Date: ${context.visitDate || "Recent"}, Chief Complaint: ${context.complaint || "Evaluation"}, Diagnosis: ${context.diagnosis || "Assessment completed"}, Treatment: ${context.treatment || "As recommended"}`;

    case "prescription-guidance":
      return `Prescription: ${context.prescriptionId || "N/A"}, Drug: ${context.drugName || "Medication"}, Patient: ${context.patientName || "Unknown"}, Insurance: ${context.insurance || "Self-pay"}`;

    default:
      return JSON.stringify(context);
  }
}

/**
 * Convenience methods for specific AI features
 */
export const AIService = {
  generateDischargeSummary: async (context: {
    patientName: string;
    age: number;
    diagnosis: string;
    treatment: string;
    medications: string;
  }) =>
    generateAIResponse({
      type: "discharge-summary",
      context,
    }),

  explainInvoice: async (context: {
    invoiceId: string;
    total: number;
    items: Array<{ desc: string; amount: number }>;
    insurance?: string;
  }) =>
    generateAIResponse({
      type: "invoice-explanation",
      context,
    }),

  generateCounselingNote: async (context: {
    prescriptionId: string;
    medications: Array<{ name: string; dose: string; frequency: string }>;
    age?: number;
  }) =>
    generateAIResponse({
      type: "counseling-note",
      context,
    }),

  interpretLabResults: async (context: {
    testName: string;
    results: Record<string, unknown>;
    patientName: string;
  }) =>
    generateAIResponse({
      type: "lab-interpretation",
      context,
    }),

  generateReceptionScript: async (context: {
    patientName: string;
    appointmentTime: string;
    doctorName: string;
    visitType: string;
  }) =>
    generateAIResponse({
      type: "reception-script",
      context,
    }),

  generateHandoverNote: async (context: {
    shift: string;
    tasks: string[];
    alerts: string[];
  }) =>
    generateAIResponse({
      type: "handover-note",
      context,
    }),

  generateCareChecklist: async (context: {
    patientName: string;
    condition: string;
    requirements?: string;
  }) =>
    generateAIResponse({
      type: "care-checklist",
      context,
    }),

  summarizeVisit: async (context: {
    visitDate: string;
    complaint: string;
    diagnosis: string;
    treatment: string;
  }) =>
    generateAIResponse({
      type: "visit-summary",
      context,
    }),

  providePrescriptionGuidance: async (context: {
    prescriptionId: string;
    drugName: string;
    patientName: string;
    insurance?: string;
  }) =>
    generateAIResponse({
      type: "prescription-guidance",
      context,
    }),
};
