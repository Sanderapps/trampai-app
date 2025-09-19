import { Timestamp } from 'firebase/firestore';
import { Job } from './types';

/**
 * Converts a Firestore Timestamp or a plain object with seconds/nanoseconds to a Date object.
 * @param postedAt - The timestamp from Firestore.
 * @returns A Date object.
 */
export const getPostedAt = (postedAt: Job['postedAt']): Date => {
  if (postedAt instanceof Timestamp) {
    return postedAt.toDate();
  }
  if (postedAt && typeof postedAt === 'object' && 'seconds' in postedAt) {
    return new Timestamp(postedAt.seconds, postedAt.nanoseconds).toDate();
  }
  return new Date(); // Fallback for unexpected formats
};

/**
 * Formats the salary or daily rate of a job into a readable string.
 * @param job - The job object.
 * @returns A formatted salary string.
 */
export const formatSalary = (job: Job): string => {
  if (job.type === 'Extra/Freelancer') {
    return job.dailyRate
      ? `R$ ${job.dailyRate.toLocaleString('pt-BR')} / dia`
      : 'A combinar';
  }
  if (!job.salary || (!job.salary.min && !job.salary.max)) {
    return 'A combinar';
  }
  if (job.salary.min && job.salary.max) {
    if (job.salary.min === job.salary.max) {
      return `R$ ${job.salary.min.toLocaleString('pt-BR')}`;
    }
    return `R$ ${job.salary.min.toLocaleString('pt-BR')} - R$ ${job.salary.max.toLocaleString('pt-BR')}`;
  }
  if (job.salary.min) {
    return `A partir de R$ ${job.salary.min.toLocaleString('pt-BR')}`;
  }
  if (job.salary.max) {
    return `Até R$ ${job.salary.max.toLocaleString('pt-BR')}`;
  }
  return 'A combinar';
};

const BENEFIT_MAP = {
  hasCommission: 'Comissão',
  hasVT: 'Vale-transporte (VT)',
  hasVR: 'Vale-refeição (VR)',
  hasVA: 'Vale-alimentação (VA)',
  hasHealthPlan: 'Plano de Saúde',
};

/**
 * Converts the benefits object into a flat array of strings.
 * @param benefits - The benefits object from the job.
 * @returns An array of benefit strings.
 */
export const getBenefitsArray = (benefits: Job['benefits']): string[] => {
    if (!benefits) return [];

    const standardBenefits = Object.entries(benefits)
      .filter(([key, value]) => value === true && key in BENEFIT_MAP)
      .map(([key]) => BENEFIT_MAP[key as keyof typeof BENEFIT_MAP]);

    const otherBenefitsRaw = benefits.others || [];
    const customBenefits = (Array.isArray(otherBenefitsRaw) ? otherBenefitsRaw : Object.values(otherBenefitsRaw))
                           .filter(b => typeof b === 'string' && b.trim() !== '');

    return [...standardBenefits, ...customBenefits];
}

/**
 * Creates a short, truncated summary of job benefits.
 * @param benefits - The benefits object from the job.
 * @param limit - The max number of benefits to list before truncating.
 * @returns A summary string, e.g., "VT, VR, Plano de Saúde...".
 */
export const getBenefitsSummary = (benefits: Job['benefits'], limit: number = 2): string | null => {
  const allBenefits = getBenefitsArray(benefits);

  if (allBenefits.length === 0) return null;
  
  let summary = allBenefits.slice(0, limit).join(', ');

  if (allBenefits.length > limit) {
    summary += '...';
  }
  
  if(summary.length > 50) {
    return summary.substring(0, 47) + '...';
  }

  return summary;
}
