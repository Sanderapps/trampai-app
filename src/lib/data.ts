import { Company } from './types';
import companiesData from './companies.json';
import { Building2 } from 'lucide-react';


// Attach logos to company data
export const companies: Company[] = companiesData.map((company, index) => ({
    ...company,
    logo: Building2,
}));
