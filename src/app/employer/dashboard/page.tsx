'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlusCircle, Briefcase, Users } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function EmployerDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">Carregando...</div>;
  }

  if (!user) {
    return <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold">Acesso Negado</h1>
      <p className="mt-1 text-muted-foreground">Você precisa estar logado para ver seu painel de empregador.</p>
      <Link href="/login" className="mt-4 inline-block text-primary underline">Fazer Login</Link>
    </div>
  }


  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-headline text-3xl font-bold">Painel do Empregador</h1>
          <p className="mt-1 text-muted-foreground">Gerencie suas vagas e candidaturas, {user.displayName}.</p>
        </div>
        <Button asChild>
          <Link href="/employer/jobs/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Publicar Nova Vaga
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vagas Ativas</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Vagas publicadas na plataforma
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novas Candidaturas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">
              Nas últimas 24 horas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold">Suas Vagas</h2>
        {/* Placeholder for list of jobs */}
        <div className="mt-4 rounded-lg border border-dashed border-muted-foreground/50 p-8 text-center">
          <p className="text-muted-foreground">Você ainda não publicou nenhuma vaga.</p>
        </div>
      </div>
    </div>
  );
}
