'use client';

import { notFound, useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Job } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Skeleton } from '@/components/ui/skeleton';

const applySchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  resume: z.any().refine(files => files?.length > 0, 'Currículo é obrigatório.'),
  coverLetter: z.string().optional(),
});

type ApplyFormValues = z.infer<typeof applySchema>;

export default function ApplyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
  });

   useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', params.id));
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
  }, [params.id]);


  if (loading) {
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

  const onSubmit: SubmitHandler<ApplyFormValues> = async (data) => {
    // Simulate API call for application
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(data);
    toast({
      title: 'Candidatura enviada com sucesso!',
      description: `Sua candidatura para a vaga de ${job.title} foi enviada.`,
    });
    router.push(`/jobs/${job.id}`);
  };

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
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone">Telefone (Opcional)</Label>
              <Input id="phone" type="tel" {...register('phone')} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="resume">Currículo (PDF)</Label>
                <div className="flex items-center justify-center w-full">
                    <Label htmlFor="resume" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Clique para enviar</span> ou arraste e solte</p>
                        </div>
                        <Input id="resume" type="file" className="hidden" {...register('resume')} accept=".pdf" />
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
