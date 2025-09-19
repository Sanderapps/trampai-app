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
  level: 'Júnior' | 'Pleno' | 'Sênior' | 'Especialista';
  salary?: {
    min: number;
    max: number;
  };
  description: string;
  postedAt: Date;
  contact: {
    email: string;
    whatsapp: string;
  };
};
