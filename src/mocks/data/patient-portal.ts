import type {
  Appointment,
  Invoice,
  PatientDocument,
  PatientOverview,
  SupportRequest,
} from "@/types/core";

const BASE_DAY = "2025-11-20";

export const patientOverview: PatientOverview = {
  id: "patient-1001",
  name: "Lakshmi Iyer",
  mrn: "MRN-5678",
  age: 42,
  gender: "F",
  primaryDoctor: "Dr. Kavya Desai",
  allergies: ["Penicillin"],
  activeProblems: ["Breast cancer (remission)", "Type II Diabetes"],
};

export const upcomingAppointments: Appointment[] = [
  {
    id: "APT-3001",
    patientId: "patient-1001",
    doctorId: "doctor-1",
    startAt: `${BASE_DAY}T10:30:00+05:30`,
    endAt: `${BASE_DAY}T10:55:00+05:30`,
    status: "scheduled",
    visitType: "OPD",
    reason: "Oncology follow-up",
  },
  {
    id: "APT-3101",
    patientId: "patient-1001",
    doctorId: "phlebotomist-1",
    startAt: `${BASE_DAY}T09:00:00+05:30`,
    status: "completed",
    visitType: "OPD",
    reason: "Lab collection",
  },
];

export const documents: PatientDocument[] = [
  {
    id: "DOC-900",
    patientId: "patient-1001",
    category: "lab",
    title: "CBC - 12 Nov 2025",
    createdAt: "2025-11-12T11:45:00+05:30",
    url: "https://example.com/docs/cbc-900.pdf",
  },
  {
    id: "DOC-901",
    patientId: "patient-1001",
    category: "discharge",
    title: "Discharge summary - 02 Oct 2025",
    createdAt: "2025-10-02T18:20:00+05:30",
  },
];

export const patientInvoices: Invoice[] = [
  {
    id: "INV-44901",
    patientId: "patient-1001",
    lines: [
      { desc: "Consultation", qty: 1, unitPrice: 1200, amount: 1200 },
      { desc: "Day care chemo", qty: 1, unitPrice: 4500, amount: 4500 },
    ],
    subtotal: 5700,
    discounts: 0,
    tax: 684,
    total: 6384,
    status: "unpaid",
    createdAt: `${BASE_DAY}T08:55:00+05:30`,
  },
  {
    id: "INV-43002",
    patientId: "patient-1001",
    lines: [
      { desc: "Pharmacy - analgesics", qty: 1, unitPrice: 650, amount: 650 },
    ],
    subtotal: 650,
    discounts: 0,
    tax: 78,
    total: 728,
    status: "paid",
    createdAt: "2025-10-12T12:30:00+05:30",
  },
];

export const supportTickets: SupportRequest[] = [
  {
    id: "SUP-1001",
    patientId: "patient-1001",
    subject: "Need invoice copy",
    message: "Please email my discharge invoice for last week.",
    status: "responded",
    createdAt: `${BASE_DAY}T09:35:00+05:30`,
    respondedAt: `${BASE_DAY}T10:10:00+05:30`,
  },
  {
    id: "SUP-1002",
    patientId: "patient-1001",
    subject: "Insurance query",
    message: "Does my policy cover the upcoming PET-CT?",
    status: "open",
    createdAt: `${BASE_DAY}T16:05:00+05:30`,
  },
];

export const patientAiDraft = {
  prompt:
    "Explain invoice INV-44901 in simple language and outline next steps for insurance reimbursement. Reply in under 120 words.",
  summary:
    "Your visit today includes the oncology consultation (₹1,200) and chemotherapy day-care charges (₹4,500). Taxes add up to ₹684, bringing the total to ₹6,384. Your insurer is expected to cover 80% once paperwork is submitted. Please pay the ₹1,276 co-pay at the billing desk and upload the insurer pre-authorization letter to finish the claim.",
  disclaimer: "For informational purposes only. Contact billing for clarifications.",
};
