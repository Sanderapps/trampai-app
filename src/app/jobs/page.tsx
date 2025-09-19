
'use client';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { JobCard } from '@/components/jobs/job-card';
import { Button } from '@/components/ui/button';
import { Job } from '@/lib/types';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPostedAt } from '@/lib/job-utils';
import { Label } from '@/components/ui/label';

type SortOption = 'postedAt_desc' | 'location_asc';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>('postedAt_desc');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const jobsCollection = collection(db, 'jobs');
        // We fetch all open jobs and sort on the client side
        const q = query(
          jobsCollection,
          where('status', '!=', 'Fechada'), // Firestore doesn't have a native '!=' but we can filter client-side
          orderBy('postedAt', 'desc')
        );
        const jobSnapshot = await getDocs(q);
        const jobList = jobSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Job))
            .filter(job => job.status !== 'Fechada'); 
        setJobs(jobList);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const sortedJobs = useMemo(() => {
    const sorted = [...jobs];
    if (sortOption === 'postedAt_desc') {
        sorted.sort((a, b) => getPostedAt(b.postedAt).getTime() - getPostedAt(a.postedAt).getTime());
    } else if (sortOption === 'location_asc') {
        sorted.sort((a, b) => a.location.localeCompare(b.location));
    }
    return sorted;
  }, [jobs, sortOption]);


  return (
    <div className="bg-muted/50">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            Todas as Vagas
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Encontre a oportunidade perfeita para você.
          </p>
        </div>

        <div className="my-8 flex justify-end">
            <div className="flex items-center gap-2">
                <Label htmlFor="sort-by">Ordenar por</Label>
                <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
                    <SelectTrigger id='sort-by' className='w-[180px]'>
                        <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="postedAt_desc">Mais Recentes</SelectItem>
                        <SelectItem value="location_asc">Localização</SelectItem>
                    </SelectContent>
                </Select>
            </div>
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
            {sortedJobs.map((job) => (
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
