import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Image from 'next/image';

const features = [
  "Publique vagas de forma rápida e fácil",
  "Alcance milhares de profissionais no RS",
  "Gerencie candidaturas em um só lugar",
  "Ferramentas de IA para otimizar suas descrições"
];

export default function EmployerPage() {
  return (
    <div className="bg-background">
        <div className="relative isolate overflow-hidden pt-16">
        <Image
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2070&auto=format&fit=crop"
            alt="Dois profissionais apertando as mãos em um acordo"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
            width={2070}
            height={1380}
            data-ai-hint="handshake deal"
        />
        <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
            <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8 text-center">
                <h1 className="font-headline text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
                    Encontre os <span className="text-secondary">melhores talentos</span> para sua empresa
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-secondary-foreground/90">
                Anuncie suas vagas na Trampaí e conecte-se com profissionais qualificados em todo o Rio Grande do Sul.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button asChild size="lg" variant="secondary">
                    <Link href="/employer/jobs/new">Anunciar Vaga Gratuitamente</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className='text-white border-white hover:bg-white hover:text-primary'>
                    <Link href="/pricing">Ver Planos</Link>
                </Button>
                </div>
            </div>
        </div>

        <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mt-8">
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
    </div>
  );
}
