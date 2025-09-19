
'use client';

import { notFound, useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, doc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { ArrowLeft, Download, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase/client';
import { Job, Application } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function ApplicantsPage() {
  const params = useParams();
  const jobId = params.id as string;
  const { user, userProfile, loading: authLoading } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      // Role check
      if (userProfile && userProfile.accountType !== 'employer') {
        router.push('/candidate/dashboard');
        return;
      }

      setLoading(true);
      try {
        // Fetch Job Details
        const jobDocRef = doc(db, 'jobs', jobId);
        const jobDoc = await getDoc(jobDocRef);

        if (!jobDoc.exists() || jobDoc.data().employerId !== user.uid) {
          notFound();
          return;
        }
        setJob({ id: jobDoc.id, ...jobDoc.data() } as Job);

        // Fetch Applications
        const appsCollection = collection(db, 'applications');
        const q = query(appsCollection, where("jobId", "==", jobId));
        const appSnapshot = await getDocs(q);
        const appList = appSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
        setApplications(appList);

      } catch (error) {
        console.error("Error fetching job and applicants:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (user) {
        fetchData();
      } else {
        router.push('/login');
      }
    }
  }, [jobId, user, userProfile, authLoading, router]);

  const getAppliedDate = (timestamp: Timestamp) => {
      if (!timestamp) return 'Data indisponível';
      return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate().toLocaleDateString('pt-BR');
  }

  const handleDownload = (app: Application) => {
    if (!app.resumeFile) return;

    const link = document.createElement('a');
    link.href = app.resumeFile.data;
    link.download = app.resumeFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  if (loading || authLoading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-12 w-96 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user || !userProfile || userProfile.accountType !== 'employer') {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground mt-2">Você precisa estar logado como empregador para ver esta página.</p>
        <Button asChild className="mt-4"><Link href="/login">Fazer Login</Link></Button>
      </div>
    );
  }

  if (!job) {
    return notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href="/employer/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o painel
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Candidatos para {job.title}</CardTitle>
          <CardDescription>
            {applications.length} {applications.length === 1 ? 'candidatura recebida' : 'candidaturas recebidas'} para esta vaga.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidato</TableHead>
                  <TableHead className="hidden sm:table-cell">Data da Aplicação</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right">Currículo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map(app => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="font-medium">{app.candidateName}</div>
                      <div className="text-sm text-muted-foreground">{app.candidateEmail}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{getAppliedDate(app.appliedAt)}</TableCell>
                    <TableCell className="hidden md:table-cell"><Badge>{app.status}</Badge></TableCell>
                    <TableCell className="text-right">
                       <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!app.resumeFile}
                          onClick={() => handleDownload(app)}
                        >
                          <Download className="mr-2 h-4 w-4"/>
                          Baixar
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-16 text-center text-muted-foreground">
              <p>Nenhuma candidatura recebida para esta vaga ainda.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
