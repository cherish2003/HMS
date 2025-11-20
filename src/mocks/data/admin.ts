import type { AuditEvent, Department, Hospital, Tariff, TestCatalogEntry, User } from "@/types/core";

export const adminUsers: User[] = [
  {
    id: "user-100",
    name: "Aditi Menon",
    email: "aditi.menon@medstarhospitals.com",
    role: "SUPER_ADMIN",
    hospitalId: "medstar-central",
    avatar: "AM",
    status: "active",
    createdAt: "2023-03-18T09:30:00+05:30",
  },
  {
    id: "user-101",
    name: "Sanjay Rao",
    email: "sanjay.rao@medstarhospitals.com",
    role: "HOSPITAL_ADMIN",
    hospitalId: "medstar-royal",
    avatar: "SR",
    status: "active",
    createdAt: "2024-01-04T10:15:00+05:30",
  },
  {
    id: "user-102",
    name: "Meera Iyer",
    email: "meera.iyer@medstarhospitals.com",
    role: "HOSPITAL_ADMIN",
    hospitalId: "medstar-coastal",
    avatar: "MI",
    status: "invited",
    createdAt: "2025-08-22T14:50:00+05:30",
  },
  {
    id: "user-103",
    name: "Sahil Khanna",
    email: "sahil.khanna@medstarhospitals.com",
    role: "FINANCE",
    hospitalId: "medstar-central",
    avatar: "SK",
    status: "suspended",
    createdAt: "2023-11-02T17:05:00+05:30",
  },
];

export const departments: Department[] = [
  {
    id: "dept-01",
    name: "Cardiac Sciences",
    specialty: "Cardiology",
    head: "Dr. Kavya Desai",
    active: true,
  },
  {
    id: "dept-02",
    name: "Oncology",
    specialty: "Medical Oncology",
    head: "Dr. Mehul Jain",
    active: true,
  },
  {
    id: "dept-03",
    name: "Critical Care",
    specialty: "Intensive Care",
    head: "Dr. Anjali Nair",
    active: true,
  },
  {
    id: "dept-04",
    name: "Physiotherapy",
    specialty: "Rehabilitation",
    head: "Dr. Ajay Purohit",
    active: false,
  },
];

export const testCatalog: TestCatalogEntry[] = [
  {
    id: "test-201",
    code: "CBC01",
    name: "Complete Blood Count",
    departmentId: "dept-02",
    tatHours: 3,
    price: 300,
  },
  {
    id: "test-202",
    code: "LFT02",
    name: "Liver Function Panel",
    departmentId: "dept-02",
    tatHours: 6,
    price: 550,
  },
  {
    id: "test-203",
    code: "XR101",
    name: "X-Ray Chest PA",
    departmentId: "dept-03",
    tatHours: 2,
    price: 850,
  },
  {
    id: "test-204",
    code: "MRI201",
    name: "MRI Brain Contrast",
    departmentId: "dept-01",
    tatHours: 12,
    price: 6200,
  },
];

export const tariffs: Tariff[] = [
  {
    id: "tariff-501",
    code: "CONS01",
    name: "Specialist Consultation",
    category: "Procedure",
    basePrice: 500,
    active: true,
  },
  {
    id: "tariff-502",
    code: "WARDSTD",
    name: "Standard Ward Bed (per day)",
    category: "Room",
    basePrice: 3200,
    active: true,
  },
  {
    id: "tariff-503",
    code: "ICUBED",
    name: "ICU Bed (per day)",
    category: "Room",
    basePrice: 9800,
    active: true,
  },
  {
    id: "tariff-504",
    code: "PHAR001",
    name: "Inpatient Pharmacy Markup",
    category: "Pharmacy",
    basePrice: 12,
    active: false,
  },
];

export const hospitals: Hospital[] = [
  {
    id: "medstar-central",
    name: "Medstar Hospitals - Central Campus",
    location: "Bengaluru, India",
    subscriptionStatus: "active",
    beds: 420,
    admins: ["user-100", "user-103"],
  },
  {
    id: "medstar-royal",
    name: "Medstar Hospitals - Royal Pavilion",
    location: "Hyderabad, India",
    subscriptionStatus: "active",
    beds: 280,
    admins: ["user-101"],
  },
  {
    id: "medstar-coastal",
    name: "Medstar Hospitals - Coastal Care",
    location: "Chennai, India",
    subscriptionStatus: "trial",
    beds: 190,
    admins: ["user-102"],
  },
  {
    id: "medstar-west",
    name: "Medstar Hospitals - Western Hub",
    location: "Mumbai, India",
    subscriptionStatus: "expired",
    beds: 340,
    admins: [],
  },
];

export const billingRules = [
  {
    id: "rule-01",
    name: "Default tax rate",
    value: "12% GST",
    description: "Applies to all OPD invoices unless overridden by payer contract.",
  },
  {
    id: "rule-02",
    name: "Insurance co-pay",
    value: "20% patient responsibility",
    description: "Default co-pay for MediCare plans.",
  },
];

export const paymentGateways = [
  {
    id: "pg-razorpay",
    name: "Razorpay",
    status: "Connected",
    lastSyncedAt: "2025-11-18T22:05:00+05:30",
  },
  {
    id: "pg-stripe",
    name: "Stripe",
    status: "Sandbox",
    lastSyncedAt: "2025-11-15T11:32:00+05:30",
  },
];

export const holidayCalendar = [
  { id: "holiday-01", date: "2025-12-25", name: "Christmas", campuses: ["medstar-central", "medstar-royal"] },
  { id: "holiday-02", date: "2026-01-15", name: "Pongal", campuses: ["medstar-coastal"] },
];

export const auditEvents: AuditEvent[] = [
  {
    id: "audit-9001",
    actorId: "user-100",
    action: "user.created",
    entityType: "user",
    entityId: "user-102",
    timestamp: "2025-10-01T09:02:00+05:30",
    meta: { role: "HOSPITAL_ADMIN" },
  },
  {
    id: "audit-9002",
    actorId: "user-101",
    action: "masterdata.updated",
    entityType: "department",
    entityId: "dept-03",
    timestamp: "2025-11-10T14:45:00+05:30",
    meta: { field: "head", value: "Dr. Anjali Nair" },
  },
  {
    id: "audit-9003",
    actorId: "user-100",
    action: "settings.changed",
    entityType: "billing",
    entityId: "rule-01",
    timestamp: "2025-11-18T18:12:00+05:30",
    meta: { previousValue: "10% GST", newValue: "12% GST" },
  },
];
