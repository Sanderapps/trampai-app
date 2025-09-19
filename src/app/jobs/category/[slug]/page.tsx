import { jobs } from '@/lib/data';
import { JobCard } from '@/components/jobs/job-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const categoryNames: { [key: string]: string } = {
    'restaurantes': 'Restaurantes',
    'tecnologia': 'Tecnologia',
    'saude': 'Saúde',
    'educacao': 'Educação',
    'varejo': 'Varejo',
    'servicos-gerais': 'Serviços Gerais'
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const categoryName = categoryNames[params.slug] || 'Categoria';
  // This is a mock filter. In a real app, you'd filter jobs by category.
  const filteredJobs = jobs.slice(0, 3);

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
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))
          ) : (
            <p className="col-span-3 text-center text-muted-foreground">Nenhuma vaga encontrada para esta categoria.</p>
          )}
        </div>
      </div>
    </div>
  );
}
