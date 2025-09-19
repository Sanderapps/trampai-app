import { ArrowLeft, ArrowRight } from 'lucide-react';
import { jobs } from '@/lib/data';
import { JobCard } from '@/components/jobs/job-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function JobsPage() {
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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
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
