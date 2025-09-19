import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const features = [
  "Publique vagas de forma rápida e fácil",
  "Alcance milhares de profissionais no RS",
  "Gerencie candidaturas em um só lugar",
  "Ferramentas de IA para otimizar suas descrições"
];

export default function EmployerPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Encontre os <span className="text-primary">melhores talentos</span> para sua empresa
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Anuncie suas vagas na Trampaí e conecte-se com profissionais qualificados em todo o Rio Grande do Sul.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg">
            <Link href="/employer/jobs/new">Anunciar Vaga Gratuitamente</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/pricing">Ver Planos</Link>
          </Button>
        </div>
      </div>

      <div className="mt-20">
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              Por que anunciar na Trampaí?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <CheckCircle className="mt-1 h-6 w-6 shrink-0 text-primary" />
                  <p className="text-base text-foreground">{feature}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
