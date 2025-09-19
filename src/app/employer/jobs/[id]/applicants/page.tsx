'use client';

import { notFound, useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, doc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { ArrowLeft, Download, Eye, User, Phone, Mail, FileText, Briefcase, Sparkles, MapPin, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase/client';
import { Job, Application, UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function ApplicantsPage() {
  const params = useParams();
  const jobId = params.id as string;
  const { user, userProfile, loading: authLoading } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const [selectedCandidate, setSelectedCandidate] = useState<UserProfile | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      if (userProfile && userProfile.accountType !== 'employer') {
        router.push('/candidate/dashboard');
        return;
      }

      setLoading(true);
      try {
        const jobDocRef = doc(db, 'jobs', jobId);
        const jobDoc = await getDoc(jobDocRef);

        if (!jobDoc.exists() || jobDoc.data().employerId !== user.uid) {
          notFound();
          return;
        }
        setJob({ id: jobDoc.id, ...jobDoc.data() } as Job);

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

  const handleViewProfile = async (application: Application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
    setIsModalLoading(true);
    try {
      const userDocRef = doc(db, 'users', application.candidateId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const candidateData = userDoc.data() as UserProfile;
        // Fetch the latest photoURL from the auth user object if available
        // This is a placeholder, in a real app you might need a server function to get this securely
        const authUserSnap = await getDoc(doc(db, 'users', application.candidateId));
        if(authUserSnap.exists()) {
            const authUserData = authUserSnap.data();
             // This is a simplification. In a real app, the user's photoURL should be stored with their profile.
        }

        setSelectedCandidate(candidateData);
      }
    } catch (error) {
      console.error("Error fetching candidate profile:", error);
    } finally {
      setIsModalLoading(false);
    }
  };

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
                  <TableHead className="hidden sm:table-cell">Data</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
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
                    <TableCell className="text-right space-x-2">
                       <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewProfile(app)}
                        >
                          <Eye className="mr-2 h-4 w-4"/>
                          Ver Perfil
                       </Button>
                       <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!app.resumeFile}
                          onClick={() => handleDownload(app)}
                        >
                          <Download className="mr-2 h-4 w-4"/>
                          Currículo
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>Perfil do Candidato</DialogTitle>
                <DialogDescription>
                    Informações detalhadas sobre {selectedApplication?.candidateName}.
                </DialogDescription>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto pr-4">
                {isModalLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                ) : selectedCandidate ? (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                             <Avatar className="h-24 w-24 border-2 border-primary">
                                {/* In a real app, you would get the photoURL from the user profile */}
                                <AvatarFallback className="text-3xl">{selectedCandidate.displayName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className='space-y-1'>
                                <h2 className="text-2xl font-bold">{selectedCandidate.displayName}</h2>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
                                    <span className='flex items-center gap-2'><Mail className='h-4 w-4'/>{selectedCandidate.email}</span>
                                    {selectedApplication?.candidatePhone && <span className='flex items-center gap-2'><Phone className='h-4 w-4'/>{selectedApplication.candidatePhone}</span>}
                                    {selectedCandidate.location && <span className='flex items-center gap-2'><MapPin className='h-4 w-4'/>{selectedCandidate.location}</span>}
                                </div>
                                {selectedApplication?.candidateSocialUrl && (
                                     <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                                        <Share2 className="h-4 w-4"/>
                                        <a href={selectedApplication.candidateSocialUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            {selectedApplication.candidateSocialUrl}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {selectedCandidate.skills && (
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><Sparkles className='h-5 w-5 text-primary'/> Habilidades</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCandidate.skills.split(',').map(skill => skill.trim()).filter(Boolean).map(skill => (
                                        <Badge key={skill} variant="secondary">{skill}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {selectedCandidate.experience && (
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><Briefcase className='h-5 w-5 text-primary'/> Experiência</h3>
                                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
                                    {selectedCandidate.experience}
                                </div>
                            </div>
                        )}

                        {selectedApplication?.coverLetter && (
                             <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><FileText className='h-5 w-5 text-primary'/> Carta de Apresentação</h3>
                                 <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
                                    {selectedApplication.coverLetter}
                                </div>
                            </div>
                        )}

                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-16">
                        <p>Não foi possível carregar o perfil do candidato.</p>
                    </div>
                )}
            </div>
             <DialogClose asChild>
                <Button type="button" variant="secondary" className="mt-4">
                    Fechar
                </Button>
            </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
