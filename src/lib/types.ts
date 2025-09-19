
import type { Timestamp } from "firebase/firestore";
import type { LucideIcon } from "lucide-react";
import { z } from "zod";

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

// Defines a single message in the conversation history for the conversational resume AI
export const ConversationMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ConversationMessage = z.infer<typeof ConversationMessageSchema>;

// Defines the data structure for the user's profile being built by the conversational AI
export const ProfileDataSchema = z.object({
  name: z.string().optional().describe("The candidate's full name."),
  address: z.string().optional().describe("The candidate's city and state (e.g., 'Porto Alegre, RS')."),
  phone: z.string().optional().describe("The candidate's phone number."),
  experiences: z.array(z.string()).optional().describe("A list of the candidate's work experiences."),
  education: z.array(z.string()).optional().describe("A list of the candidate's educational background."),
  skills: z.array(z.string()).optional().describe("A list of the candidate's skills."),
  summary: z.string().optional().describe("A brief summary about the candidate."),
});
export type ProfileData = z.infer<typeof ProfileDataSchema>;

    
