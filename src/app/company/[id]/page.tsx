'use client';

import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

import { db } from '@/lib/firebase/client';
import { Job, Company } from '@/lib/types';
import { companies } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { JobCard } from '@/components/jobs/job-card';
import { Avatar } from '@/components/ui/avatar';

export default function CompanyProfilePage() {
  const params = useParams();
  const companyId = params.id as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) {
      notFound();
      return;
    }
    
    const foundCompany = companies.find(c => c.id === companyId);
    if (!foundCompany) {
      notFound();
      return;
    }
    setCompany(foundCompany);

    const fetchCompanyJobs = async () => {
      setLoading(true);
      try {
        const jobsCollection = collection(db, 'jobs');
        const q = query(
          jobsCollection, 
          where("companyId", "==", companyId),
          orderBy('postedAt', 'desc')
        );
        const jobSnapshot = await getDocs(q);
        const jobList = jobSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
        setJobs(jobList);
      } catch (error) {
        console.error("Error fetching company jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyJobs();

  }, [companyId]);

  if (!company) {
    return (
       <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-12 w-96 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const LogoIcon = company.logo;

  return (
    <div className="bg-muted/50">
      <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href="/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para as vagas
            </Link>
          </Button>
        </div>

        <div className="flex flex-col items-center gap-6 sm:flex-row">
            <Avatar className="h-24 w-24 border flex items-center justify-center bg-card">
                <LogoIcon className="h-12 w-12 text-foreground" />
            </Avatar>
            <div>
                 <h1 className="font-headline text-3xl font-bold">{company.name}</h1>
                 <p className="mt-1 text-muted-foreground">Veja as oportunidades disponíveis nesta empresa.</p>
            </div>
        </div>

        <div className='mt-12'>
            <h2 className='text-2xl font-bold mb-6'>Vagas Abertas</h2>
            {loading ? (
                 <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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
            ) : jobs.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {jobs.map(job => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 rounded-lg border border-dashed">
                    <p className="text-muted-foreground">Nenhuma vaga aberta encontrada para esta empresa no momento.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
