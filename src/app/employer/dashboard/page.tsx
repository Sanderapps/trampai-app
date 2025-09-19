'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { PlusCircle, Briefcase, Users, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { Job } from '@/lib/types';
import { collection, getDocs, query, where,getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Skeleton } from '@/components/ui/skeleton';

type JobWithApplicantCount = Job & { applicantCount: number };

export default function EmployerDashboard() {
  const { user, loading } = useAuth();
  const [jobs, setJobs] = useState<JobWithApplicantCount[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployerJobs = async () => {
      if (!user) return;
      setJobsLoading(true);
      try {
        const jobsCollection = collection(db, 'jobs');
        const q = query(jobsCollection, where("employerId", "==", user.uid));
        const jobSnapshot = await getDocs(q);
        const jobList = jobSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));

        const jobsWithCounts: JobWithApplicantCount[] = await Promise.all(
            jobList.map(async (job) => {
                const appsCollection = collection(db, 'applications');
                const appsQuery = query(appsCollection, where('jobId', '==', job.id));
                const snapshot = await getCountFromServer(appsQuery);
                return { ...job, applicantCount: snapshot.data().count };
            })
        );

        setJobs(jobsWithCounts);
      } catch (error) {
        console.error("Error fetching employer jobs:", error);
      } finally {
        setJobsLoading(false);
      }
    }

    if (user) {
        fetchEmployerJobs();
    }
  }, [user]);

  if (loading) {
    return <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">Carregando...</div>;
  }

  if (!user) {
    return <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold">Acesso Negado</h1>
      <p className="mt-1 text-muted-foreground">Você precisa estar logado para ver seu painel de empregador.</p>
      <Link href="/login" className="mt-4 inline-block text-primary underline">Fazer Login</Link>
    </div>
  }

  const totalActiveJobs = jobs.length;
  const totalApplicants = jobs.reduce((sum, job) => sum + job.applicantCount, 0);


  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-headline text-3xl font-bold">Painel do Empregador</h1>
          <p className="mt-1 text-muted-foreground">Gerencie suas vagas e candidaturas, {user.displayName}.</p>
        </div>
        <Button asChild>
          <Link href="/employer/jobs/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Publicar Nova Vaga
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vagas Ativas</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobsLoading ? <Skeleton className='h-8 w-8'/> : totalActiveJobs}</div>
            <p className="text-xs text-muted-foreground">
              Vagas publicadas na plataforma
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Candidaturas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobsLoading ? <Skeleton className='h-8 w-8'/> : totalApplicants}</div>
            <p className="text-xs text-muted-foreground">
              Recebidas em todas as suas vagas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold">Suas Vagas</h2>
        {jobsLoading ? (
            <div className='mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {[...Array(3)].map(i => <Skeleton key={i} className='h-48 w-full' />)}
            </div>
        ) : jobs.length > 0 ? (
            <div className='mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {jobs.map(job => (
                    <Card key={job.id} className='flex flex-col'>
                        <CardHeader>
                            <CardTitle>{job.title}</CardTitle>
                            <CardDescription>{job.location}</CardDescription>
                        </CardHeader>
                        <CardContent className='flex-grow'>
                            <div className='flex items-center gap-2 text-muted-foreground'>
                                <Users className='h-5 w-5' />
                                <span className='text-lg font-bold'>{job.applicantCount}</span>
                                <span>{job.applicantCount === 1 ? 'candidato' : 'candidatos'}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className='w-full' variant="secondary">
                                <Link href={`/employer/jobs/${job.id}/applicants`}>
                                    <Eye className='mr-2 h-4 w-4' /> Ver Candidatos
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="mt-4 rounded-lg border border-dashed border-muted-foreground/50 p-8 text-center">
            <p className="text-muted-foreground">Você ainda não publicou nenhuma vaga.</p>
            </div>
        )}
      </div>
    </div>
  );
}
