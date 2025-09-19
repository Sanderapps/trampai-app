import { Company } from './types';
import placeholderData from './placeholder-images.json';

const getCompanyLogo = (seed: number) => {
    const logo = placeholderData.placeholderImages.find(img => img.imageUrl.includes(`seed/logo${seed}`));
    return {
        url: logo?.imageUrl ?? `https://picsum.photos/seed/logo${seed}/100/100`,
        hint: logo?.imageHint ?? 'abstract logo'
    };
}

export const companies: Company[] = [
  { id: '1', name: 'InovaTech RS', logo: getCompanyLogo(1).url, logoHint: getCompanyLogo(1).hint },
  { id: '2', name: 'GauchaDev', logo: getCompanyLogo(2).url, logoHint: getCompanyLogo(2).hint },
  { id: '3', name: 'Sulware', logo: getCompanyLogo(3).url, logoHint: getCompanyLogo(3).hint },
  { id: '4', name: 'PampaSoft', logo: getCompanyLogo(4).url, logoHint: getCompanyLogo(4).hint },
  { id: '5', name: 'Restaurante Chimarrão', logo: getCompanyLogo(5).url, logoHint: getCompanyLogo(5).hint },
  { id: '6', name: 'Varejo Tri', logo: getCompanyLogo(6).url, logoHint: getCompanyLogo(6).hint },
];

// This file is now for mock company data.
// Job data is fetched from Firestore.
