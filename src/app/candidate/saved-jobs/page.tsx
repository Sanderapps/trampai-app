
'use client';

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { Job } from "@/lib/types";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { JobCard } from "@/components/jobs/job-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SavedJobsPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!user) return;
      setJobsLoading(true);
      try {
        const savedJobsCollection = collection(db, 'users', user.uid, 'savedJobs');
        const savedJobsSnapshot = await getDocs(savedJobsCollection);
        const savedJobIds = savedJobsSnapshot.docs.map(doc => doc.data().jobId);
        
        const jobPromises = savedJobIds.map(jobId => getDoc(doc(db, 'jobs', jobId)));
        const jobDocs = await Promise.all(jobPromises);
        
        const jobList = jobDocs
            .filter(doc => doc.exists())
            .map(doc => ({ id: doc.id, ...doc.data() } as Job));

        setSavedJobs(jobList);
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
      } finally {
        setJobsLoading(false);
      }
    };
    
    if (!loading && userProfile && userProfile.accountType !== 'candidate') {
      router.push('/employer/dashboard');
    } else if (user) {
       fetchSavedJobs();
    }
  }, [user, userProfile, loading, router]);

  if (loading) {
    return <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">Carregando...</div>;
  }

  if (!user || !userProfile || userProfile.accountType !== 'candidate') {
     return <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold">Acesso Negado</h1>
      <p className="mt-1 text-muted-foreground">Você precisa estar logado como candidato para ver suas vagas salvas.</p>
      <Link href="/login" className="mt-4 inline-block text-primary underline">Fazer Login</Link>
    </div>
  }

  return (
    <div className="bg-muted/50">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            Vagas Salvas
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            As oportunidades que você salvou para ver mais tarde.
          </p>
        </div>
        {jobsLoading ? (
           <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[250px] w-full rounded-xl" />
                </div>
            ))}
            </div>
        ) : savedJobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {savedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
             <div className="mt-16 text-center">
                <p className="text-muted-foreground">Você ainda não salvou nenhuma vaga.</p>
                <Button asChild variant="link">
                <Link href="/jobs">Buscar vagas</Link>
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}
