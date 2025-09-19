import { Company } from './types';
import companiesData from './companies.json';
import { Briefcase } from 'lucide-react';


// Attach logos to company data
export const companies: Company[] = companiesData.map((company, index) => ({
    ...company,
    logo: Briefcase,
}));
