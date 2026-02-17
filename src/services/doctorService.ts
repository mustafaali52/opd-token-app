import type { Doctor } from "../models/Doctor";
import { dbService } from "./dbService";

export async function fetchDoctor(): Promise<Doctor[]> {
  try {
    // Fetch doctors from database
    const doctorsFromDB = await dbService.getDoctors();
    return doctorsFromDB;
  } catch (error) {
    console.error("Error fetching doctors from database:", error);
    // Return empty array on error
    return [];
  }
}

export async function addDoctor(doctor: Omit<Doctor, "id">): Promise<string> {
  try {
    const doctorId = await dbService.addDoctor(doctor);
    return doctorId;
  } catch (error) {
    console.error("Error adding doctor:", error);
    throw error;
  }
}