
'use client';

import Link from 'next/link';
import {
  Heart,
  MapPin,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { companies } from '@/lib/companies';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { getPostedAt, formatSalary, getBenefitsSummary } from '@/lib/job-utils';
import { JobInfoItem } from './job-info-item';

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

  const postedAtDate = getPostedAt(job.postedAt);
  const benefitsSummary = getBenefitsSummary(job.benefits);

  if (!company) {
    // Or render a skeleton/fallback
    return null;
  }
  const LogoIcon = company.logo;

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="flex flex-row items-start gap-4">
        <Avatar className="h-14 w-14 border flex items-center justify-center bg-muted">
            <LogoIcon className="h-8 w-8 text-muted-foreground" />
        </Avatar>
        <div className="flex-grow">
          <CardTitle className="text-lg font-bold">
            <Link href={`/jobs/${job.id}`} className="hover:underline">
              {job.title}
            </Link>
          </CardTitle>
          <CardDescription className="text-sm">
            Empresa Confidencial
          </CardDescription>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{job.type}</Badge>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0" onClick={handleSaveJob}>
                <Heart className={`h-5 w-5 ${isSaved ? 'fill-destructive text-destructive' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isSaved ? 'Remover vaga salva' : 'Salvar vaga'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm text-muted-foreground">
        <JobInfoItem icon={MapPin} value={job.location} />
        <JobInfoItem icon={BadgeDollarSign} value={formatSalary(job)} />
        {benefitsSummary && (
          <JobInfoItem icon={Gift} value={benefitsSummary} />
        )}
        <JobInfoItem
            icon={Clock}
            value={`Publicado ${formatDistanceToNow(postedAtDate, { addSuffix: true, locale: ptBR })}`}
        />
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-2 sm:flex-row">
        <Button asChild className="w-full">
          <Link href={`/jobs/${job.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            Ver Vaga
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
