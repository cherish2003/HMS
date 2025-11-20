import type { LabOrder, LabResult, RadiologyReport } from "@/types/core";

const BASE_DAY = "2025-11-20";

export const labOrders: Array<LabOrder & { labelsPrinted?: boolean }> = [
  {
    id: "LO-900",
    encounterId: "enc-10001",
    patientId: "patient-1001",
    doctorId: "doctor-1",
    tests: [
      { testId: "T-201", name: "Complete Blood Count" },
      { testId: "T-203", name: "CRP" },
    ],
    status: "ordered",
    priority: "urgent",
    resultIds: ["LR-7001", "LR-7002"],
    orderedAt: `${BASE_DAY}T15:20:00+05:30`,
    labelsPrinted: true,
  },
  {
    id: "LO-901",
    patientId: "patient-1004",
    doctorId: "doctor-3",
    tests: [{ testId: "T-310", name: "Liver Function Panel" }],
    status: "collected",
    priority: "routine",
    resultIds: ["LR-7003"],
    orderedAt: `${BASE_DAY}T11:05:00+05:30`,
    labelsPrinted: true,
  },
  {
    id: "LO-905",
    patientId: "patient-1006",
    doctorId: "doctor-2",
    tests: [
      { testId: "T-420", name: "Serum Potassium" },
      { testId: "T-422", name: "Serum Sodium" },
    ],
    status: "ordered",
    priority: "stat",
    resultIds: [],
    orderedAt: `${BASE_DAY}T16:45:00+05:30`,
  },
];

export const labResults: Array<LabResult & { released?: boolean }> = [
  {
    id: "LR-7001",
    orderId: "LO-900",
    testId: "T-201",
    value: 13.2,
    unit: "g/dL",
    refRange: "12-15",
    flagged: false,
    verified: true,
    verifiedAt: `${BASE_DAY}T17:15:00+05:30`,
    released: true,
  },
  {
    id: "LR-7002",
    orderId: "LO-900",
    testId: "T-203",
    value: 120,
    unit: "mg/L",
    refRange: "0-5",
    flagged: true,
    verified: false,
  },
  {
    id: "LR-7003",
    orderId: "LO-901",
    testId: "T-310",
    value: "Report uploaded",
    refRange: "",
    flagged: false,
    verified: true,
    verifiedAt: `${BASE_DAY}T12:40:00+05:30`,
    released: true,
  },
];

export const radiologyReports: RadiologyReport[] = [
  {
    id: "RR-500",
    orderId: "LO-950",
    modality: "CT Abdomen",
    findings: "Mild hepatomegaly with diffuse steatosis. No focal lesions detected.",
    impression: "Features consistent with grade 1 fatty liver disease.",
    fileUrl: "https://example.com/reports/rr-500.pdf",
    createdAt: `${BASE_DAY}T13:10:00+05:30`,
    verifiedAt: `${BASE_DAY}T14:45:00+05:30`,
  },
  {
    id: "RR-501",
    orderId: "LO-951",
    modality: "X-Ray Chest PA",
    findings: "Right lower zone infiltrates; borderline cardiomegaly.",
    impression: "Suggestive of early pneumonia. Clinical correlation recommended.",
    createdAt: `${BASE_DAY}T15:55:00+05:30`,
  },
];

export const escalations = [
  {
    id: "ESC-200",
    orderId: "LO-900",
    message: "CRP elevated at 120 mg/L. Physician notified at 17:20.",
    acknowledgedBy: "doctor-1",
    acknowledgedAt: `${BASE_DAY}T17:25:00+05:30`,
  },
];

export const interpretationDraft = {
  orderId: "LO-900",
  draft:
    "Complete blood count within normal range. C-reactive protein elevated at 120 mg/L indicating significant inflammatory activity; recommend correlating with clinical findings and repeating in 24 hours if symptoms persist.",
  patientVersion:
    "Your blood counts look normal. One inflammation marker is high, which can happen when the body fights an infection. Your doctor will review this and may repeat the test tomorrow.",
  disclaimer: "Draft only. Requires pathologist verification before release.",
};
