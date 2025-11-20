import type { UserRole } from "@/store/auth-store";

export type UserStatus = "active" | "invited" | "suspended";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hospitalId: string;
  avatar?: string;
  status: UserStatus;
  createdAt: string;
};

export type PatientProfile = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  insurance?: {
    insurer: string;
    policyNo: string;
  };
  status: "active" | "inactive";
  createdAt: string;
};

export type RolePermission = {
  module: string;
  actions: string[];
};

export type Department = {
  id: string;
  name: string;
  specialty: string;
  head?: string;
  active: boolean;
};

export type TestCatalogEntry = {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  tatHours: number;
  price: number;
};

export type Tariff = {
  id: string;
  code: string;
  name: string;
  category: "Procedure" | "Room" | "Diagnostic" | "Pharmacy";
  basePrice: number;
  active: boolean;
};

export type Hospital = {
  id: string;
  name: string;
  location: string;
  subscriptionStatus: "active" | "trial" | "expired";
  beds: number;
  admins: string[];
};

export type AuditEvent = {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  meta?: Record<string, unknown>;
};

export type AppointmentStatus =
  | "scheduled"
  | "checked-in"
  | "in-progress"
  | "completed"
  | "cancelled";

export type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  startAt: string;
  endAt?: string;
  status: AppointmentStatus;
  room?: string;
  visitType: "OPD" | "IPD" | "Telehealth";
  reason: string;
};

export type VitalSigns = {
  temp?: number;
  bp?: string;
  hr?: number;
  rr?: number;
  spo2?: number;
};

export type Encounter = {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  notes: string;
  icdCodes: string[];
  diagnosis: string[];
  procedures?: string[];
  vitals?: VitalSigns;
  createdAt: string;
  updatedAt: string;
  signed: boolean;
};

export type PrescriptionItem = {
  drugId: string;
  name: string;
  dose: string;
  frequency: string;
  route: string;
  duration: string;
  instructions?: string;
  generic: boolean;
};

export type PrescriptionStatus = "draft" | "prescribed" | "dispensed";

export type Prescription = {
  id: string;
  encounterId: string;
  patientId: string;
  doctorId: string;
  items: PrescriptionItem[];
  status: PrescriptionStatus;
  createdAt: string;
};

export type LabOrderStatus = "ordered" | "collected" | "completed";

export type LabOrder = {
  id: string;
  encounterId?: string;
  patientId: string;
  doctorId: string;
  tests: Array<{ testId: string; name: string }>;
  status: LabOrderStatus;
  priority: "routine" | "urgent" | "stat";
  resultIds: string[];
  orderedAt: string;
};

export type LabResult = {
  id: string;
  orderId: string;
  testId: string;
  value?: number | string;
  unit?: string;
  refRange?: string;
  flagged?: boolean;
  verified?: boolean;
  verifiedAt?: string;
};

export type RadiologyReport = {
  id: string;
  orderId: string;
  modality: string;
  findings: string;
  impression: string;
  fileUrl?: string;
  createdAt: string;
  verifiedAt?: string;
};

export type InvoiceStatus = "unpaid" | "paid" | "refunded" | "pending";

export type InvoiceLine = {
  desc: string;
  code?: string;
  qty: number;
  unitPrice: number;
  amount: number;
};

export type Invoice = {
  id: string;
  patientId: string;
  encounterId?: string;
  lines: InvoiceLine[];
  subtotal: number;
  discounts: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  createdAt: string;
};

export type PaymentStatus = "initiated" | "succeeded" | "failed";

export type Payment = {
  id: string;
  invoiceId: string;
  amount: number;
  method: "UPI" | "Card" | "Cash" | "Insurance";
  paymentRef: string;
  status: PaymentStatus;
  createdAt: string;
};

export type ClaimStatus = "pending" | "submitted" | "approved" | "denied";

export type Claim = {
  id: string;
  invoiceId: string;
  insurer: string;
  policyNo: string;
  status: ClaimStatus;
  submittedAt: string;
  adjudicatedAt?: string;
  amountApproved?: number;
};

export type Medication = {
  id: string;
  name: string;
  brand: string;
  generic: string;
  formulation: string;
  packSize: string;
  stockQty: number;
  reorderLevel: number;
};

export type DispenseRecord = {
  id: string;
  prescriptionId: string;
  items: Array<{ drugId: string; qty: number }>;
  dispensedBy: string;
  dispensedAt: string;
  notes?: string;
};

export type InventoryTransaction = {
  id: string;
  medicationId: string;
  type: "adjustment" | "reorder" | "return";
  qty: number;
  reason: string;
  createdAt: string;
};

export type NurseTaskPriority = "critical" | "high" | "medium" | "low";

export type NurseTaskStatus = "pending" | "in-progress" | "done" | "snoozed";

export type NurseTask = {
  id: string;
  title: string;
  patientId: string;
  type: string;
  priority: NurseTaskPriority;
  status: NurseTaskStatus;
  assignedTo: string;
  dueAt: string;
  createdBy: string;
};

export type VitalsEntry = {
  id: string;
  patientId: string;
  takenBy: string;
  timestamp: string;
  temp?: number;
  bp?: string;
  hr?: number;
  rr?: number;
  spo2?: number;
};

export type MARStatus = "scheduled" | "given" | "missed" | "delayed";

export type MARItem = {
  id: string;
  patientId: string;
  prescriptionId: string;
  medication: string;
  scheduledAt: string;
  status: MARStatus;
  givenAt?: string;
  givenBy?: string;
  notes?: string;
};

export type FrontDeskQueueStatus = "waiting" | "checked-in" | "with-doctor" | "completed";

export type FrontDeskQueueEntry = {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  specialty: string;
  status: FrontDeskQueueStatus;
  estimatedWait: number;
  position: number;
  notes?: string;
};

export type SupportRequestStatus = "open" | "responded" | "closed";

export type SupportRequest = {
  id: string;
  patientId: string;
  subject: string;
  message: string;
  status: SupportRequestStatus;
  createdAt: string;
  respondedAt?: string;
};

export type PatientOverview = {
  id: string;
  name: string;
  mrn: string;
  age: number;
  gender: "M" | "F" | "O";
  primaryDoctor: string;
  allergies: string[];
  activeProblems: string[];
};

export type PatientDocument = {
  id: string;
  patientId: string;
  category: "lab" | "discharge" | "document";
  title: string;
  createdAt: string;
  url?: string;
};
