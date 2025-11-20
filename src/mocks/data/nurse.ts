import type { MARItem, NurseTask, VitalsEntry } from "@/types/core";

const BASE_DAY = "2025-11-20";

export const nurseTasks: NurseTask[] = [
  {
    id: "TASK-8901",
    title: "Check vitals - ICU Bed 05",
    patientId: "patient-icu-05",
    type: "Vitals",
    priority: "critical",
    status: "pending",
    assignedTo: "nurse-1",
    dueAt: `${BASE_DAY}T18:30:00+05:30`,
    createdBy: "doctor-1",
  },
  {
    id: "TASK-8902",
    title: "Prep infusion - Oncology Bay 3",
    patientId: "patient-onc-03",
    type: "Medication",
    priority: "high",
    status: "in-progress",
    assignedTo: "nurse-2",
    dueAt: `${BASE_DAY}T19:00:00+05:30`,
    createdBy: "doctor-2",
  },
  {
    id: "TASK-8903",
    title: "Turn patient - Ward B Bed 12",
    patientId: "patient-ward-12",
    type: "Care Plan",
    priority: "medium",
    status: "pending",
    assignedTo: "nurse-1",
    dueAt: `${BASE_DAY}T20:15:00+05:30`,
    createdBy: "nurse-lead-1",
  },
  {
    id: "TASK-8904",
    title: "Prep discharge teaching - Bed 08",
    patientId: "patient-ward-08",
    type: "Discharge",
    priority: "low",
    status: "snoozed",
    assignedTo: "nurse-3",
    dueAt: `${BASE_DAY}T22:00:00+05:30`,
    createdBy: "doctor-3",
  },
];

export const vitalsLog: VitalsEntry[] = [
  {
    id: "VITAL-001",
    patientId: "patient-icu-05",
    takenBy: "nurse-1",
    timestamp: `${BASE_DAY}T16:05:00+05:30`,
    temp: 37.8,
    bp: "110/72",
    hr: 102,
    rr: 20,
    spo2: 95,
  },
  {
    id: "VITAL-002",
    patientId: "patient-icu-05",
    takenBy: "nurse-1",
    timestamp: `${BASE_DAY}T12:00:00+05:30`,
    temp: 37.2,
    bp: "112/70",
    hr: 98,
    rr: 22,
    spo2: 96,
  },
  {
    id: "VITAL-003",
    patientId: "patient-onc-03",
    takenBy: "nurse-2",
    timestamp: `${BASE_DAY}T15:30:00+05:30`,
    temp: 36.8,
    bp: "118/76",
    hr: 88,
    rr: 18,
    spo2: 99,
  },
];

export const marSchedule: MARItem[] = [
  {
    id: "MAR-500",
    patientId: "patient-icu-05",
    prescriptionId: "RX-902",
    medication: "Piperacillin-Tazobactam 4.5g IV",
    scheduledAt: `${BASE_DAY}T18:00:00+05:30`,
    status: "scheduled",
  },
  {
    id: "MAR-501",
    patientId: "patient-icu-05",
    prescriptionId: "RX-905",
    medication: "Noradrenaline infusion 4mg",
    scheduledAt: `${BASE_DAY}T17:45:00+05:30`,
    status: "given",
    givenAt: `${BASE_DAY}T17:50:00+05:30`,
    givenBy: "nurse-1",
    notes: "Titrated to MAP > 65",
  },
  {
    id: "MAR-502",
    patientId: "patient-onc-03",
    prescriptionId: "RX-933",
    medication: "Ondansetron 4mg PO",
    scheduledAt: `${BASE_DAY}T20:00:00+05:30`,
    status: "delayed",
    notes: "Awaiting patient intake",
  },
];

export const handoverNotes = {
  shift: "Evening",
  preparedAt: `${BASE_DAY}T18:45:00+05:30`,
  pendingTasks: [
    "Collect ABG sample for ICU Bed 05",
    "Follow up with pharmacy for chemo pre-meds",
  ],
  criticalAlerts: [
    "Patient ICU-05 on vasopressor support; target MAP > 65",
    "Ward B Bed 12 pressure injury risk high",
  ],
  aiDraft:
    "ICU-05 remains hemodynamically labile, Norad infusion running at 6 ml/h. Pending ABG at 19:00. Oncology Bay 3 chemo pre-meds delayed; coordinate with pharmacy. Ward B Bed 12 requires two-hourly repositioning, last done at 17:30.",
};
