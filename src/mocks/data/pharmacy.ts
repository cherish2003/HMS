import type {
  DispenseRecord,
  InventoryTransaction,
  Medication,
  Prescription,
} from "@/types/core";

const BASE_DAY = "2025-11-20";

export const dispenseQueue: Array<Prescription & { priority: "stat" | "urgent" | "routine" }> = [
  {
    id: "RX-120",
    encounterId: "enc-120",
    patientId: "patient-1006",
    doctorId: "doctor-1",
    status: "prescribed",
    createdAt: `${BASE_DAY}T16:10:00+05:30`,
    priority: "stat",
    items: [
      {
        drugId: "DR-101",
        name: "Ceftriaxone 1g",
        dose: "1g",
        frequency: "IV q12h",
        route: "IV",
        duration: "5 days",
        generic: false,
      },
      {
        drugId: "DR-305",
        name: "Paracetamol 500mg",
        dose: "500mg",
        frequency: "PO q6h",
        route: "Oral",
        duration: "3 days",
        generic: true,
      },
    ],
  },
  {
    id: "RX-121",
    encounterId: "enc-130",
    patientId: "patient-1010",
    doctorId: "doctor-3",
    status: "prescribed",
    createdAt: `${BASE_DAY}T15:35:00+05:30`,
    priority: "urgent",
    items: [
      {
        drugId: "DR-220",
        name: "Metformin 500mg",
        dose: "500mg",
        frequency: "PO BID",
        route: "Oral",
        duration: "30 days",
        generic: true,
      },
    ],
  },
  {
    id: "RX-118",
    encounterId: "enc-118",
    patientId: "patient-0987",
    doctorId: "doctor-2",
    status: "prescribed",
    createdAt: `${BASE_DAY}T14:20:00+05:30`,
    priority: "routine",
    items: [
      {
        drugId: "DR-410",
        name: "Atorvastatin 20mg",
        dose: "20mg",
        frequency: "PO HS",
        route: "Oral",
        duration: "60 days",
        generic: true,
      },
    ],
  },
];

export const medicationCatalog: Medication[] = [
  {
    id: "DR-101",
    name: "Ceftriaxone",
    brand: "Cefomed",
    generic: "Ceftriaxone",
    formulation: "Injection",
    packSize: "1g vial",
    stockQty: 46,
    reorderLevel: 30,
  },
  {
    id: "DR-305",
    name: "Paracetamol",
    brand: "Dolo",
    generic: "Acetaminophen",
    formulation: "Tablet",
    packSize: "10s strip",
    stockQty: 210,
    reorderLevel: 120,
  },
  {
    id: "DR-220",
    name: "Metformin",
    brand: "Glyciphage",
    generic: "Metformin",
    formulation: "Tablet",
    packSize: "15s strip",
    stockQty: 85,
    reorderLevel: 60,
  },
  {
    id: "DR-410",
    name: "Atorvastatin",
    brand: "Lipicure",
    generic: "Atorvastatin",
    formulation: "Tablet",
    packSize: "10s strip",
    stockQty: 34,
    reorderLevel: 40,
  },
  {
    id: "DR-512",
    name: "Ranitidine",
    brand: "Aciloc",
    generic: "Ranitidine",
    formulation: "Tablet",
    packSize: "20s strip",
    stockQty: 12,
    reorderLevel: 50,
  },
];

export const dispenseHistory: DispenseRecord[] = [
  {
    id: "DSP-9001",
    prescriptionId: "RX-110",
    items: [
      { drugId: "DR-512", qty: 10 },
      { drugId: "DR-220", qty: 30 },
    ],
    dispensedBy: "nurse-2",
    dispensedAt: `${BASE_DAY}T13:05:00+05:30`,
    notes: "Substituted DR-220 with hospital generic stock",
  },
  {
    id: "DSP-9002",
    prescriptionId: "RX-119",
    items: [{ drugId: "DR-410", qty: 30 }],
    dispensedBy: "pharmacist-1",
    dispensedAt: `${BASE_DAY}T11:50:00+05:30`,
  },
];

export const inventoryTransactions: InventoryTransaction[] = [
  {
    id: "TXN-2001",
    medicationId: "DR-512",
    type: "adjustment",
    qty: -5,
    reason: "Damaged blister pack",
    createdAt: `${BASE_DAY}T09:15:00+05:30`,
  },
  {
    id: "TXN-2002",
    medicationId: "DR-101",
    type: "reorder",
    qty: 100,
    reason: "Supplier delivery GRN-556",
    createdAt: `${BASE_DAY}T08:40:00+05:30`,
  },
  {
    id: "TXN-2003",
    medicationId: "DR-410",
    type: "return",
    qty: 5,
    reason: "Patient discharge cancellation",
    createdAt: `${BASE_DAY}T16:45:00+05:30`,
  },
];

export const counselingDraft = {
  prompt:
    "Provide medication counseling for RX-120: highlight IV antibiotic timing and oral analgesic instructions, flag any food interactions, and remind to report allergic reactions immediately.",
  aiResponse:
    "Ceftriaxone IV will be administered every 12 hours; monitor for rash or breathing difficulty during infusion and alert the nurse immediately. Paracetamol tablets may be taken with water every 6 hours as needed; avoid exceeding 4g in 24 hours and maintain hydration. No known food restrictions, but limit alcohol while on analgesics.",
  disclaimer: "Informational draft—pharmacist review required.",
};
