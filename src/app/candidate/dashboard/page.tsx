'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { jobs } from "@/lib/data";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export default function CandidateDashboard() {
  const { user, loading } = useAuth();
  const appliedJobs = jobs.slice(0, 2); // Mock data

  if (loading) {
    return <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">Carregando...</div>;
  }

  if (!user) {
     return <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold">Acesso Negado</h1>
      <p className="mt-1 text-muted-foreground">Você precisa estar logado para ver seu painel.</p>
      <Link href="/login" className="mt-4 inline-block text-primary underline">Fazer Login</Link>
    </div>
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold">Minhas Candidaturas</h1>
      <p className="mt-1 text-muted-foreground">Acompanhe o status das suas candidaturas, {user.displayName}.</p>

      <div className="mt-8 space-y-6">
        {appliedJobs.map(job => (
          <Card key={job.id}>
            <CardHeader className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <CardTitle>
                    <Link href={`/jobs/${job.id}`} className="hover:underline">{job.title}</Link>
                </CardTitle>
                <CardDescription>{job.company.name}</CardDescription>
              </div>
              <div className="flex items-center">
                  <Badge>Em Análise</Badge>
              </div>
              <div className="flex items-center justify-start sm:justify-end text-sm text-muted-foreground">
                Candidatura enviada em {new Date().toLocaleDateString('pt-BR')}
              </div>
            </CardHeader>
          </Card>
        ))}

        {appliedJobs.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">Você ainda não se candidatou para nenhuma vaga.</p>
          </div>
        )}
      </div>
    </div>
  );
}
