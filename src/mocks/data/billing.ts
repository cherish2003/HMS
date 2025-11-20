import type { Claim, Invoice, InvoiceLine, Payment } from "@/types/core";

const TODAY = "2025-11-20";

const createLines = (lines: Array<Omit<InvoiceLine, "amount">>): InvoiceLine[] =>
  lines.map((line) => ({ ...line, amount: line.qty * line.unitPrice }));

export const invoices: Invoice[] = [
  {
    id: "INV-44901",
    patientId: "patient-1001",
    encounterId: "enc-10001",
    lines: createLines([
      { code: "CONS01", desc: "Consultation", qty: 1, unitPrice: 1200 },
      { code: "CHM201", desc: "Chemotherapy chair usage", qty: 1, unitPrice: 4500 },
      { code: "LAB501", desc: "Liver Function Panel", qty: 1, unitPrice: 550 },
    ]),
    subtotal: 6250,
    discounts: 0,
    tax: 750,
    total: 7000,
    status: "unpaid",
    createdAt: `${TODAY}T08:55:00+05:30`,
  },
  {
    id: "INV-47002",
    patientId: "patient-1002",
    encounterId: "enc-10002",
    lines: createLines([
      { code: "CONS01", desc: "Consultation", qty: 1, unitPrice: 900 },
      { code: "PHY301", desc: "Cardiac rehab session", qty: 1, unitPrice: 1800 },
    ]),
    subtotal: 2700,
    discounts: 0,
    tax: 324,
    total: 3024,
    status: "pending",
    createdAt: `${TODAY}T09:40:00+05:30`,
  },
  {
    id: "INV-47510",
    patientId: "patient-1004",
    lines: createLines([
      { code: "CONS01", desc: "Consultation", qty: 1, unitPrice: 750 },
      { code: "LAB120", desc: "HbA1c", qty: 1, unitPrice: 450 },
    ]),
    subtotal: 1200,
    discounts: 0,
    tax: 144,
    total: 1344,
    status: "paid",
    createdAt: `${TODAY}T11:05:00+05:30`,
  },
  {
    id: "INV-47030",
    patientId: "patient-1005",
    encounterId: "enc-10003",
    lines: createLines([
      { code: "ICUBED", desc: "ICU Bed (per day)", qty: 2, unitPrice: 9800 },
      { code: "LAB220", desc: "ABG Panel", qty: 2, unitPrice: 850 },
      { code: "DRG801", desc: "High-end antibiotics", qty: 3, unitPrice: 2800 },
    ]),
    subtotal: 29600,
    discounts: 0,
    tax: 3552,
    total: 33152,
    status: "unpaid",
    createdAt: `${TODAY}T07:30:00+05:30`,
  },
];

export const payments: Payment[] = [
  {
    id: "PAY-9001",
    invoiceId: "INV-47510",
    amount: 1344,
    method: "UPI",
    paymentRef: "TXN-6ZP1",
    status: "succeeded",
    createdAt: `${TODAY}T11:10:00+05:30`,
  },
  {
    id: "PAY-9002",
    invoiceId: "INV-44901",
    amount: 2000,
    method: "Insurance",
    paymentRef: "CLAIM-PARTIAL",
    status: "initiated",
    createdAt: `${TODAY}T09:05:00+05:30`,
  },
];

export const claims: Claim[] = [
  {
    id: "CLM-301",
    invoiceId: "INV-44901",
    insurer: "Arogya Secure",
    policyNo: "POL-AR-9981",
    status: "pending",
    submittedAt: `${TODAY}T09:15:00+05:30`,
  },
  {
    id: "CLM-302",
    invoiceId: "INV-47002",
    insurer: "Cardio Shield",
    policyNo: "POL-CS-3345",
    status: "submitted",
    submittedAt: `${TODAY}T10:00:00+05:30`,
  },
  {
    id: "CLM-220",
    invoiceId: "INV-47030",
    insurer: "Intensive Cover",
    policyNo: "POL-IC-7711",
    status: "denied",
    submittedAt: "2025-11-18T14:20:00+05:30",
    adjudicatedAt: "2025-11-19T16:45:00+05:30",
  },
];
