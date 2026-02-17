import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { Doctor } from "../models/Doctor";
import type { Patient } from "../models/Patient";

/**
 * Database Service for Firebase Firestore operations
 */
class DBService {
  // Collection names
  private readonly COLLECTIONS = {
    DOCTORS: "doctors",
    PATIENTS: "patients",
    TOKENS: "tokens"
  };

  /**
   * Add a new doctor to the database
   */
  async addDoctor(doctor: Omit<Doctor, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTIONS.DOCTORS), {
        ...doctor,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding doctor:", error);
      throw error;
    }
  }

  /**
   * Get all doctors from the database
   */
  async getDoctors(): Promise<Doctor[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.COLLECTIONS.DOCTORS));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Doctor));
    } catch (error) {
      console.error("Error fetching doctors:", error);
      throw error;
    }
  }

  /**
   * Get a specific doctor by ID
   */
  async getDoctor(doctorId: string): Promise<Doctor | null> {
    try {
      const docRef = doc(db, this.COLLECTIONS.DOCTORS, doctorId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Doctor;
      }
      return null;
    } catch (error) {
      console.error("Error fetching doctor:", error);
      throw error;
    }
  }

  /**
   * Update a doctor's information
   */
  async updateDoctor(doctorId: string, data: Partial<Doctor>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTIONS.DOCTORS, doctorId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Error updating doctor:", error);
      throw error;
    }
  }

  /**
   * Delete a doctor from the database
   */
  async deleteDoctor(doctorId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTIONS.DOCTORS, doctorId));
    } catch (error) {
      console.error("Error deleting doctor:", error);
      throw error;
    }
  }

  /**
   * Add a new patient to the database
   */
  async addPatient(patient: Omit<Patient, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTIONS.PATIENTS), {
        ...patient,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding patient:", error);
      throw error;
    }
  }

  /**
   * Get all patients from the database
   */
  async getPatients(): Promise<Patient[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, this.COLLECTIONS.PATIENTS), orderBy("createdAt", "desc"))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Patient));
    } catch (error) {
      console.error("Error fetching patients:", error);
      throw error;
    }
  }

  /**
   * Search patients by ITS number
   */
  async getPatientByItsNo(itsNo: string): Promise<Patient[]> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.PATIENTS),
        where("itsNo", "==", itsNo),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Patient));
    } catch (error) {
      console.error("Error fetching patient by ITS number:", error);
      throw error;
    }
  }

  /**
   * Add a new token record
   */
  async addToken(tokenData: {
    doctorId: string | number;
    patientId: string;
    tokenNumber: number;
    doctorName: string;
    patientName: string;
    patientData: any;
    date: Date;
  }): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTIONS.TOKENS), {
        ...tokenData,
        date: Timestamp.fromDate(tokenData.date),
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding token:", error);
      throw error;
    }
  }

  /**
   * Get all tokens for a specific doctor
   */
  async getTokensByDoctor(doctorId: string | number, date?: Date): Promise<any[]> {
    try {
      const constraints: QueryConstraint[] = [
        where("doctorId", "==", doctorId)
      ];

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        constraints.push(
          where("date", ">=", Timestamp.fromDate(startOfDay)),
          where("date", "<=", Timestamp.fromDate(endOfDay))
        );
      }

      const q = query(collection(db, this.COLLECTIONS.TOKENS), ...constraints);
      const querySnapshot = await getDocs(q);
      
      const tokens = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      // Sort by token number descending in memory
      return tokens.sort((a, b) => (b.tokenNumber || 0) - (a.tokenNumber || 0));
    } catch (error) {
      console.error("Error fetching tokens:", error);
      throw error;
    }
  }

  /**
   * Get the last token number for a specific doctor on a specific date
   */
  async getLastTokenNumber(doctorId: string | number, date: Date = new Date()): Promise<number> {
    try {
      const tokens = await this.getTokensByDoctor(doctorId, date);
      if (tokens.length > 0) {
        return tokens[0].tokenNumber;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching last token number:", error);
      return 0;
    }
  }

  /**
   * Generic query method for custom queries
   */
  async queryCollection<T>(
    collectionName: string,
    constraints: QueryConstraint[]
  ): Promise<T[]> {
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
    } catch (error) {
      console.error("Error querying collection:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const dbService = new DBService();
export default dbService;
