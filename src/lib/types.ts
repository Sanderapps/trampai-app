import { Timestamp } from "firebase/firestore";

export type Company = {
  id: string;
  name: string;
  logo: string;
  logoHint: string;
};

export type Job = {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  location: string;
  type: 'CLT' | 'PJ' | 'Extra/Freelancer' | 'Estágio';
  salary?: {
    min: number;
    max: number;
  };
  dailyRate?: number;
  description: string;
  postedAt: Date | Timestamp | { seconds: number, nanoseconds: number };
  employerId: string;
  contact?: {
    email: string;
    whatsapp: string;
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
    resumeFile?: {
      name: string;
      type: string;
      data: string; // Base64 encoded file
    }
    coverLetter?: string;
    appliedAt: Timestamp;
    status: 'Em Análise' | 'Visualizado' | 'Rejeitado';
}
