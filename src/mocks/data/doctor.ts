import type {
  Appointment,
  Encounter,
  LabOrder,
  LabResult,
  Prescription,
  PrescriptionItem,
} from "@/types/core";

export type DoctorScheduleEntry = Appointment & {
  patientName: string;
  patientInitials: string;
  checkInStatus: "Pending" | "Checked-in" | "In progress" | "Completed";
  tags: string[];
};

export type EncounterWorkspace = Encounter & {
  problemList: string[];
  vitalsSummary: string;
  attachments: Array<{ id: string; name: string; type: string }>;
};

export type LabInboxItem = {
  id: string;
  patientName: string;
  department: string;
  summary: string;
  critical: boolean;
  receivedAt: string;
  orderId: string;
};

export type RoundingCard = {
  patientId: string;
  name: string;
  location: string;
  acuity: "Stable" | "Watch" | "Critical";
  lastUpdate: string;
  tasksDue: string[];
};

export const doctorSchedule: DoctorScheduleEntry[] = [
  {
    id: "appt-8001",
    patientId: "patient-1001",
    doctorId: "doctor-1",
    startAt: "2025-11-20T08:30:00+05:30",
    endAt: "2025-11-20T09:00:00+05:30",
    status: "in-progress",
    room: "OPD 4A",
    visitType: "OPD",
    reason: "Post chemo follow-up",
    patientName: "Sunita Verma",
    patientInitials: "SV",
    checkInStatus: "In progress",
    tags: ["Oncology", "Chemo"],
  },
  {
    id: "appt-8002",
    patientId: "patient-1002",
    doctorId: "doctor-1",
    startAt: "2025-11-20T09:15:00+05:30",
    endAt: "2025-11-20T09:45:00+05:30",
    status: "checked-in",
    room: "OPD 4A",
    visitType: "OPD",
    reason: "Cardiac rehab review",
    patientName: "Rahul Sharma",
    patientInitials: "RS",
    checkInStatus: "Checked-in",
    tags: ["Cardiac Rehab"],
  },
  {
    id: "appt-8003",
    patientId: "patient-1003",
    doctorId: "doctor-1",
    startAt: "2025-11-20T10:00:00+05:30",
    endAt: "2025-11-20T10:30:00+05:30",
    status: "scheduled",
    room: "Telehealth",
    visitType: "Telehealth",
    reason: "Diabetes management",
    patientName: "Geeta Patel",
    patientInitials: "GP",
    checkInStatus: "Pending",
    tags: ["Endocrinology"],
  },
  {
    id: "appt-8004",
    patientId: "patient-1005",
    doctorId: "doctor-1",
    startAt: "2025-11-20T11:15:00+05:30",
    endAt: "2025-11-20T11:45:00+05:30",
    status: "scheduled",
    room: "Ward 5",
    visitType: "IPD",
    reason: "Inpatient review",
    patientName: "Vikram Rao",
    patientInitials: "VR",
    checkInStatus: "Pending",
    tags: ["Critical Care"],
  },
];

export const encounterWorkspace: EncounterWorkspace[] = [
  {
    id: "enc-10001",
    patientId: "patient-1001",
    doctorId: "doctor-1",
    appointmentId: "appt-8001",
    notes: "Patient tolerating chemo cycle 3. Mild nausea controlled with ondansetron."
      + " Labs show neutrophil dip, monitor closely.",
    icdCodes: ["C50.9"],
    diagnosis: ["Breast carcinoma"],
    procedures: ["Chemotherapy review"],
    vitals: { temp: 37.2, bp: "118/74", hr: 82 },
    createdAt: "2025-11-20T08:35:00+05:30",
    updatedAt: "2025-11-20T08:48:00+05:30",
    signed: false,
    problemList: ["Cycle 3 Chemo", "Neutropenia (grade 1)"],
    vitalsSummary: "Stable vitals; monitor ANC due to downward trend.",
    attachments: [
      { id: "doc-901", name: "Pet-scan-report.pdf", type: "application/pdf" },
    ],
  },
  {
    id: "enc-10002",
    patientId: "patient-1002",
    doctorId: "doctor-1",
    appointmentId: "appt-8002",
    notes: "Post CABG rehab week 5. Reports mild exertional dyspnea."
      + " Plan cardiopulmonary stress test next week.",
    icdCodes: ["I21"],
    diagnosis: ["NSTEMI (s/p CABG)"],
    procedures: ["Physical examination"],
    vitals: { bp: "126/78", hr: 76, spo2: 97 },
    createdAt: "2025-11-20T09:20:00+05:30",
    updatedAt: "2025-11-20T09:32:00+05:30",
    signed: false,
    problemList: ["Post CABG follow-up", "Exertional dyspnea"],
    vitalsSummary: "Stable hemodynamics, mild dyspnea reported on exertion.",
    attachments: [],
  },
];

const DEFAULT_PRESCRIPTION_ITEMS: PrescriptionItem[] = [
  {
    drugId: "drug-200",
    name: "Ondansetron 4mg",
    dose: "4 mg",
    frequency: "TID",
    route: "Oral",
    duration: "5 days",
    instructions: "Take 30 minutes before meals",
    generic: true,
  },
  {
    drugId: "drug-210",
    name: "Pantoprazole 40mg",
    dose: "40 mg",
    frequency: "OD",
    route: "Oral",
    duration: "14 days",
    instructions: "Morning before breakfast",
    generic: false,
  },
];

export const draftPrescriptions: Prescription[] = [
  {
    id: "rx-7001",
    encounterId: "enc-10001",
    patientId: "patient-1001",
    doctorId: "doctor-1",
    items: DEFAULT_PRESCRIPTION_ITEMS,
    status: "draft",
    createdAt: "2025-11-20T08:52:00+05:30",
  },
];

export const labOrders: LabOrder[] = [
  {
    id: "lab-6001",
    encounterId: "enc-10001",
    patientId: "patient-1001",
    doctorId: "doctor-1",
    tests: [
      { testId: "test-202", name: "Liver Function Panel" },
      { testId: "test-205", name: "Complete Blood Count" },
    ],
    status: "completed",
    priority: "urgent",
    resultIds: ["lab-res-9001", "lab-res-9002"],
    orderedAt: "2025-11-19T18:20:00+05:30",
  },
  {
    id: "lab-6002",
    encounterId: "enc-10002",
    patientId: "patient-1002",
    doctorId: "doctor-1",
    tests: [{ testId: "test-301", name: "NT-proBNP" }],
    status: "ordered",
    priority: "routine",
    resultIds: [],
    orderedAt: "2025-11-20T09:10:00+05:30",
  },
];

export const labResults: LabResult[] = [
  {
    id: "lab-res-9001",
    orderId: "lab-6001",
    testId: "test-202",
    value: 68,
    unit: "IU/L",
    refRange: "10-55",
    flagged: true,
    verified: false,
  },
  {
    id: "lab-res-9002",
    orderId: "lab-6001",
    testId: "test-205",
    value: 2.9,
    unit: "10^9/L",
    refRange: "1.8-7.0",
    flagged: false,
    verified: true,
    verifiedAt: "2025-11-20T07:25:00+05:30",
  },
];

export const labInboxItems: LabInboxItem[] = [
  {
    id: "lab-inbox-01",
    patientName: "Sunita Verma",
    department: "Pathology",
    summary: "LFT shows ALT 68 IU/L (high).",
    critical: true,
    receivedAt: "2025-11-20T07:45:00+05:30",
    orderId: "lab-6001",
  },
  {
    id: "lab-inbox-02",
    patientName: "Rahul Sharma",
    department: "Cardiology",
    summary: "NT-proBNP pending sample collection.",
    critical: false,
    receivedAt: "2025-11-20T09:05:00+05:30",
    orderId: "lab-6002",
  },
];

export const roundingBoard: RoundingCard[] = [
  {
    patientId: "patient-1005",
    name: "Vikram Rao",
    location: "ICU - Bed 05",
    acuity: "Critical",
    lastUpdate: "2025-11-20T07:55:00+05:30",
    tasksDue: ["Ventilator weaning assessment", "Update family at 10:00"],
  },
  {
    patientId: "patient-1003",
    name: "Imran Khan",
    location: "Ward 5 - Bed 12",
    acuity: "Watch",
    lastUpdate: "2025-11-19T20:45:00+05:30",
    tasksDue: ["Post-op physio session", "Review analgesia"],
  },
];
