

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
  education?: string; // Will store the JSON string of education
  summary?: string;
  photoURL?: string;
  birthDate?: string;
  isFirstJob?: boolean;
}

// Schema for the AI candidate ranking flow
const CandidateProfileForRankingSchema = z.object({
  id: z.string().describe('The unique identifier for the candidate.'),
  name: z.string().describe('The full name of the candidate.'),
  summary: z.string().describe('A professional summary of the candidate.'),
  experience: z.string().describe("A summary of the candidate's work experience."),
  education: z.string().describe("A summary of the candidate's education."),
});

export const RankCandidatesInputSchema = z.object({
  jobDescription: z.string().describe('The full description of the job opening.'),
  candidateProfiles: z.array(CandidateProfileForRankingSchema).describe('An array of candidate profiles to be ranked.'),
});
export type RankCandidatesInput = z.infer<typeof RankCandidatesInputSchema>;


export const RankedCandidateSchema = z.object({
  id: z.string().describe("The candidate's unique identifier."),
  name: z.string().describe("The candidate's name."),
  score: z.number().describe('A score from 0 to 10 indicating the match quality.'),
  justification: z.string().describe('A brief justification for the assigned score.'),
});
export type RankedCandidate = z.infer<typeof RankedCandidateSchema>;


export const RankCandidatesOutputSchema = z.object({
  rankedCandidates: z.array(RankedCandidateSchema).describe('An array of candidates, sorted by score in descending order.'),
});
export type RankCandidatesOutput = z.infer<typeof RankCandidatesOutputSchema>;
    
