import { jobs } from '@/lib/data';
import { Job } from '@/lib/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  BadgeDollarSign,
  Clock,
  Briefcase,
  Building,
  ArrowLeft,
  Share2,
  Heart
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const job = jobs.find((j) => j.id === params.id);

  if (!job) {
    notFound();
  }
  
  const formatSalary = (salary: { min: number; max: number } | undefined) => {
    if (!salary) return 'A combinar';
    if (salary.min === salary.max) {
      return `R$ ${salary.min.toLocaleString('pt-BR')}`;
    }
    return `R$ ${salary.min.toLocaleString('pt-BR')} - R$ ${salary.max.toLocaleString('pt-BR')}`;
  };


  return (
    <div className="bg-muted/30">
        <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-8">
                <Button variant="ghost" asChild>
                    <Link href="/jobs">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para as vagas
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
                                    <CardDescription className="mt-2 flex items-center gap-2 text-sm">
                                        <Building className="h-4 w-4" /> {job.company.name}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                     <Button variant="outline" size="icon">
                                        <Share2 className="h-5 w-5" />
                                     </Button>
                                     <Button variant="outline" size="icon">
                                        <Heart className="h-5 w-5" />
                                     </Button>
                                </div>
                            </div>
                             <div className="mt-4 flex flex-wrap gap-2">
                                <Badge variant="secondary">{job.type}</Badge>
                                {job.level && <Badge variant="secondary">{job.level}</Badge>}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="prose max-w-none text-foreground">
                                <p>{job.description}</p>
                                <h3>Responsabilidades</h3>
                                <ul>
                                    <li>Desenvolver e manter interfaces de usuário.</li>
                                    <li>Colaborar com equipes multifuncionais.</li>
                                    <li>Escrever código limpo e testável.</li>
                                </ul>
                                <h3>Qualificações</h3>
                                <ul>
                                    <li>Experiência com React, Next.js.</li>
                                    <li>Conhecimento em TypeScript.</li>
                                    <li>Familiaridade com metodologias ágeis.</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Button asChild size="lg" className="w-full">
                        <Link href={`/jobs/${job.id}/apply`}>
                            <Briefcase className="mr-2 h-4 w-4" /> Candidatar-se Agora
                        </Link>
                    </Button>

                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">Localização</p>
                                    <p className="text-muted-foreground">{job.location}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-3 text-sm">
                                <BadgeDollarSign className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">Salário</p>
                                    <p className="text-muted-foreground">{formatSalary(job.salary)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">Publicado</p>
                                    <p className="text-muted-foreground">{formatDistanceToNow(job.postedAt, { addSuffix: true, locale: ptBR })}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                            <Image src={job.company.logo} alt={job.company.name} width={56} height={56} className="rounded-md border" />
                            <div>
                                <CardTitle className="text-base font-bold">{job.company.name}</CardTitle>
                                <CardDescription className="text-sm">Veja o perfil da empresa</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </div>
    </div>
  );
}
