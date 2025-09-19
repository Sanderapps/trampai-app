'use client';

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function CandidateProfilePage() {
  const { user, loading } = useAuth();
  const { register, setValue, handleSubmit } = useForm();

  useEffect(() => {
    if (user) {
      setValue("name", user.displayName || "");
      setValue("email", user.email || "");
    }
  }, [user, setValue]);

  const onSubmit = (data: any) => {
    console.log("Profile data saved:", data);
    // Here you would typically update the user's profile in your database
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
          <CardFooter className="flex justify-end">
              <Button variant="outline" type="button">Adicionar Experiência</Button>
          </CardFooter>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Habilidades</CardTitle>
            <CardDescription>Liste suas principais competências.</CardDescription>
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
