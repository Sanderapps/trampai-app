

'use client';

import { notFound, useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, doc, getDoc, getDocs, query, where, Timestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { ArrowLeft, Download, Eye, User, Phone, Mail, FileText, Briefcase, Sparkles, MapPin, Share2, Star } from 'lucide-react';
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
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';
import { useToast } from '@/hooks/use-toast';

function formatSocialUrl(url: string) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `https://${url}`;
}

function formatPhoneNumberForLink(phone: string, countryCode = '55') {
  if (!phone) return '';
  const digitsOnly = phone.replace(/\D/g, '');
  return `${countryCode}${digitsOnly}`;
}


export default function ApplicantsPage() {
  const params = useParams();
  const jobId = params.id as string;
  const { user, userProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const [selectedCandidate, setSelectedCandidate] = useState<UserProfile | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchJobAndApplicants = async (userId: string) => {
      setLoading(true);
      try {
        const jobDocRef = doc(db, 'jobs', jobId);
        const jobDoc = await getDoc(jobDocRef);

        if (!jobDoc.exists() || jobDoc.data().employerId !== userId) {
          notFound();
          return;
        }
        const jobData = { id: jobDoc.id, ...jobDoc.data() } as Job;
        setJob(jobData);

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


  useEffect(() => {
    if (!authLoading) {
      if (user) {
        if (userProfile && userProfile.accountType !== 'employer') {
            router.push('/candidate/dashboard');
            return;
        }
        fetchJobAndApplicants(user.uid);
      } else {
        router.push('/login');
      }
    }
  }, [jobId, user, userProfile, authLoading, router]);

  const handleHireCandidate = async (applicationToHire: Application) => {
    if (job?.status === 'Fechada' || isUpdatingStatus) return; // Prevent multiple hires

    setIsUpdatingStatus(true);
    const batch = writeBatch(db);

    // 1. Update the job status to 'Fechada'
    const jobRef = doc(db, 'jobs', jobId);
    batch.update(jobRef, { status: 'Fechada' });

    // 2. Update the hired candidate's status
    const hiredAppRef = doc(db, 'applications', applicationToHire.id);
    batch.update(hiredAppRef, { status: 'Contratado' });

    // 3. Update other candidates' status
    applications.forEach(app => {
      if (app.id !== applicationToHire.id && app.status === 'Em Análise') {
        const appRef = doc(db, 'applications', app.id);
        batch.update(appRef, { status: 'Vaga Preenchida' });
      }
    });

    try {
      await batch.commit();
      toast({
        title: "Candidato Contratado!",
        description: `${applicationToHire.candidateName} foi marcado como contratado. A vaga foi fechada.`,
      });
      // Refresh data locally to reflect status changes
      if(user) fetchJobAndApplicants(user.uid);
    } catch (error) {
      console.error("Error hiring candidate: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao contratar",
        description: "Não foi possível atualizar o status dos candidatos e da vaga.",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };


  const handleViewProfile = async (application: Application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
    setIsModalLoading(true);
    try {
      const userDocRef = doc(db, 'users', application.candidateId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const candidateData = userDoc.data() as UserProfile;
        setSelectedCandidate({
            ...candidateData,
            photoURL: application.candidatePhotoUrl ?? undefined,
            displayName: application.candidateName
        });

      }
    } catch (error) {
      console.error("Error fetching candidate profile:", error);
    } finally {
      setIsModalLoading(false);
    }
  };

  const getAppliedDate = (timestamp: Application['appliedAt']) => {
      if (!timestamp) return 'Data indisponível';
      return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate().toLocaleDateString('pt-BR');
  }

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
  
  const getBadgeVariant = (status: Application['status']) => {
    switch (status) {
      case 'Contratado': return 'default';
      case 'Rejeitado': return 'destructive';
      case 'Vaga Preenchida': return 'secondary';
      default: return 'outline';
    }
  };
  
  const isJobClosed = job.status === 'Fechada';
  const hiredCandidateId = applications.find(app => app.status === 'Contratado')?.candidateId;
  const cleanPhoneNumber = formatPhoneNumberForLink(selectedApplication?.candidatePhone || '');

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
          <div className='flex items-center justify-between'>
            <div className='flex-1'>
              <CardTitle className="text-2xl">Candidatos para {job.title}</CardTitle>
              <CardDescription>
                {applications.length} {applications.length === 1 ? 'candidatura recebida' : 'candidaturas recebidas'} para esta vaga.
              </CardDescription>
            </div>
             {isJobClosed && <Badge variant="destructive">Vaga Fechada</Badge>}
          </div>
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
                    <TableCell className="hidden md:table-cell">
                        <Badge variant={getBadgeVariant(app.status)}>{app.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                       <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewProfile(app)}
                          disabled={isUpdatingStatus}
                        >
                          <Eye className="mr-2 h-4 w-4"/>
                          Ver Perfil
                       </Button>
                       <Button 
                          variant="secondary"
                          size="sm"
                          onClick={() => handleHireCandidate(app)}
                          disabled={isJobClosed || isUpdatingStatus}
                        >
                            <Star className="mr-2 h-4 w-4" />
                            {hiredCandidateId === app.candidateId ? "Contratado" : "Contratar"}
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
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                             <Avatar className="h-24 w-24 border-2 border-primary">
                                <AvatarImage src={selectedCandidate.photoURL ?? undefined} alt={selectedCandidate.displayName ?? ""} />
                                <AvatarFallback className="text-3xl">{selectedCandidate.displayName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className='flex-1 space-y-2'>
                                <h2 className="text-2xl font-bold">{selectedCandidate.displayName}</h2>
                                <div className="flex flex-col gap-2 text-muted-foreground">
                                    <span className='flex items-center gap-2'><Mail className='h-4 w-4'/>{selectedCandidate.email}</span>
                                    {selectedApplication?.candidatePhone && <span className='flex items-center gap-2'><Phone className='h-4 w-4'/>{selectedApplication.candidatePhone}</span>}
                                    {selectedCandidate.location && <span className='flex items-center gap-2'><MapPin className='h-4 w-4'/>{selectedCandidate.location}</span>}
                                </div>
                                {selectedCandidate.linkedinUrl && (
                                     <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                                        <Share2 className="h-4 w-4"/>
                                        <a href={formatSocialUrl(selectedCandidate.linkedinUrl)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            {selectedCandidate.linkedinUrl}
                                        </a>
                                    </div>
                                )}
                            </div>
                            {selectedApplication?.candidatePhone && (
                                <div className='flex flex-col sm:flex-row gap-2'>
                                     <Button asChild size="sm">
                                        <a href={`https://wa.me/${cleanPhoneNumber}`} target='_blank' rel="noopener noreferrer">
                                            <WhatsappIcon className='mr-2 h-4 w-4' />
                                            WhatsApp
                                        </a>
                                    </Button>
                                    <Button asChild variant="outline" size="sm">
                                        <a href={`tel:${cleanPhoneNumber}`}>
                                            <Phone className='mr-2 h-4 w-4' />
                                            Ligar
                                        </a>
                                    </Button>
                                </div>
                             )}
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

                        {selectedCandidate.education && (
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><FileText className='h-5 w-5 text-primary'/> Educação</h3>
                                 <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
                                    {selectedCandidate.education}
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

    