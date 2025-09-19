
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { JobCard } from '@/components/jobs/job-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Job } from '@/lib/types';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const location = searchParams.get('location') || '';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilterJobs = async () => {
      setLoading(true);
      try {
        const jobsCollection = collection(db, 'jobs');
        const qSnapshot = await getDocs(query(jobsCollection, where('status', '==', 'Aberta'), orderBy('postedAt', 'desc')));
        const allJobs = qSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));

        const filtered = allJobs.filter(job => {
          const queryLower = q.toLowerCase();
          const locationLower = location.toLowerCase();

          const matchesQuery = q
            ? job.title.toLowerCase().includes(queryLower) ||
              job.description.toLowerCase().includes(queryLower) ||
              job.companyName.toLowerCase().includes(queryLower) ||
              (job.keywords && job.keywords.some(k => k.toLowerCase().includes(queryLower)))
            : true;

          const matchesLocation = location
            ? job.location.toLowerCase().includes(locationLower)
            : true;

          return matchesQuery && matchesLocation;
        });

        setJobs(filtered);
      } catch (error) {
        console.error("Error fetching or filtering jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterJobs();
  }, [q, location]);

  const searchDescription = [q, location].filter(Boolean).join(' em ');

  return (
    <div className="bg-muted/50">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            Resultados da Busca
          </h1>
          {searchDescription && (
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Exibindo vagas para: <span className="font-semibold text-foreground">{searchDescription}</span>
            </p>
          )}
        </div>
        {loading ? (
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[250px] w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma vaga encontrada</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tente ajustar seus termos de busca ou confira todas as vagas.
            </p>
            <Button asChild className="mt-6">
              <Link href="/jobs">Ver todas as vagas</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}


export default function SearchPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <SearchResults />
        </Suspense>
    )
}
