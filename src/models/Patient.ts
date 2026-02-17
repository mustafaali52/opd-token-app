export interface Patient {
  id?: string;
  itsNo: string;
  name: string;
  age: number | string;
  gender: string;
  mohallah: string;
  tokenNumber?: number;
  doctorId?: string | number;
  doctorName?: string;
  date?: Date | string;
}