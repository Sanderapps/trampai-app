
'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState, useMemo, useRef } from "react";
import { Application, UserProfile } from "@/lib/types";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getPostedAt } from "@/lib/job-utils";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Megaphone } from "lucide-react";

export default function CandidateDashboard() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [appliedJobs, setAppliedJobs] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const notificationShown = useRef(false);

  const isProfileIncomplete = useMemo(() => {
    if (!userProfile) return false;
    
    // Helper to safely parse JSON strings from Firestore
    const safeJsonParse = (jsonString: string | undefined | null) => {
        if (!jsonString) return [];
        try {
            if (typeof jsonString === 'object' && jsonString !== null) return jsonString;
            const parsed = JSON.parse(jsonString);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) { return []; }
    };

    const hasExperience = safeJsonParse(userProfile.experience).length > 0;
    const hasEducation = safeJsonParse(userProfile.education).length > 0;

    return !userProfile.summary || (!hasExperience && !userProfile.isFirstJob) || !hasEducation || !userProfile.phone || !userProfile.location;
  }, [userProfile]);

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

   useEffect(() => {
    if (!loading && isProfileIncomplete && !notificationShown.current) {
      notificationShown.current = true; // Mark as shown
      toast({
        title: "Seu perfil está quase lá!",
        description: "Um perfil completo atrai mais recrutadores. Clique aqui para atualizar.",
        duration: 8000,
        onClick: () => router.push('/candidate/profile'),
        className: 'cursor-pointer hover:bg-accent'
      });
    }
   }, [loading, isProfileIncomplete, toast, router]);


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

  const getAppliedDate = (timestamp: Application['appliedAt']) => {
      if (!timestamp) return 'Data indisponível';
      return getPostedAt(timestamp).toLocaleDateString('pt-BR');
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
      
      {isProfileIncomplete && (
        <Alert className="mt-8">
          <Megaphone className="h-4 w-4" />
          <AlertTitle>Seu perfil está quase lá!</AlertTitle>
          <AlertDescription className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <p>Um perfil completo atrai mais recrutadores. Mantenha seu currículo atualizado e aumente suas chances!</p>
             <Button asChild className="w-full md:w-auto">
                <Link href="/candidate/profile">Completar Perfil Agora</Link>
             </Button>
          </AlertDescription>
        </Alert>
      )}

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
