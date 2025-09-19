import { Company } from './types';
import companiesData from './companies.json';
import placeholderData from './placeholder-images.json';

const getCompanyLogo = (seed: number) => {
    const logo = placeholderData.placeholderImages.find(img => img.imageUrl.includes(`seed/logo${seed}`));
    return {
        url: logo?.imageUrl ?? `https://picsum.photos/seed/logo${seed}/100/100`,
        hint: logo?.imageHint ?? 'abstract logo'
    };
}

// Attach logos to company data
export const companies: Company[] = companiesData.map((company, index) => ({
    ...company,
    logo: getCompanyLogo(index + 1).url,
    logoHint: getCompanyLogo(index + 1).hint,
}));
