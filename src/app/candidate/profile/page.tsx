'use client';

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { resumeAutoFill } from '@/ai/flows/resume-auto-fill';
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

export default function CandidateProfilePage() {
  const { user, loading } = useAuth();
  const { register, setValue, handleSubmit, watch } = useForm();
  const { toast } = useToast();
  const [isParsing, setIsParsing] = useState(false);

  const resumeText = watch('resumeText');

  useEffect(() => {
    if (user) {
      setValue("name", user.displayName || "");
      setValue("email", user.email || "");
      // In a real app, you would fetch and set the rest of the profile data
    }
  }, [user, setValue]);

  const handleAutofill = async () => {
    if (!resumeText) {
       toast({
        variant: "destructive",
        title: "Currículo em branco",
        description: "Cole o texto do seu currículo na área indicada para usar o preenchimento com IA.",
      });
      return;
    }

    setIsParsing(true);
    toast({ title: "Analisando seu currículo...", description: "Aguarde enquanto nossa IA extrai suas informações." });

    try {
      // The current flow expects a data URI, but we can adapt it or the flow.
      // For now, let's create a "fake" data URI from the text to match the flow's expectation.
      // A better approach would be to have a flow that just takes text. I'll adjust the flow.
      const result = await resumeAutoFill({ resumeText });
      
      setValue("name", result.name || user?.displayName);
      setValue("phone", result.phone);
      setValue("experience", result.experience.join('\\n\\n'));
      setValue("skills", result.skills.join(', '));
      // Education is not a field yet, but we could add it.
      
      toast({
        title: "Perfil preenchido!",
        description: "Suas informações foram extraídas do currículo.",
      });

    } catch (error) {
      console.error("Error during AI autofill:", error);
      toast({
        variant: "destructive",
        title: "Erro na análise",
        description: "Não foi possível processar o texto do seu currículo. Verifique o texto e tente novamente.",
      });
    } finally {
      setIsParsing(false);
    }
  };


  const onSubmit = (data: any) => {
    console.log("Profile data saved:", data);
    // Here you would typically update the user's profile in your database
    toast({ title: "Perfil salvo!", description: "Suas informações foram atualizadas."})
  };

  if (loading) {
    return <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">Carregando...</div>;
  }

  if (!user) {
    return <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold">Acesso Negado</h1>
      <p className="mt-1 text-muted-foreground">Você precisa estar logado para ver seu perfil.</p>
      <Link href="/login" className="mt-4 inline-block text-primary underline">Fazer Login</Link>
    </div>
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold">Meu Perfil</h1>
      <p className="mt-1 text-muted-foreground">Mantenha seus dados atualizados para aumentar suas chances.</p>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Currículo</CardTitle>
                <CardDescription>Cole o texto do seu currículo aqui. Nossa IA pode usá-lo para preencher seu perfil automaticamente.</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea placeholder="Cole o conteúdo do seu currículo aqui..." rows={12} {...register("resumeText")} />
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button type="button" onClick={handleAutofill} disabled={isParsing}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isParsing ? 'Analisando...' : 'Preencher perfil com IA'}
                </Button>
            </CardFooter>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Seus dados de contato e informações básicas.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" {...register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" type="tel" placeholder="(51) 91234-5678" {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input id="location" placeholder="Porto Alegre, RS" {...register("location")} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Experiência Profissional</CardTitle>
            <CardDescription>Descreva suas experiências anteriores.</CardDescription>
          </CardHeader>
          <CardContent>
              <Textarea placeholder="Descreva sua experiência aqui..." rows={8} {...register("experience")} />
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Habilidades</CardTitle>
            <CardDescription>Liste suas principais competências (separadas por vírgula).</CardDescription>
          </CardHeader>
          <CardContent>
              <Input placeholder="Ex: React, Vendas, Gestão de Pessoas" {...register("skills")} />
          </CardContent>
        </Card>

        <div className="mt-12 flex justify-end">
          <Button size="lg" type="submit">Salvar Alterações</Button>
        </div>
      </form>
    </div>
  );
}
