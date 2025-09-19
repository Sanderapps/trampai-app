
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Mail,
  MapPin,
  Briefcase,
  Clock,
  BadgeDollarSign,
  Eye,
  Gift,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Job } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Timestamp, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { companies } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const company = companies.find(c => c.id === job.companyId);
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const checkIfSaved = async () => {
        if (!user || userProfile?.accountType !== 'candidate') return;
        const savedJobRef = doc(db, 'users', user.uid, 'savedJobs', job.id);
        const docSnap = await getDoc(savedJobRef);
        setIsSaved(docSnap.exists());
    };
    checkIfSaved();
  }, [user, job.id, userProfile]);

  const handleSaveJob = async () => {
    if (!user) {
      router.push(`/login?redirect=/jobs/${job.id}`);
      return;
    }
     if (userProfile?.accountType !== 'candidate') {
      toast({
        variant: "destructive",
        title: "Ação não permitida",
        description: "Apenas candidatos podem salvar vagas.",
      });
      return;
    }

    const savedJobRef = doc(db, 'users', user.uid, 'savedJobs', job.id);

    try {
        if (isSaved) {
            await deleteDoc(savedJobRef);
            setIsSaved(false);
            toast({ title: "Vaga removida da sua lista."});
        } else {
            await setDoc(savedJobRef, { jobId: job.id, savedAt: new Date() });
            setIsSaved(true);
            toast({ title: "Vaga salva com sucesso!"});
        }
    } catch (error) {
        console.error("Error saving/unsaving job: ", error);
        toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível salvar a vaga. Tente novamente.",
        });
    }
  };


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

  const getBenefitsSummary = () => {
    if (!job.benefits) return null;

    const benefitsMap = {
      hasVT: 'VT',
      hasVR: 'VR',
      hasVA: 'VA',
      hasHealthPlan: 'Plano de Saúde',
      hasCommission: 'Comissão',
    };

    const available = Object.entries(job.benefits)
      .filter(([key, value]) => value === true && key in benefitsMap)
      .map(([key]) => benefitsMap[key as keyof typeof benefitsMap]);
    
    const hasOthers = job.benefits.others && job.benefits.others.trim() !== '';

    if (available.length === 0 && !hasOthers) return null;
    
    let benefitsToShow = available;
    
    let summary = benefitsToShow.join(', ');

    if (hasOthers) {
       if(available.length > 0) {
         summary += `, ${job.benefits.others}`;
       } else {
         summary = job.benefits.others!;
       }
    }
    
    // Truncate if still too long
    if(summary.length > 50) {
      return summary.substring(0, 50) + '...';
    }

    return summary;
  }

  const benefitsSummary = getBenefitsSummary();

  if (!company) {
    // Or render a skeleton/fallback
    return null;
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="flex flex-row items-start gap-4">
        <Avatar className="h-14 w-14 border">
          <AvatarImage src={company.logo} alt={company.name} data-ai-hint={company.logoHint} />
          <AvatarFallback>{company.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <CardTitle className="text-lg font-bold">
            <Link href={`/jobs/${job.id}`} className="hover:underline">
              {job.title}
            </Link>
          </CardTitle>
          <CardDescription className="text-sm">
            {job.companyName}
          </CardDescription>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{job.type}</Badge>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0" onClick={handleSaveJob}>
                <Heart className={`h-5 w-5 ${isSaved ? 'fill-primary text-primary' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isSaved ? 'Remover vaga salva' : 'Salvar vaga'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <BadgeDollarSign className="h-4 w-4" />
          <span>{formatSalary(job)}</span>
        </div>
        {benefitsSummary && (
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            <span>{benefitsSummary}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>
            Publicado{' '}
            {formatDistanceToNow(getPostedAt(), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-2 sm:flex-row">
        <Button asChild className="w-full">
          <Link href={`/jobs/${job.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            Ver Vaga
          </Link>
        </Button>
        {job.contact && (
          <div className="flex w-full gap-2 sm:w-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="outline" size="icon" className="flex-1 sm:flex-initial">
                    <a href={`https://wa.me/${job.contact.whatsapp}`} target="_blank" rel="noopener noreferrer">
                      <WhatsappIcon className="h-5 w-5" />
                      <span className="sr-only">Contato via WhatsApp</span>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Contato via WhatsApp</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="outline" size="icon" className="flex-1 sm:flex-initial">
                    <a href={`mailto:${job.contact.email}`}>
                      <Mail className="h-5 w-5" />
                      <span className="sr-only">Contato via E-mail</span>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Contato via E-mail</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
