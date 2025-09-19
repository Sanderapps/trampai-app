import { Company } from './types';
import companiesData from './companies.json';
import { Briefcase, Server, ShoppingBasket, Soup, GitBranch, Warehouse } from 'lucide-react';

const icons = [
    GitBranch,
    Server,
    Warehouse,
    Briefcase,
    Soup,
    ShoppingBasket,
];

// Attach logos to company data
export const companies: Company[] = companiesData.map((company, index) => ({
    ...company,
    logo: icons[index] || Briefcase,
}));
