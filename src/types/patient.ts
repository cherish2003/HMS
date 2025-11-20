export type PatientStatus = "IP" | "OP" | "Discharged";

export type PatientEncounterSummary = {
  id: string;
  admittedOn: string;
  attendingPhysician: string;
  department: string;
  primaryDiagnosis: string;
  lastUpdated: string;
};

export type PatientBillingSummary = {
  outstandingAmount: number;
  lastInvoiceId: string;
  coverageType: "Insurance" | "Self" | "Split";
};

export type Patient = {
  id: string;
  mrn: string;
  name: string;
  avatarInitials: string;
  age: number;
  sex: "M" | "F" | "O";
  phone: string;
  email?: string;
  location: string;
  lastVisit: string;
  primaryDoctor: string;
  status: PatientStatus;
  tags: string[];
  alerts: string[];
  encounter: PatientEncounterSummary;
  billing: PatientBillingSummary;
};
