'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Mail,
  MapPin,
  Briefcase,
  Clock,
  BadgeDollarSign,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Job } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const formatSalary = (salary: { min: number; max: number } | undefined) => {
    if (!salary) return 'A combinar';
    if (salary.min === salary.max) {
      return `R$ ${salary.min.toLocaleString('pt-BR')}`;
    }
    return `R$ ${salary.min.toLocaleString('pt-BR')} - R$ ${salary.max.toLocaleString('pt-BR')}`;
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="flex flex-row items-start gap-4">
        <Avatar className="h-14 w-14 border">
          <AvatarImage src={job.company.logo} alt={job.company.name} data-ai-hint={job.company.logoHint} />
          <AvatarFallback>{job.company.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <CardTitle className="text-lg font-bold">
            <Link href={`/jobs/${job.id}`} className="hover:underline">
              {job.title}
            </Link>
          </CardTitle>
          <CardDescription className="text-sm">
            {job.company.name}
          </CardDescription>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{job.type}</Badge>
            {job.level && <Badge variant="secondary">{job.level}</Badge>}
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Heart className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Salvar vaga</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <BadgeDollarSign className="h-4 w-4" />
          <span>{formatSalary(job.salary)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>
            Publicado{' '}
            {formatDistanceToNow(job.postedAt, {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-2 sm:flex-row">
        <Button asChild className="w-full">
          <Link href={`/jobs/${job.id}/apply`}>
            <Briefcase className="mr-2 h-4 w-4" />
            Candidatar-se
          </Link>
        </Button>
        <div className="flex w-full gap-2 sm:w-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="outline" size="icon" className="flex-1 sm:flex-initial">
                  <a href={`https://wa.me/${job.contact.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    <WhatsappIcon className="h-5 w-5" />
                    <span className="sr-only">Contato via WhatsApp</span>
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Contato via WhatsApp</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="outline" size="icon" className="flex-1 sm:flex-initial">
                  <a href={`mailto:${job.contact.email}`}>
                    <Mail className="h-5 w-5" />
                    <span className="sr-only">Contato via E-mail</span>
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Contato via E-mail</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
}
