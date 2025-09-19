
'use client';

import { notFound, useRouter, useParams } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, Upload } from 'lucide-react';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Job } from '@/lib/types';
import { db } from '@/lib/firebase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';

const MAX_FILE_SIZE = 700 * 1024; // 700 KB

const applySchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  resume: z.any()
    .refine(files => files?.length > 0, 'Currículo é obrigatório.')
    .refine(files => files?.[0]?.size <= MAX_FILE_SIZE, `O arquivo do currículo deve ter no máximo 700KB.`),
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
  const { user, loading: authLoading } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
  });

  useEffect(() => {
    if (user) {
        setValue('name', user.displayName || '');
        setValue('email', user.email || '');
    }
  }, [user, setValue]);

   useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      setLoading(true);
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', jobId));
        if (jobDoc.exists()) {
          setJob({ id: jobDoc.id, ...jobDoc.data() } as Job);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching job:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);


  const onSubmit: SubmitHandler<ApplyFormValues> = async (data) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado para se candidatar.' });
        return;
    }
    if (!job) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Vaga não encontrada.' });
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

  if (loading || authLoading) {
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
          <CardDescription>Preencha suas informações abaixo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              <Label htmlFor="phone">Telefone (Opcional)</Label>
              <Input id="phone" type="tel" {...register('phone')} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="resume">Currículo (PDF, DOC, DOCX - máx 700KB)</Label>
                <div className="flex items-center justify-center w-full">
                    <Label htmlFor="resume" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Clique para enviar</span> ou arraste e solte</p>
                        </div>
                        <Input id="resume" type="file" className="hidden" {...register('resume')} accept=".pdf,.doc,.docx,.rtf,.txt" />
                    </Label>
                </div> 
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
