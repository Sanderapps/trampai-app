
'use client';
import Image from 'next/image';
import Link from 'next/link';
import {
  Briefcase,
  Code,
  GraduationCap,
  HeartPulse,
  MapPin,
  Search,
  Store,
  UtensilsCrossed,
  Wrench,
  ArrowRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { JobCard } from '@/components/jobs/job-card';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Job } from '@/lib/types';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Skeleton } from '@/components/ui/skeleton';

const categories = [
  { name: 'Restaurantes', icon: UtensilsCrossed, slug: 'restaurantes' },
  { name: 'Tecnologia', icon: Code, slug: 'tecnologia' },
  { name: 'Saúde', icon: HeartPulse, slug: 'saude' },
  { name: 'Educação', icon: GraduationCap, slug: 'educacao' },
  { name: 'Varejo', icon: Store, slug: 'varejo' },
  { name: 'Serviços Gerais', icon: Wrench, slug: 'servicos-gerais' },
];

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const jobsCollection = collection(db, 'jobs');
        const q = query(jobsCollection, orderBy('postedAt', 'desc'), limit(6));
        const jobSnapshot = await getDocs(q);
        const jobList = jobSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
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
    <div className="flex flex-col">
      <section className="relative -mt-[var(--header-height)] flex min-h-[500px] flex-col justify-center bg-gradient-to-r from-primary to-secondary">
        <div className="relative mx-auto w-full max-w-7xl px-4 pt-[var(--header-height)] text-center text-primary-foreground sm:px-6 lg:px-8">
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Encontre seu próximo <span className="text-accent">trampo</span> no RS
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg leading-8">
            A plataforma de empregos que conecta talentos e empresas no Rio Grande do Sul.
          </p>
          <form className="mt-10 flex w-full max-w-3xl mx-auto flex-col items-center gap-4 rounded-lg bg-background/10 p-4 backdrop-blur-sm sm:flex-row">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cargo, palavra-chave ou empresa"
                className="w-full pl-10 text-foreground"
              />
            </div>
            <div className="relative w-full">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cidade ou região"
                className="w-full pl-10 text-foreground"
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto" size="lg">
              <Search className="mr-2 h-4 w-4 sm:hidden" />
              Buscar Vagas
            </Button>
          </form>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
              Vagas em Destaque
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Confira as oportunidades mais recentes publicadas na nossa plataforma.
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
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/jobs">
                Ver Todas as Vagas <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
              Navegue por Categoria
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Encontre vagas no setor que mais te interessa.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {categories.map((category) => (
              <Link href={`/jobs/category/${category.slug}`} key={category.name}>
                <Card className="group h-full transform transition-transform hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
                    <category.icon className="mb-4 h-10 w-10 text-primary" />
                    <h3 className="font-semibold text-foreground group-hover:text-primary">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-lg bg-primary shadow-xl lg:grid lg:grid-cols-2 lg:gap-4">
            <div className="px-6 pb-12 pt-10 sm:px-16 sm:pt-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
              <div className="lg:self-center">
                <h2 className="font-headline text-3xl font-bold text-primary-foreground sm:text-4xl">
                  É empregador?
                </h2>
                <p className="mt-4 text-lg leading-6 text-primary-foreground/90">
                  Publique suas vagas e encontre os melhores talentos do Rio Grande do Sul.
                  Nossa plataforma simplifica seu processo de contratação.
                </p>
                <Button asChild variant="accent" size="lg" className="mt-8">
                  <Link href="/employer/dashboard">
                    Anunciar Vaga <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="aspect-h-3 aspect-w-5 -mt-6 md:aspect-h-1 md:aspect-w-2">
              <Image
                className="translate-x-6 translate-y-6 transform rounded-md object-cover object-left-top sm:translate-x-16 lg:translate-y-20"
                src="https://images.unsplash.com/photo-1551818255-ac24e752hs12?q=80&w=800&auto=format&fit=crop"
                alt="Empregador analisando currículos"
                width={800}
                height={533}
                data-ai-hint="person hiring"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
