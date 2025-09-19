
'use client';

import { notFound, useRouter, useParams } from 'next/navigation';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, Upload, CheckCircle, File as FileIcon, X, XCircle } from 'lucide-react';
import { addDoc, collection, doc, getDoc, serverTimestamp, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Job, Application } from '@/lib/types';
import { db } from '@/lib/firebase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';

const MAX_FILE_SIZE = 700 * 1024; // 700 KB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/rtf'
];

const applySchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, "Telefone é obrigatório."),
  socialUrl: z.string().optional(),
  resume: z.any()
    .refine((files) => files?.[0], 'Currículo é obrigatório.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `O arquivo do currículo deve ter no máximo ${MAX_FILE_SIZE / 1024}KB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Formato de arquivo inválido. Apenas PDF, DOC, DOCX, TXT ou RTF são permitidos.'
    ),
  coverLetter: z.string().optional(),
});

type ApplyFormValues = z.infer<typeof applySchema>;

// Helper function to convert file to Base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};


export default function ApplyPage() {
  const params = useParams();
  const jobId = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [existingApplication, setExistingApplication] = useState<Application | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, control, watch } = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
  });

  const selectedFile = watch('resume')?.[0];

  useEffect(() => {
    if (user && userProfile) {
        setValue('name', user.displayName || '');
        setValue('email', user.email || '');
        setValue('phone', userProfile.phone || '');
        setValue('socialUrl', userProfile.linkedinUrl || '');
    }
  }, [user, userProfile, setValue]);

   useEffect(() => {
    if (!jobId) return;

    const fetchJobAndCheckApplication = async () => {
      setLoading(true);
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', jobId));
        if (jobDoc.exists()) {
          setJob({ id: jobDoc.id, ...jobDoc.data() } as Job);
        } else {
          notFound();
          return;
        }

        if (user) {
            setCheckingStatus(true);
            const appsCollection = collection(db, 'applications');
            const q = query(appsCollection, where("jobId", "==", jobId), where("candidateId", "==", user.uid));
            const appSnapshot = await getDocs(q);
            if (!appSnapshot.empty) {
                const appDoc = appSnapshot.docs[0];
                setExistingApplication({ id: appDoc.id, ...appDoc.data() } as Application);
            }
            setCheckingStatus(false);
        }

      } catch (error) {
        console.error("Error fetching job:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    if(!authLoading) {
        fetchJobAndCheckApplication();
    }
  }, [jobId, user, authLoading]);


  const onSubmit: SubmitHandler<ApplyFormValues> = async (data) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado para se candidatar.' });
        return;
    }
    if (!job || job.status === 'Fechada') {
        toast({ variant: 'destructive', title: 'Erro', description: 'Esta vaga não está mais aceitando candidaturas.' });
        return;
    }

    try {
        const resumeFile = data.resume[0] as File;
        
        toast({ title: 'Processando currículo...', description: 'Aguarde um momento.'});
        const base64Resume = await fileToBase64(resumeFile);
        
        const applicationData = {
            jobId: job.id,
            jobTitle: job.title,
            companyName: job.companyName,
            candidateId: user.uid,
            candidateName: data.name,
            candidateEmail: data.email,
            candidatePhone: data.phone,
            candidateSocialUrl: data.socialUrl,
            candidatePhotoUrl: user.photoURL,
            resumeFile: {
                name: resumeFile.name,
                type: resumeFile.type,
                data: base64Resume,
            },
            coverLetter: data.coverLetter || '',
            appliedAt: serverTimestamp(),
            status: 'Em Análise',
        };

        await addDoc(collection(db, 'applications'), applicationData);

        toast({
            title: 'Candidatura enviada com sucesso!',
            description: `Sua candidatura para a vaga de ${job.title} foi enviada.`,
        });
        router.push(`/candidate/dashboard`);
    } catch (error) {
        console.error("Error creating application: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao enviar candidatura",
            description: "Não foi possível salvar sua candidatura. Verifique se o arquivo não é muito grande e tente novamente.",
        });
    }
  };

  const getAppliedDate = (timestamp: Timestamp) => {
      if (!timestamp) return 'Data indisponível';
      return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate().toLocaleDateString('pt-BR');
  }

  if (loading || authLoading || checkingStatus) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-[700px] w-full" />
      </div>
    )
  }

  if (!job) {
    notFound();
  }

  if (job.status === 'Fechada' && !existingApplication) {
      return (
         <div className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
             <div className="mb-8">
                <Button variant="ghost" asChild>
                    <Link href={`/jobs/${job.id}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para a vaga
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader className='text-center'>
                    <XCircle className="mx-auto h-12 w-12 text-destructive" />
                    <CardTitle className="mt-4 text-2xl">Vaga Fechada</CardTitle>
                    <CardDescription>
                       Esta vaga não está mais aceitando candidaturas.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                     <p className='text-sm text-muted-foreground'>Confira outras oportunidades na nossa plataforma.</p>
                     <Button asChild>
                        <Link href="/jobs">Buscar Vagas</Link>
                     </Button>
                </CardContent>
            </Card>
        </div>
      )
  }
  
  if (!user) {
     return (
        <div className="container mx-auto max-w-3xl px-4 py-12 text-center">
            <h1 className='text-2xl font-bold'>Acesso Negado</h1>
            <p className='text-muted-foreground mt-2'>Você precisa estar logado como candidato para se candidatar a uma vaga.</p>
            <Button asChild className='mt-4'>
                <Link href={`/login?redirect=/jobs/${job.id}/apply`}>Fazer Login</Link>
            </Button>
        </div>
     )
  }

  if (existingApplication) {
      return (
        <div className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
             <div className="mb-8">
                <Button variant="ghost" asChild>
                    <Link href={`/jobs/${job.id}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para a vaga
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader className='text-center'>
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    <CardTitle className="mt-4 text-2xl">Você já se candidatou!</CardTitle>
                    <CardDescription>
                        Sua candidatura para a vaga de <span className='font-semibold'>{job.title}</span> foi enviada em {getAppliedDate(existingApplication.appliedAt)}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                     <p className='text-sm text-muted-foreground'>Você pode acompanhar o status no seu painel.</p>
                     <Button asChild>
                        <Link href="/candidate/dashboard">Ir para o painel</Link>
                     </Button>
                </CardContent>
            </Card>
        </div>
      )
  }


  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href={`/jobs/${job.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a vaga
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Candidatar-se para {job.title}</CardTitle>
          <CardDescription>Preencha suas informações abaixo. Se seu perfil estiver completo, alguns dados serão preenchidos automaticamente.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" {...register('email')} disabled />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" type="tel" {...register('phone')} />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                <Label htmlFor="socialUrl">Rede Social (LinkedIn, etc.)</Label>
                <Input id="socialUrl" type="text" placeholder="linkedin.com/in/seu-perfil" {...register('socialUrl')} />
                {errors.socialUrl && <p className="text-sm text-destructive">{errors.socialUrl.message}</p>}
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resume">Currículo (PDF, DOC, DOCX - máx 700KB)</Label>
              <Controller
                control={control}
                name="resume"
                render={({ field: { onChange, onBlur, name, ref } }) => (
                  <div>
                    {!selectedFile ? (
                      <div className="flex items-center justify-center w-full">
                          <Label htmlFor="resume" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Clique para enviar</span> ou arraste e solte</p>
                              </div>
                              <Input 
                                id="resume" 
                                type="file" 
                                className="hidden" 
                                onBlur={onBlur}
                                name={name}
                                ref={ref}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files.length > 0) {
                                    onChange(e.target.files);
                                  }
                                }}
                                accept={ACCEPTED_FILE_TYPES.join(',')} 
                              />
                          </Label>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full h-32 px-4 border-2 border-dashed rounded-lg bg-muted">
                        <div className='flex items-center gap-3'>
                          <FileIcon className='h-8 w-8 text-primary'/>
                          <span className='text-sm font-medium text-foreground truncate'>{selectedFile.name}</span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setValue('resume', null, { shouldValidate: true })}
                        >
                          <X className='h-5 w-5'/>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              />
              {errors.resume && <p className="text-sm text-destructive">{typeof errors.resume.message === 'string' ? errors.resume.message : 'Erro no arquivo'}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="coverLetter">Carta de Apresentação (Opcional)</Label>
              <Textarea id="coverLetter" rows={5} {...register('coverLetter')} />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Candidatura'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
