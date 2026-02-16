import type { Doctor } from "../models/Doctor";

const API_URL = "";

// Fixed sample Doctor data
const Doctors : Doctor[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    phone: "+1-555-0101",
    specialization: "Cardiology"
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    phone: "+1-555-0102",
    specialization: "Pediatrics"
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    phone: "+1-555-0103",
    specialization: "Orthopedics"
  },
  {
    id: 4,
    name: "Dr. James Williams",
    phone: "+1-555-0104",
    specialization: "Dermatology"
  }
];

export async function fetchDoctor(): Promise<Doctor[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch doctors");
  }

  return Doctors;
}