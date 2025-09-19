
import type { Timestamp } from "firebase/firestore";
import type { LucideIcon } from "lucide-react";

export type Company = {
  id: string;
  name: string;
  logo: LucideIcon;
};

export type Job = {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  location: string;
  type: 'CLT' | 'PJ' | 'Extra/Freelancer' | 'Estágio';
  status: 'Aberta' | 'Fechada';
  salary?: {
    min?: number;
    max?: number;
  };
  dailyRate?: number;
  description: string;
  postedAt: Timestamp; // Simplified to always be a Firestore Timestamp
  employerId: string;
  keywords?: string[];
  benefits?: {
    hasCommission: boolean;
    hasVT: boolean;
    hasVR: boolean;
    hasVA: boolean;
    hasHealthPlan: boolean;
    others?: string[];
  };
};

export type Application = {
    id: string;
    jobId: string;
    jobTitle: string;
    companyName: string;
    candidateId: string;
    candidateName: string;
    candidateEmail: string;
    candidatePhone?: string;
    candidateSocialUrl?: string;
    candidatePhotoUrl?: string | null;
    resumeFile?: {
      name: string;
      type: string;
      data: string; // Base64 encoded file
    }
    coverLetter?: string;
    appliedAt: Timestamp;
    status: 'Em Análise' | 'Visualizado' | 'Rejeitado' | 'Contratado' | 'Vaga Preenchida';
}

export type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  accountType: 'candidate' | 'employer';
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  experience?: string;
  skills?: string;
  education?: string;
  resumeText?: string;
  photoURL?: string;
}

    