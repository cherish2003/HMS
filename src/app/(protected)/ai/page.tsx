"use client";

import { useState } from "react";
import { Lock, MessageSquare, Sparkles, AlertCircle, Database, Users, FileText, Activity, Send, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  examples: string[];
}

function FeatureCard({ icon: Icon, title, description, examples }: FeatureCardProps) {
  return (
    <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-lg transition-all hover:shadow-xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Example Queries:</p>
        <ul className="space-y-2">
          {examples.map((example, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {example}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface ChatMessageProps {
  type: "user" | "assistant";
  message: string;
}

function ChatMessage({ type, message }: ChatMessageProps) {
  return (
    <div className={cn("flex gap-3", type === "user" ? "justify-end" : "justify-start")}>
      {type === "assistant" && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
          type === "user"
            ? "bg-primary text-primary-foreground"
            : "border-2 border-border bg-muted"
        )}
      >
        <p className="whitespace-pre-line">{message}</p>
      </div>
      {type === "user" && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <Users className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

interface TechRequirementCardProps {
  title: string;
  items: string[];
}

function TechRequirementCard({ title, items }: TechRequirementCardProps) {
  return (
    <div className="space-y-3 rounded-lg border-2 border-border bg-muted/30 p-4">
      <h4 className="font-bold text-foreground">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AiAssistantPage() {
  const [selectedTab, setSelectedTab] = useState<"overview" | "demo">("overview");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Knowledge Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Advanced conversational AI for hospital data intelligence and clinical insights
            </p>
          </div>
        </div>
      </div>

      {/* Premium Feature Alert */}
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6 shadow-sm dark:border-amber-800 dark:bg-amber-950/30">
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-full bg-amber-100 p-3 dark:bg-amber-900/50">
            <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100">
                Premium Feature - Custom Development Required
              </h2>
              <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
                This AI Knowledge Assistant is an advanced enterprise feature that requires separate development and integration. 
                It goes beyond the standard AI features included in the base system.
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 rounded-lg border border-amber-200 bg-white/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
                <p className="font-bold text-amber-900 dark:text-amber-100">✓ Already Included</p>
                <ul className="space-y-1.5 text-sm text-amber-800 dark:text-amber-200">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                    AI Invoice Explanations
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                    AI Medication Counseling
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                    AI Lab Interpretations
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                    Contextual AI assistance
                  </li>
                </ul>
              </div>

              <div className="space-y-2 rounded-lg border border-amber-200 bg-white/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
                <p className="font-bold text-amber-900 dark:text-amber-100">⚡ Requires Development</p>
                <ul className="space-y-1.5 text-sm text-amber-800 dark:text-amber-200">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                    Chat interface & history
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                    Real-time data querying
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                    RAG & vector database
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                    Role-based access control
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg border-2 border-amber-400 bg-amber-100 p-4 dark:border-amber-700 dark:bg-amber-900/30">
              <p className="font-bold text-amber-900 dark:text-amber-100">
                💰 Additional Development Investment Required
              </p>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                Complex data integration, security protocols, and custom AI model fine-tuning needed. 
                Contact the development team for a detailed scope and cost estimate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b-2 border-border">
        <button
          onClick={() => setSelectedTab("overview")}
          className={cn(
            "border-b-4 px-6 py-3 text-sm font-semibold transition-all",
            selectedTab === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:border-muted hover:text-foreground"
          )}
        >
          Feature Overview
        </button>
        <button
          onClick={() => setSelectedTab("demo")}
          className={cn(
            "border-b-4 px-6 py-3 text-sm font-semibold transition-all",
            selectedTab === "demo"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:border-muted hover:text-foreground"
          )}
        >
          Concept Demo
        </button>
      </div>

      {selectedTab === "overview" ? (
        <div className="grid gap-6 md:grid-cols-2">
          <FeatureCard
            icon={MessageSquare}
            title="Natural Language Queries"
            description="Ask questions about patient data, appointments, lab results, or hospital operations in plain English."
            examples={[
              "Show me all critical lab results from today",
              "Which patients have pending discharge summaries?",
              "What's the average wait time in emergency this week?",
            ]}
          />
          <FeatureCard
            icon={Database}
            title="Hospital Knowledge Base"
            description="AI trained on hospital policies, protocols, drug databases, and medical guidelines specific to your organization."
            examples={[
              "What's our protocol for sepsis management?",
              "Show contraindications for patient on warfarin",
              "Latest clinical guidelines for diabetes care",
            ]}
          />
          <FeatureCard
            icon={Users}
            title="Patient Data Intelligence"
            description="Query patient records, treatment histories, and clinical data with natural language while maintaining HIPAA compliance."
            examples={[
              "List all diabetic patients with HbA1c > 8",
              "Show readmission rates for cardiac patients",
              "Find patients due for annual screenings",
            ]}
          />
          <FeatureCard
            icon={FileText}
            title="Clinical Documentation Assistant"
            description="Generate comprehensive clinical notes, discharge summaries, and reports based on conversation context."
            examples={[
              "Draft discharge summary for patient P-9012",
              "Create handover note for ICU bed 4",
              "Generate weekly mortality review report",
            ]}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mockup Notice */}
          <div className="flex items-center gap-3 rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
            <AlertCircle className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Conceptual mockup - actual implementation requires custom development
            </p>
          </div>

          {/* Chat Interface Mockup */}
          <div className="overflow-hidden rounded-2xl border-2 border-border bg-card shadow-lg">
            {/* Chat Header */}
            <div className="border-b-2 border-border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">AI Assistant</h3>
                    <p className="text-xs text-muted-foreground">Hospital Knowledge Base</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full border-2 border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                  <Activity className="h-3 w-3" />
                  Connected
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-[500px] space-y-4 overflow-y-auto p-6">
              <ChatMessage
                type="user"
                message="Show me all patients admitted in the last 24 hours with respiratory issues"
              />
              <ChatMessage
                type="assistant"
                message="I found 8 patients admitted with respiratory-related conditions in the last 24 hours:\n\n• P-8901 - Age 67 - Pneumonia (ICU, Bed 3)\n• P-8912 - Age 54 - COPD exacerbation (Ward 2B)\n• P-8923 - Age 71 - COVID-19 (Isolation, Room 12)\n• P-8934 - Age 45 - Asthma attack (Emergency, stable)\n• P-8945 - Age 82 - Respiratory failure (ICU, Bed 7)\n\nWould you like detailed information about any specific patient?"
              />
              <ChatMessage
                type="user"
                message="What's the protocol for managing the COPD patient?"
              />
              <ChatMessage
                type="assistant"
                message="Based on Medstar's COPD exacerbation protocol:\n\n1. **Oxygen therapy**: Target SpO2 88-92%\n2. **Bronchodilators**: Salbutamol nebulization 6-hourly\n3. **Steroids**: Prednisolone 40mg OD for 5 days\n4. **Antibiotics**: If purulent sputum (Amoxicillin-Clavulanate)\n5. **Monitoring**: ABG in 2 hours if severe\n\nPatient P-8912 is currently on steps 1-3. Would you like me to check their latest vitals or lab results?"
              />
            </div>

            {/* Chat Input */}
            <div className="border-t-2 border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask about patients, protocols, or hospital data..."
                  disabled
                  className="flex-1 rounded-lg border-2 border-border bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button 
                  disabled 
                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground opacity-50 transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                This is a mockup. Actual chat requires custom AI backend development.
              </p>
            </div>
          </div>

          {/* Technical Requirements */}
          <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-lg">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
              <Lock className="h-6 w-6 text-primary" />
              Technical Requirements for Implementation
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <TechRequirementCard
                title="Backend Development"
                items={[
                  "Vector database (Pinecone/Weaviate)",
                  "RAG pipeline with embeddings",
                  "Secure API with rate limiting",
                  "Message history persistence",
                ]}
              />
              <TechRequirementCard
                title="Data Integration"
                items={[
                  "EHR/HMS database connectors",
                  "Real-time data synchronization",
                  "HIPAA-compliant data masking",
                  "Audit logging for all queries",
                ]}
              />
              <TechRequirementCard
                title="AI Infrastructure"
                items={[
                  "Custom model fine-tuning",
                  "Context window management",
                  "Semantic search optimization",
                  "Response validation layer",
                ]}
              />
              <TechRequirementCard
                title="Security & Compliance"
                items={[
                  "Role-based access control",
                  "End-to-end encryption",
                  "HIPAA compliance certification",
                  "Comprehensive audit trails",
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
