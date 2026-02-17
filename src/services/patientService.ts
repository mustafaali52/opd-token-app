import type { Patient } from "../models/Patient";
import { dbService } from "./dbService";

export async function fetchPatients(): Promise<Patient[]> {
  try {
    const patients = await dbService.getPatients();
    return patients;
  } catch (error) {
    console.error("Error fetching patients:", error);
    return [];
  }
}

export async function searchPatientsByITS(itsNo: string): Promise<Patient[]> {
  try {
    const patients = await dbService.getPatientByItsNo(itsNo);
    return patients;
  } catch (error) {
    console.error("Error searching patients:", error);
    return [];
  }
}

export async function addPatient(patient: Omit<Patient, "id">): Promise<string> {
  try {
    const patientId = await dbService.addPatient(patient);
    return patientId;
  } catch (error) {
    console.error("Error adding patient:", error);
    throw error;
  }
}
