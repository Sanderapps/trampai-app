
'use client';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { JobCard } from '@/components/jobs/job-card';
import { Button } from '@/components/ui/button';
import { Job } from '@/lib/types';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const jobsCollection = collection(db, 'jobs');
        // Temporarily remove status filter to show all jobs
        const q = query(
          jobsCollection,
          orderBy('postedAt', 'desc')
        );
        const jobSnapshot = await getDocs(q);
        const jobList = jobSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Job))
            .filter(job => job.status !== 'Fechada'); // Filter out closed jobs on the client
        setJobs(jobList);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);


  return (
    <div className="bg-muted/50">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            Todas as Vagas
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Encontre a oportunidade perfeita para você.
          </p>
        </div>
        {loading ? (
           <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[125px] w-full rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
            ))}
            </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
        <div className="mt-12 flex justify-center">
            <nav className="flex items-center gap-4">
                <Button variant="outline" disabled>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
                <span className='font-bold'>Página 1 de 1</span>
                <Button variant="outline" disabled>
                    Próxima <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </nav>
        </div>
      </div>
    </div>
  );
}
