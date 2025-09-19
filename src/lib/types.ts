
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
  experience?: string; // Will store the JSON string of experiences
  skills?: string;
  education?: string; // Will store the JSON string of education
  resumeText?: string;
  photoURL?: string;
  summary?: string;
  birthDate?: string;
}

// Defines a single message in the conversation history for the conversational resume AI
export const ConversationMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ConversationMessage = z.infer<typeof ConversationMessageSchema>;


// Zod schemas for structured data
export const ExperienceSchema = z.object({
    role: z.string().min(1, "Cargo é obrigatório").describe("The job title or role."),
    company: z.string().min(1, "Empresa é obrigatória").describe("The name of the company."),
    startDate: z.string().optional().describe("The start date of the employment (e.g., 'MM/AAAA')."),
    endDate: z.string().optional().describe("The end date of the employment (e.g., 'MM/AAAA' or 'Atual')."),
});
export type Experience = z.infer<typeof ExperienceSchema>;

export const EducationSchema = z.object({
    course: z.string().min(1, "Curso é obrigatório").describe("The name of the course or degree."),
    institution: z.string().min(1, "Instituição é obrigatória").describe("The name of the educational institution."),
    endDate: z.string().optional().describe("The end date or year of conclusion."),
});
export type Education = z.infer<typeof EducationSchema>;


// Defines the data structure for the user's profile being built by the conversational AI
export const ProfileDataSchema = z.object({
  name: z.string().optional().describe("The candidate's full name."),
  location: z.string().optional().describe("The candidate's city and state (e.g., 'Porto Alegre, RS')."),
  phone: z.string().optional().describe("The candidate's phone number."),
  experiences: z.array(ExperienceSchema).optional().describe("A list of the candidate's work experiences."),
  education: z.array(EducationSchema).optional().describe("A list of the candidate's educational background."),
  skills: z.array(z.string()).optional().describe("A list of the candidate's skills, separated by commas."),
  summary: z.string().optional().describe("A brief summary about the candidate."),
});
export type ProfileData = z.infer<typeof ProfileDataSchema>;


// Defines the input for the main flow, which is the conversation history
export const ConversationalResumeInputSchema = z.object({
  history: z.array(ConversationMessageSchema),
});
export type ConversationalResumeInput = z.infer<typeof ConversationalResumeInputSchema>;

// Defines the output of the main flow
export const ConversationalResumeOutputSchema = z.object({
    nextQuestion: z.string().describe("The next question for the AI to ask the user, or a final summary message."),
    isFinished: z.boolean().describe("A flag indicating if the conversation is complete and the profile is built."),
    profile: ProfileDataSchema.describe("The structured profile data collected so far."),
});
export type ConversationalResumeOutput = z.infer<typeof ConversationalResumeOutputSchema>;

    

      