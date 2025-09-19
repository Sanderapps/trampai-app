'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, notFound, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateJobDescription } from '@/ai/flows/job-description-assistant';
import { useEffect, useState } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { Job } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const jobSchema = z.object({
  jobTitle: z.string().min(3, 'Título da vaga é obrigatório'),
  keywords: z.string().min(3, 'Palavras-chave são obrigatórias'),
  jobDescription: z.string().min(50, 'Descrição da vaga é obrigatória'),
  location: z.string().min(3, 'Localização é obrigatória'),
  type: z.string({ required_error: 'Tipo de contrato é obrigatório' }),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  dailyRate: z.coerce.number().optional(),
  benefits: z.object({
    hasCommission: z.boolean().default(false),
    hasVT: z.boolean().default(false),
    hasVR: z.boolean().default(false),
    hasVA: z.boolean().default(false),
    hasHealthPlan: z.boolean().default(false),
    others: z.array(z.string()).max(5, "Você pode adicionar no máximo 5 benefícios personalizados.").optional(),
  }).default({}),
});

type JobFormValues = z.infer<typeof jobSchema>;

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const { toast } = useToast();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobLoading, setJobLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
     defaultValues: {
      benefits: {
        hasCommission: false,
        hasVT: false,
        hasVR: false,
        hasVA: false,
        hasHealthPlan: false,
        others: [],
      },
    },
  });

  useEffect(() => {
    if (!jobId) return;

    const fetchJobData = async () => {
        setJobLoading(true);
        try {
            const jobDocRef = doc(db, 'jobs', jobId);
            const docSnap = await getDoc(jobDocRef);

            if (docSnap.exists() && docSnap.data().employerId === user?.uid) {
                const data = docSnap.data() as Job;
                setJob(data);
                setValue('jobTitle', data.title);
                setValue('keywords', data.keywords?.join(', ') || '');
                setValue('jobDescription', data.description);
                setValue('location', data.location);
                setValue('type', data.type);
                if (data.salary) {
                    setValue('salaryMin', data.salary.min);
                    setValue('salaryMax', data.salary.max);
                }
                if (data.dailyRate) {
                    setValue('dailyRate', data.dailyRate);
                }
                 if (data.benefits) {
                    setValue('benefits.hasCommission', data.benefits.hasCommission);
                    setValue('benefits.hasVT', data.benefits.hasVT);
                    setValue('benefits.hasVR', data.benefits.hasVR);
                    setValue('benefits.hasVA', data.benefits.hasVA);
                    setValue('benefits.hasHealthPlan', data.benefits.hasHealthPlan);
                    // Ensure 'others' is an array of 5, padding with empty strings if necessary
                    const others = (Array.isArray(data.benefits.others) ? data.benefits.others : Object.values(data.benefits.others || {})).filter(b => typeof b === 'string' && b);
                    const paddedOthers = Array.from({ length: 5 }, (_, i) => others[i] || '');
                    setValue('benefits.others', paddedOthers);
                }
            } else {
                notFound();
            }
        } catch(e) {
            console.error(e);
            notFound();
        } finally {
            setJobLoading(false);
        }
    }

    if(user) {
        fetchJobData();
    }

  }, [jobId, user, setValue]);


  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push(`/login?redirect=/employer/jobs/${jobId}/edit`);
      } else if (userProfile && userProfile.accountType !== 'employer') {
        toast({ variant: 'destructive', title: 'Acesso Negado', description: 'Você deve ser um empregador para editar vagas.'});
        router.push('/candidate/dashboard');
      }
    }
  }, [user, userProfile, authLoading, router, toast, jobId]);
  
  const jobTitle = watch('jobTitle');
  const keywords = watch('keywords');
  const contractType = watch('type');

  const handleGenerateDescription = async () => {
    if (!jobTitle || !keywords) {
      toast({
        variant: "destructive",
        title: "Ops!",
        description: "Preencha o título da vaga e as palavras-chave para gerar uma descrição.",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateJobDescription({ jobTitle, keywords });
      setValue('jobDescription', result.jobDescription, { shouldValidate: true });
       toast({
        title: "Descrição gerada!",
        description: "A descrição da vaga foi preenchida com a ajuda da nossa IA.",
      });
    } catch (error) {
      console.error(error);
       toast({
        variant: "destructive",
        title: "Erro ao gerar descrição",
        description: "Não foi possível gerar a descrição. Tente novamente.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit: SubmitHandler<JobFormValues> = async (data) => {
    if (!user || userProfile?.accountType !== 'employer') {
        toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado como empregador para editar uma vaga.' });
        return;
    }

    try {
        const jobDocRef = doc(db, 'jobs', jobId);
        
        const jobData = {
            title: data.jobTitle,
            description: data.jobDescription,
            location: data.location,
            type: data.type,
            keywords: data.keywords.split(',').map(k => k.trim()),
            salary: (data.salaryMin || data.salaryMax) ? { min: data.salaryMin || null, max: data.salaryMax || null } : null,
            dailyRate: data.dailyRate || null,
            benefits: {
                ...data.benefits,
                others: data.benefits.others?.filter(b => b.trim() !== '') || [], // Clean up empty strings
            },
        };

        await updateDoc(jobDocRef, jobData);

        toast({
            title: 'Vaga atualizada com sucesso!',
            description: `A vaga de ${data.jobTitle} foi modificada.`,
        });
        router.push('/employer/dashboard');
    } catch (error) {
        console.error("Error updating document: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao atualizar vaga",
            description: "Não foi possível salvar as alterações. Tente novamente.",
        });
    }
  };

  if (authLoading || jobLoading) {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <Skeleton className='h-96 w-full' />
        </div>
    );
  }

  if (!user || !userProfile || userProfile.accountType !== 'employer' || !job) {
     return notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
       <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href="/employer/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar e voltar
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Editar Vaga</CardTitle>
          <CardDescription>Modifique os detalhes da oportunidade abaixo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="jobTitle">Título da Vaga</Label>
                    <Input id="jobTitle" {...register('jobTitle')} />
                    {errors.jobTitle && <p className="text-sm text-destructive">{errors.jobTitle.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="keywords">Palavras-chave</Label>
                    <Input id="keywords" placeholder="Ex: React, Node, SQL" {...register('keywords')} />
                    {errors.keywords && <p className="text-sm text-destructive">{errors.keywords.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="jobDescription">Descrição da Vaga</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
                   <Sparkles className="mr-2 h-4 w-4" />
                   {isGenerating ? 'Gerando...' : 'Gerar com IA'}
                </Button>
              </div>
              <Textarea id="jobDescription" rows={10} {...register('jobDescription')} />
              {errors.jobDescription && <p className="text-sm text-destructive">{errors.jobDescription.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input id="location" placeholder="Ex: Porto Alegre, RS ou Remoto" {...register('location')} />
                {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Tipo de Contrato</Label>
                <Select onValueChange={(value) => setValue('type', value, { shouldValidate: true })} value={contractType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="Estágio">Estágio</SelectItem>
                    <SelectItem value="Extra/Freelancer">Extra/Freelancer</SelectItem>
                  </SelectContent>
                </Select>
                 {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
              </div>
            </div>

            {contractType === 'Extra/Freelancer' ? (
                <div className="space-y-2">
                    <Label htmlFor="dailyRate">Valor da Diária (opcional)</Label>
                    <Input id="dailyRate" type="number" placeholder="Ex: 300" {...register('dailyRate')} />
                </div>
            ) : (
                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Salário (mínimo, opcional)</Label>
                    <Input id="salaryMin" type="number" placeholder="Ex: 4000" {...register('salaryMin')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Salário (máximo, opcional)</Label>
                    <Input id="salaryMax" type="number" placeholder="Ex: 6000" {...register('salaryMax')} />
                  </div>
                </div>
            )}

            <div className="space-y-4">
              <Label>Benefícios</Label>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="hasCommission" onCheckedChange={(checked) => setValue('benefits.hasCommission', !!checked)} checked={watch('benefits.hasCommission')} />
                  <Label htmlFor="hasCommission">Comissão</Label>
                </div>
                 <div className="flex items-center space-x-2">
                  <Checkbox id="hasVT" onCheckedChange={(checked) => setValue('benefits.hasVT', !!checked)} checked={watch('benefits.hasVT')} />
                  <Label htmlFor="hasVT">Vale-transporte (VT)</Label>
                </div>
                 <div className="flex items-center space-x-2">
                  <Checkbox id="hasVR" onCheckedChange={(checked) => setValue('benefits.hasVR', !!checked)} checked={watch('benefits.hasVR')} />
                  <Label htmlFor="hasVR">Vale-refeição (VR)</Label>
                </div>
                 <div className="flex items-center space-x-2">
                  <Checkbox id="hasVA" onCheckedChange={(checked) => setValue('benefits.hasVA', !!checked)} checked={watch('benefits.hasVA')} />
                  <Label htmlFor="hasVA">Vale-alimentação (VA)</Label>
                </div>
                 <div className="flex items-center space-x-2">
                  <Checkbox id="hasHealthPlan" onCheckedChange={(checked) => setValue('benefits.hasHealthPlan', !!checked)} checked={watch('benefits.hasHealthPlan')} />
                  <Label htmlFor="hasHealthPlan">Plano de Saúde</Label>
                </div>
              </div>
               <div className="space-y-2">
                <Label>Outros benefícios (até 5)</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[...Array(5)].map((_, index) => (
                    <Input
                      key={index}
                      placeholder={`Benefício ${index + 1}`}
                      {...register(`benefits.others.${index}` as const)}
                    />
                  ))}
                </div>
                 {errors.benefits?.others && <p className="text-sm text-destructive">{errors.benefits.others.message}</p>}
              </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
