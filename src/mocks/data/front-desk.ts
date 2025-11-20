import type { Appointment, FrontDeskQueueEntry, PatientProfile, Payment } from "@/types/core";

const BASE_DAY = "2025-11-20";

export const walkInLeads: PatientProfile[] = [
  {
    id: "patient-1100",
    name: "Sahana Rao",
    email: "sahana.rao@example.com",
    status: "active",
    createdAt: `${BASE_DAY}T08:15:00+05:30`,
  },
];

export const todayAppointments: Appointment[] = [
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
    id: "APT-3002",
    patientId: "patient-1004",
    doctorId: "doctor-2",
    startAt: `${BASE_DAY}T11:15:00+05:30`,
    endAt: `${BASE_DAY}T11:40:00+05:30`,
    status: "checked-in",
    visitType: "OPD",
    reason: "Cardio review",
  },
  {
    id: "APT-3003",
    patientId: "patient-1010",
    doctorId: "doctor-3",
    startAt: `${BASE_DAY}T12:20:00+05:30`,
    status: "scheduled",
    visitType: "Telehealth",
    reason: "Diabetes counseling",
  },
];

export const queueEntries: FrontDeskQueueEntry[] = [
  {
    id: "QUEUE-100",
    appointmentId: "APT-3001",
    patientId: "patient-1001",
    doctorId: "doctor-1",
    specialty: "Medical Oncology",
    status: "waiting",
    estimatedWait: 12,
    position: 1,
    notes: "Labs ready and uploaded",
  },
  {
    id: "QUEUE-101",
    appointmentId: "APT-3002",
    patientId: "patient-1004",
    doctorId: "doctor-2",
    specialty: "Cardiology",
    status: "checked-in",
    estimatedWait: 0,
    position: 0,
    notes: "Vitals recorded",
  },
  {
    id: "QUEUE-102",
    appointmentId: "APT-3003",
    patientId: "patient-1010",
    doctorId: "doctor-3",
    specialty: "Endocrinology",
    status: "waiting",
    estimatedWait: 25,
    position: 3,
  },
];

export const bookingPayments: Payment[] = [
  {
    id: "BK-2001",
    invoiceId: "INV-BOOK-3001",
    amount: 200,
    method: "UPI",
    paymentRef: "BNK-UPI-2121",
    status: "succeeded",
    createdAt: `${BASE_DAY}T09:05:00+05:30`,
  },
  {
    id: "BK-2002",
    invoiceId: "INV-BOOK-3002",
    amount: 150,
    method: "Cash",
    paymentRef: "FD-RECEIPT-112",
    status: "succeeded",
    createdAt: `${BASE_DAY}T09:40:00+05:30`,
  },
];

export const dischargeHandovers = [
  {
    patientId: "patient-1009",
    summary: "IPD discharge initiated at 16:10. Awaiting billing clearance and pharmacy meds.",
    assignedTo: "frontdesk-1",
    dueAt: `${BASE_DAY}T17:30:00+05:30`,
  },
];

export const receptionPrompt = {
  topic: "Registration script",
  prompt:
    "Provide a friendly intake script for a new oncology walk-in, including insurance capture reminders and privacy consent notes.",
  output:
    "Welcome to Medstar Hospitals. I'll verify your basic details and insurance information to get you started. Do you have your policy number handy? We also capture consent so we can share updates with your care team. This takes about two minutes.",
  disclaimer: "Informational draft—front desk team must confirm details before sharing with patient.",
};
