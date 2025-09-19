'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { Application } from "@/lib/types";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CandidateDashboard() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [appliedJobs, setAppliedJobs] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!user) return;
      setAppsLoading(true);
      try {
        const appsCollection = collection(db, "applications");
        const q = query(appsCollection, where("candidateId", "==", user.uid));
        const appSnapshot = await getDocs(q);
        const appList = appSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
        setAppliedJobs(appList);
      } catch (error) {
        console.error("Error fetching applications for dashboard:", error);
      } finally {
        setAppsLoading(false);
      }
    };
    
    if (!loading && userProfile && userProfile.accountType !== 'candidate') {
      router.push('/employer/dashboard');
    } else if (user) {
       fetchAppliedJobs();
    }
  }, [user, userProfile, loading, router]);

  if (loading) {
    return <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">Carregando...</div>;
  }

  if (!user || !userProfile || userProfile.accountType !== 'candidate') {
     return <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold">Acesso Negado</h1>
      <p className="mt-1 text-muted-foreground">Você precisa estar logado como candidato para ver seu painel.</p>
      <Link href="/login" className="mt-4 inline-block text-primary underline">Fazer Login</Link>
    </div>
  }

  const getAppliedDate = (timestamp: Timestamp) => {
      if (!timestamp) return 'Data indisponível';
      return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate().toLocaleDateString('pt-BR');
  }

  const getBadgeVariant = (status: Application['status']) => {
    switch (status) {
      case 'Contratado': return 'default';
      case 'Rejeitado': return 'destructive';
      case 'Vaga Preenchida': return 'secondary';
      default: return 'outline';
    }
  };


  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold">Minhas Candidaturas</h1>
      <p className="mt-1 text-muted-foreground">Acompanhe o status das suas candidaturas, {user.displayName}.</p>

      <div className="mt-8 space-y-6">
        {appsLoading ? (
            <p>Carregando candidaturas...</p>
        ) : appliedJobs.length > 0 ? (
          appliedJobs.map(app => (
            <Card key={app.id}>
              <CardHeader className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <CardTitle>
                      <Link href={`/jobs/${app.jobId}`} className="hover:underline">{app.jobTitle}</Link>
                  </CardTitle>
                  <CardDescription>{app.companyName}</CardDescription>
                </div>
                <div className="flex items-center">
                    <Badge variant={getBadgeVariant(app.status)}>{app.status}</Badge>
                </div>
                <div className="flex items-center justify-start sm:justify-end text-sm text-muted-foreground">
                  Candidatura enviada em {getAppliedDate(app.appliedAt)}
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">Você ainda não se candidatou para nenhuma vaga.</p>
            <Button asChild variant="link">
              <Link href="/jobs">Buscar vagas</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
