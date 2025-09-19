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
  company: Company;
  location: string;
  type: 'CLT' | 'PJ' | 'Extra/Freelancer' | 'Estágio';
  salary?: {
    min: number;
    max: number;
  };
  dailyRate?: number;
  description: string;
  postedAt: Date | Timestamp;
  contact?: {
    email: string;
    whatsapp: string;
  };
};
