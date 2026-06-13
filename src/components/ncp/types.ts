import { 
  User, 
  Hospital, 
  Stethoscope, 
  Users, 
  Heart, 
  Home 
} from "lucide-react";

export interface FamilyMember {
  name: string;
  age: string;
  gender: string;
  relation: string;
  occupation: string;
  healthStatus: string;
}

export interface NCPFormData {
  // Patient Info
  patientName: string;
  age: string;
  gender: string;
  maritalStatus: string;
  occupation: string;
  education: string;
  religion: string;
  address: string;

  // Hospital Info
  hospitalName: string;
  ward: string;
  bedNumber: string;
  admissionDate: string;
  medicalDiagnosis: string;
  surgicalDiagnosis: string;

  // Clinical Info
  chiefComplaints: string;
  presentIllness: string;
  pastMedicalHistory: string;
  pastSurgicalHistory: string;
  currentSymptoms: string;
  investigations: string;
  medications: string;

  // Family Info
  familyMembersCount: string;
  familyStructure: string;
  familyMembers: FamilyMember[];

  // Personal History
  diet: string;
  sleepPattern: string;
  eliminationPattern: string;
  addictions: string;
  exercise: string;
  hygiene: string;

  // Socioeconomic
  income: string;
  housing: string;
  waterSupply: string;
  sanitation: string;
  ventilation: string;
}

export const initialFormData: NCPFormData = {
  patientName: "", age: "", gender: "", maritalStatus: "", occupation: "", education: "", religion: "", address: "",
  hospitalName: "", ward: "", bedNumber: "", admissionDate: "", medicalDiagnosis: "", surgicalDiagnosis: "",
  chiefComplaints: "", presentIllness: "", pastMedicalHistory: "", pastSurgicalHistory: "", currentSymptoms: "", investigations: "", medications: "",
  familyMembersCount: "", familyStructure: "", familyMembers: [],
  diet: "", sleepPattern: "", eliminationPattern: "", addictions: "", exercise: "", hygiene: "",
  income: "", housing: "", waterSupply: "", sanitation: "", ventilation: ""
};

export const STEPS: { id: number; label: string; icon: any }[] = [
  { id: 1, label: "Identity", icon: User },
  { id: 2, label: "Clinical", icon: Stethoscope },
  { id: 3, label: "Family", icon: Users },
  { id: 4, label: "Life", icon: Heart },
  { id: 5, label: "Socio", icon: Home },
];
