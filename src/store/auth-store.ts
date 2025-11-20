import { create } from "zustand";

export type UserRole =
  | "SUPER_ADMIN"
  | "HOSPITAL_ADMIN"
  | "DOCTOR"
  | "NURSE"
  | "FINANCE"
  | "LAB"
  | "PHARMACY"
  | "FRONT_DESK"
  | "PATIENT";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
};

export type DemoHospital = {
  id: string;
  name: string;
  location: string;
};

const DEMO_USERS: DemoUser[] = [
  {
    id: "super-admin-1",
    name: "Aditi Menon",
    email: "aditi.menon@medstarhospitals.com",
    role: "SUPER_ADMIN",
    initials: "AM",
  },
  {
    id: "hospital-admin-1",
    name: "Sanjay Rao",
    email: "sanjay.rao@medstarhospitals.com",
    role: "HOSPITAL_ADMIN",
    initials: "SR",
  },
  {
    id: "doctor-1",
    name: "Dr. Kavya Desai",
    email: "kavya.desai@medstarhospitals.com",
    role: "DOCTOR",
    initials: "KD",
  },
  {
    id: "nurse-1",
    name: "Nisha Thomas",
    email: "nisha.thomas@medstarhospitals.com",
    role: "NURSE",
    initials: "NT",
  },
  {
    id: "finance-1",
    name: "Rahul Kapur",
    email: "rahul.kapur@medstarhospitals.com",
    role: "FINANCE",
    initials: "RK",
  },
  {
    id: "lab-1",
    name: "Sameera Iyer",
    email: "sameera.iyer@medstarhospitals.com",
    role: "LAB",
    initials: "SI",
  },
  {
    id: "pharmacy-1",
    name: "Vivek Narayan",
    email: "vivek.narayan@medstarhospitals.com",
    role: "PHARMACY",
    initials: "VN",
  },
  {
    id: "frontdesk-1",
    name: "Deepak Kulkarni",
    email: "deepak.kulkarni@medstarhospitals.com",
    role: "FRONT_DESK",
    initials: "DK",
  },
  {
    id: "patient-1",
    name: "Anjali Patil",
    email: "anjali.patil@medstarcare.com",
    role: "PATIENT",
    initials: "AP",
  },
];

const DEMO_HOSPITALS: DemoHospital[] = [
  {
    id: "medstar-central",
    name: "Medstar Hospitals - Central Campus",
    location: "Tadepalli, Vijayawada",
  },
  {
    id: "medstar-royal",
    name: "Medstar Hospitals - Royal Pavilion",
    location: "Tadepalli, Vijayawada",
  },
  {
    id: "medstar-coastal",
    name: "Medstar Hospitals - Coastal Care",
    location: "Tadepalli, Vijayawada",
  },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  HOSPITAL_ADMIN: "Hospital Admin",
  DOCTOR: "Doctor",
  NURSE: "Nurse / Ward",
  FINANCE: "Billing / Finance",
  LAB: "Lab / Radiology",
  PHARMACY: "Pharmacy",
  FRONT_DESK: "Front Desk",
  PATIENT: "Patient Portal",
};

export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  SUPER_ADMIN: "/dashboard",
  HOSPITAL_ADMIN: "/dashboard",
  DOCTOR: "/dashboard/doctor",
  NURSE: "/dashboard/nurse",
  FINANCE: "/billing",
  LAB: "/lab",
  PHARMACY: "/pharmacy",
  FRONT_DESK: "/appointments",
  PATIENT: "/dashboard/patient",
};

type AuthState = {
  user: DemoUser | null;
  isAuthenticated: boolean;
  selectedHospital: DemoHospital;
  hospitals: DemoHospital[];
  login: (userId: string, hospitalId: string) => DemoUser | null;
  logout: () => void;
  switchHospital: (hospitalId: string) => void;
};

const defaultHospital = DEMO_HOSPITALS[0];

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  selectedHospital: defaultHospital,
  hospitals: DEMO_HOSPITALS,
  login: (userId, hospitalId) => {
    const user = DEMO_USERS.find((candidate) => candidate.id === userId) ?? null;
    const hospital =
      DEMO_HOSPITALS.find((candidate) => candidate.id === hospitalId) ??
      defaultHospital;

    set({
      user,
      isAuthenticated: Boolean(user),
      selectedHospital: hospital,
    });

    return user;
  },
  logout: () => {
    set({ user: null, isAuthenticated: false, selectedHospital: defaultHospital });
  },
  switchHospital: (hospitalId) => {
    set((state) => {
      const hospital =
        state.hospitals.find((candidate) => candidate.id === hospitalId) ??
        state.selectedHospital;
      return { ...state, selectedHospital: hospital };
    });
  },
}));

export const demoUsers = DEMO_USERS;
export const demoHospitals = DEMO_HOSPITALS;

export function getDefaultRouteByRole(role: UserRole) {
  return ROLE_DEFAULT_ROUTES[role] ?? "/dashboard";
}
