
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateJobDescription } from '@/ai/flows/job-description-assistant';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { companies } from '@/lib/data';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';

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

export default function NewJobPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
     defaultValues: {
      benefits: {
        hasCommission: false,
        hasVT: false,
        hasVR: false,
        hasVA: false,
        hasHealthPlan: false,
        others: Array(5).fill(''),
      },
    },
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/employer/jobs/new');
      } else if (userProfile && userProfile.accountType !== 'employer') {
        toast({ variant: 'destructive', title: 'Acesso Negado', description: 'Você deve ser um empregador para postar vagas.'});
        router.push('/candidate/dashboard');
      }
    }
  }, [user, userProfile, authLoading, router, toast]);
  
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
        toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado como empregador para publicar uma vaga.' });
        return;
    }

    try {
        // In a real app, the employer would be linked to a company profile.
        // For now, we mock finding a company for the logged-in user.
        const company = companies[0]; 
        
        const jobData = {
            title: data.jobTitle,
            description: data.jobDescription,
            location: data.location,
            type: data.type,
            status: 'Aberta', // New field
            keywords: data.keywords.split(',').map(k => k.trim()),
            postedAt: serverTimestamp(),
            companyId: company?.id,
            companyName: company?.name,
            employerId: user.uid,
            salary: (data.salaryMin || data.salaryMax) ? { min: data.salaryMin || null, max: data.salaryMax || null } : null,
            dailyRate: data.dailyRate || null,
            benefits: {
                ...data.benefits,
                others: data.benefits.others?.filter(b => b.trim() !== '') || [], // Clean up empty strings
            },
        };

        await addDoc(collection(db, 'jobs'), jobData);

        toast({
            title: 'Vaga publicada com sucesso!',
            description: `A vaga de ${data.jobTitle} está agora na plataforma.`,
        });
        router.push('/employer/dashboard');
    } catch (error) {
        console.error("Error adding document: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao publicar vaga",
            description: "Não foi possível salvar a vaga no banco de dados. Verifique suas permissões de escrita no Firestore.",
        });
    }
  };

  if (authLoading) {
    return <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">Carregando...</div>;
  }

  if (!user || !userProfile || userProfile.accountType !== 'employer') {
     return (
        <div className="container mx-auto max-w-4xl px-4 py-12 text-center">
            <h1 className='text-2xl font-bold'>Acesso Negado</h1>
            <p className='text-muted-foreground mt-2'>Você precisa estar logado como empregador para publicar uma vaga.</p>
            <Button asChild className='mt-4'>
                <Link href={`/login?redirect=/employer/jobs/new`}>Fazer Login</Link>
            </Button>
        </div>
     )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Publicar Nova Vaga</CardTitle>
          <CardDescription>Preencha os detalhes da oportunidade.</CardDescription>
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
                <Select onValueChange={(value) => setValue('type', value, { shouldValidate: true })}>
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
                  <Checkbox id="hasCommission" {...register('benefits.hasCommission')} />
                  <Label htmlFor="hasCommission">Comissão</Label>
                </div>
                 <div className="flex items-center space-x-2">
                  <Checkbox id="hasVT" {...register('benefits.hasVT')} />
                  <Label htmlFor="hasVT">Vale-transporte (VT)</Label>
                </div>
                 <div className="flex items-center space-x-2">
                  <Checkbox id="hasVR" {...register('benefits.hasVR')} />
                  <Label htmlFor="hasVR">Vale-refeição (VR)</Label>
                </div>
                 <div className="flex items-center space-x-2">
                  <Checkbox id="hasVA" {...register('benefits.hasVA')} />
                  <Label htmlFor="hasVA">Vale-alimentação (VA)</Label>
                </div>
                 <div className="flex items-center space-x-2">
                  <Checkbox id="hasHealthPlan" {...register('benefits.hasHealthPlan')} />
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
                    {isSubmitting ? 'Publicando...' : 'Publicar Vaga'}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
