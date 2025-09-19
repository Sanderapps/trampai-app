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
import { useState } from 'react';
import { Sparkles } from 'lucide-react';

const jobSchema = z.object({
  jobTitle: z.string().min(3, 'Título da vaga é obrigatório'),
  keywords: z.string().min(3, 'Palavras-chave são obrigatórias'),
  jobDescription: z.string().min(50, 'Descrição da vaga é obrigatória'),
  location: z.string().min(3, 'Localização é obrigatória'),
  type: z.string({ required_error: 'Tipo de contrato é obrigatório' }),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  dailyRate: z.coerce.number().optional(),
});

type JobFormValues = z.infer<typeof jobSchema>;

export default function NewJobPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
  });
  
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(data);
    toast({
      title: 'Vaga publicada com sucesso!',
      description: `A vaga de ${data.jobTitle} está agora na plataforma.`,
    });
    router.push('/employer/dashboard');
  };

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
