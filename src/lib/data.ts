import { Job, Company } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getCompanyLogo = (seed: number) => {
    const logo = PlaceHolderImages.find(img => img.imageUrl.includes(`seed/logo${seed}`));
    return {
        url: logo?.imageUrl ?? `https://picsum.photos/seed/logo${seed}/100/100`,
        hint: logo?.imageHint ?? 'abstract logo'
    };
}

const companies: Company[] = [
  { id: '1', name: 'InovaTech RS', logo: getCompanyLogo(1).url, logoHint: getCompanyLogo(1).hint },
  { id: '2', name: 'GauchaDev', logo: getCompanyLogo(2).url, logoHint: getCompanyLogo(2).hint },
  { id: '3', name: 'Sulware', logo: getCompanyLogo(3).url, logoHint: getCompanyLogo(3).hint },
  { id: '4', name: 'PampaSoft', logo: getCompanyLogo(4).url, logoHint: getCompanyLogo(4).hint },
  { id: '5', name: 'Restaurante Chimarrão', logo: getCompanyLogo(5).url, logoHint: getCompanyLogo(5).hint },
  { id: '6', name: 'Varejo Tri', logo: getCompanyLogo(6).url, logoHint: getCompanyLogo(6).hint },
];

export const jobs: Job[] = [
  {
    id: '1',
    title: 'Desenvolvedor(a) Frontend React',
    company: companies[0],
    location: 'Porto Alegre, RS',
    type: 'CLT',
    salary: { min: 5000, max: 7000 },
    description: 'Buscamos um desenvolvedor frontend com experiência em React para se juntar à nossa equipe inovadora.',
    postedAt: new Date('2024-07-20'),
    contact: { email: 'rh@inovatech.rs', whatsapp: '5551912345678' }
  },
  {
    id: '2',
    title: 'Engenheiro(a) de Software Backend',
    company: companies[1],
    location: 'Caxias do Sul, RS',
    type: 'PJ',
    salary: { min: 9000, max: 12000 },
    description: 'Procuramos um engenheiro de software backend sênior com experiência em Node.js e microserviços.',
    postedAt: new Date('2024-07-19'),
    contact: { email: 'vagas@gauchadev.com.br', whatsapp: '5554912345678' }
  },
  {
    id: '3',
    title: 'Garçom / Garçonete',
    company: companies[4],
    location: 'Gramado, RS',
    type: 'CLT',
    description: 'Contratamos garçom com ou sem experiência para atuar em restaurante de alta gastronomia em Gramado. Turno da noite.',
    postedAt: new Date('2024-07-21'),
    contact: { email: 'contato@chimarrao.com', whatsapp: '5554987654321' }
  },
  {
    id: '4',
    title: 'Analista de UX/UI',
    company: companies[2],
    location: 'Remoto',
    type: 'Extra/Freelancer',
    dailyRate: 350,
    description: 'Vaga para analista de UX/UI para projeto de 3 meses, com possibilidade de efetivação.',
    postedAt: new Date('2024-07-18'),
    contact: { email: 'jobs@sulware.dev', whatsapp: '5551988887777' }
  },
  {
    id: '5',
    title: 'Estagiário(a) de Marketing Digital',
    company: companies[3],
    location: 'Pelotas, RS',
    type: 'Estágio',
    salary: { min: 1200, max: 1200 },
    description: 'Oportunidade de estágio para estudantes de marketing ou publicidade. Atuação com redes sociais e SEO.',
    postedAt: new Date('2024-07-22'),
    contact: { email: 'talentos@pampasoft.com', whatsapp: '5553911112222' }
  },
  {
    id: '6',
    title: 'Gerente de Loja',
    company: companies[5],
    location: 'Santa Maria, RS',
    type: 'CLT',
    salary: { min: 4500, max: 6000 },
    description: 'Varejista em expansão contrata Gerente de Loja com experiência em gestão de equipes e resultados.',
    postedAt: new Date('2024-07-15'),
    contact: { email: 'rh.sm@varejotri.com.br', whatsapp: '5555933334444' }
  }
];
