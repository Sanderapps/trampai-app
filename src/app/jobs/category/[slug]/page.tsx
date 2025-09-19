
'use client';

import { JobCard } from '@/components/jobs/job-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Job } from '@/lib/types';
import { useEffect, useState } from 'react';
import { collection, getDocs, limit, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';

const categoryNames: { [key: string]: string } = {
    'restaurantes': 'Restaurantes',
    'tecnologia': 'Tecnologia',
    'saude': 'Saúde',
    'educacao': 'Educação',
    'varejo': 'Varejo',
    'servicos-gerais': 'Serviços Gerais'
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const categoryName = categoryNames[slug] || 'Categoria';
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchJobs = async () => {
      setLoading(true);
      try {
        const jobsCollection = collection(db, 'jobs');
        // This is a mock filter based on keywords. 
        // In a real app, you'd likely have a dedicated 'category' field.
        const q = query(
            jobsCollection, 
            where('keywords', 'array-contains', categoryName.toLowerCase()), 
            orderBy('postedAt', 'desc'),
            limit(12) // fetch more to filter client-side
        );
        const jobSnapshot = await getDocs(q);
        let jobList = jobSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Job))
            .filter(job => job.status !== 'Fechada');
        
        jobList = jobList.slice(0, 6);

        // Fallback to fetching any 3 jobs if category search yields no results for this mock.
        if (jobList.length === 0) {
          const fallbackQuery = query(jobsCollection, orderBy('postedAt', 'desc'), limit(6));
          const fallbackSnapshot = await getDocs(fallbackQuery);
          const fallbackList = fallbackSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Job))
            .filter(job => job.status !== 'Fechada')
            .slice(0, 3);
          setFilteredJobs(fallbackList);
        } else {
          setFilteredJobs(jobList);
        }

      } catch (error) {
        console.error(`Error fetching jobs for category ${categoryName}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [slug, categoryName]);


  return (
    <div className="bg-muted/50">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
            <Button variant="ghost" asChild>
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Link>
            </Button>
        </div>
        <div className="text-center">
          <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            Vagas em {categoryName}
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Oportunidades no setor de {categoryName}.
          </p>
        </div>
        
        {loading ? (
             <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
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
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))
            ) : (
              <p className="col-span-3 text-center text-muted-foreground">Nenhuma vaga encontrada para esta categoria.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
