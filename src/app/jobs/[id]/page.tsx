
'use client';
import { Job } from '@/lib/types';
import { notFound, useParams, useRouter } from 'next/navigation';
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
import { doc, getDoc, Timestamp, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { companies } from '@/lib/companies';
import { formatSalary, getPostedAt } from '@/lib/job-utils';
import { JobInfoItem } from '@/components/jobs/job-info-item';
import { BenefitList } from '@/components/jobs/benefit-list';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Avatar } from '@/components/ui/avatar';

export default function JobDetailsPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    
    const fetchJob = async () => {
      setLoading(true);
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', jobId));
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
  }, [jobId]);

   useEffect(() => {
    const checkIfSaved = async () => {
        if (!user || !job || userProfile?.accountType !== 'candidate') return;
        const savedJobRef = doc(db, 'users', user.uid, 'savedJobs', job.id);
        const docSnap = await getDoc(savedJobRef);
        setIsSaved(docSnap.exists());
    };
    if (job) {
        checkIfSaved();
    }
  }, [user, job, userProfile]);

  const handleSaveJob = async () => {
    if (!user) {
      router.push(`/login?redirect=/jobs/${jobId}`);
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

    const savedJobRef = doc(db, 'users', user.uid, 'savedJobs', jobId);

    try {
        if (isSaved) {
            await deleteDoc(savedJobRef);
            setIsSaved(false);
            toast({ title: "Vaga removida da sua lista."});
        } else {
            await setDoc(savedJobRef, { jobId: jobId, savedAt: new Date() });
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

  const postedAtDate = getPostedAt(job.postedAt);
  const LogoIcon = company.logo;

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
                                        <Building className="h-4 w-4" /> Empresa Confidencial
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                     <Button variant="outline" size="icon">
                                        <Share2 className="h-5 w-5" />
                                     </Button>
                                     <Button variant="outline" size="icon" onClick={handleSaveJob}>
                                        <Heart className={`h-5 w-5 ${isSaved ? 'fill-destructive text-destructive' : ''}`} />
                                     </Button>
                                </div>
                            </div>
                             <div className="mt-4 flex flex-wrap gap-2">
                                <Badge variant="secondary">{job.type}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="prose max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br />') }}/>
                        </CardContent>
                    </Card>

                    <BenefitList benefits={job.benefits} />
                </div>

                <div className="space-y-6">
                    <Button asChild size="lg" className="w-full">
                        <Link href={`/jobs/${job.id}/apply`}>
                            <Briefcase className="mr-2 h-4 w-4" /> Candidatar-se Agora
                        </Link>
                    </Button>

                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            <JobInfoItem icon={MapPin} label="Localização" value={job.location} />
                            <JobInfoItem icon={BadgeDollarSign} label="Remuneração" value={formatSalary(job)} />
                            <JobInfoItem
                                icon={Clock}
                                label="Publicado"
                                value={formatDistanceToNow(postedAtDate, { addSuffix: true, locale: ptBR })}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                            <Avatar className="h-14 w-14 border flex items-center justify-center bg-muted">
                                <LogoIcon className="h-8 w-8 text-muted-foreground" />
                            </Avatar>
                            <div>
                                <CardTitle className="text-base font-bold">Empresa Confidencial</CardTitle>
                            </div>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </div>
    </div>
  );
}
