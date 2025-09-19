
'use client';
import { Job } from '@/lib/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  BadgeDollarSign,
  Clock,
  Briefcase,
  Building,
  ArrowLeft,
  Share2,
  Heart,
  Gift,
  Check,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { companies } from '@/lib/data';

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', params.id));
        if (jobDoc.exists()) {
          setJob({ id: jobDoc.id, ...jobDoc.data() } as Job);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching job:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [params.id]);

  const company = job ? companies.find(c => c.id === job.companyId) : null;

  if (loading) {
    return (
        <div className="bg-muted/30">
            <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                 <Skeleton className="h-10 w-48 mb-8" />
                 <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-4">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-96 w-full" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
  }

  if (!job || !company) {
    return notFound();
  }

  const formatSalary = (job: Job) => {
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

  const getPostedAt = () => {
    if (job.postedAt instanceof Timestamp) {
      return job.postedAt.toDate();
    }
    // Firestore Timestamps can sometimes be hydrated as objects with seconds and nanoseconds
    if (job.postedAt && 'seconds' in job.postedAt) {
      return new Timestamp(job.postedAt.seconds, job.postedAt.nanoseconds).toDate();
    }
    return new Date(); // Fallback
  }
  
  const benefitList = job.benefits ? Object.entries(job.benefits)
    .filter(([key, value]) => value === true && key !== 'others')
    .map(([key]) => {
        switch(key) {
            case 'hasCommission': return 'Comissão';
            case 'hasVT': return 'Vale-transporte (VT)';
            case 'hasVR': return 'Vale-refeição (VR)';
            case 'hasVA': return 'Vale-alimentação (VA)';
            case 'hasHealthPlan': return 'Plano de Saúde';
            default: return null;
        }
    }).filter(Boolean) as string[] : [];

    const otherBenefits = job.benefits?.others?.filter(b => b.trim() !== '') || [];
    const allBenefits = [...benefitList, ...otherBenefits];

    const hasBenefits = allBenefits.length > 0;


  return (
    <div className="bg-muted/30">
        <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-8">
                <Button variant="ghost" asChild>
                    <Link href="/jobs">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para as vagas
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
                                    <CardDescription className="mt-2 flex items-center gap-2 text-sm">
                                        <Building className="h-4 w-4" /> {job.companyName}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                     <Button variant="outline" size="icon">
                                        <Share2 className="h-5 w-5" />
                                     </Button>
                                     <Button variant="outline" size="icon">
                                        <Heart className="h-5 w-5" />
                                     </Button>
                                </div>
                            </div>
                             <div className="mt-4 flex flex-wrap gap-2">
                                <Badge variant="secondary">{job.type}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="prose max-w-none text-foreground">
                                <p>{job.description}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {hasBenefits && (
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
                    )}
                </div>

                <div className="space-y-6">
                    <Button asChild size="lg" className="w-full">
                        <Link href={`/jobs/${job.id}/apply`}>
                            <Briefcase className="mr-2 h-4 w-4" /> Candidatar-se Agora
                        </Link>
                    </Button>

                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">Localização</p>
                                    <p className="text-muted-foreground">{job.location}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-3 text-sm">
                                <BadgeDollarSign className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">Remuneração</p>
                                    <p className="text-muted-foreground">{formatSalary(job)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">Publicado</p>
                                    <p className="text-muted-foreground">{formatDistanceToNow(getPostedAt(), { addSuffix: true, locale: ptBR })}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                     <Link href={`/company/${company.id}`} className='block transition-transform hover:scale-[1.02]'>
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                                <Image src={company.logo} alt={company.name} width={56} height={56} className="rounded-md border" />
                                <div>
                                    <CardTitle className="text-base font-bold">{company.name}</CardTitle>
                                    <CardDescription className="text-sm">Veja o perfil da empresa</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    </div>
  );
}
