import { Job } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Gift, Check } from 'lucide-react';
import { getBenefitsArray } from '@/lib/job-utils';

interface BenefitListProps {
    benefits: Job['benefits'];
}

export function BenefitList({ benefits }: BenefitListProps) {
    const allBenefits = getBenefitsArray(benefits);

    if (allBenefits.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Gift className="h-5 w-5 text-primary" />
                    Benefícios
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {allBenefits.map(benefit => (
                        <li key={benefit} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>{benefit}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
