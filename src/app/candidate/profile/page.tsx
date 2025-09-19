
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useForm, SubmitHandler, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from "@/hooks/use-toast";
import { Bot, CalendarIcon, PlusCircle, Save, Send, Sparkles, Trash2 } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { db } from "@/lib/firebase/client";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";


// Schema for the manual form
const experienceSchema = z.object({
      role: z.string().min(1, "Cargo é obrigatório"),
      company: z.string().min(1, "Empresa é obrigatória"),
      startDate: z.string(),
      endDate: z.string(),
});
const educationSchema = z.object({
      course: z.string().min(1, "Curso é obrigatório"),
      institution: z.string().min(1, "Instituição é obrigatória"),
      endDate: z.string(),
});


const profileSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório.'),
  birthDate: z.date().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  experiences: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  summary: z.string().optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;


export default function CandidateProfilePage() {
  const { user, userProfile, loading, reloadUserData } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Form for manual editing
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      experiences: [],
      education: [],
    }
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control: profileForm.control,
    name: "experiences",
  });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control: profileForm.control,
    name: "education",
  });

  // Helper to safely parse JSON strings from Firestore
  const safeJsonParse = (jsonString: string | undefined | null, fallback: any = []) => {
    if (!jsonString) return fallback;
    try {
        // If it's already an object (from previous state updates), return it
        if (typeof jsonString === 'object' && jsonString !== null) return jsonString;
        return JSON.parse(jsonString);
    } catch (e) {
        console.warn("Falling back to empty array for JSON parsing.", e);
        // If parsing fails, it's likely not a JSON string, so we can't process it.
        return fallback;
    }
  };


  // Populate form with user data on load
  useEffect(() => {
    if (userProfile) {
      profileForm.reset({
        name: userProfile.displayName || '',
        birthDate: userProfile.birthDate ? new Date(userProfile.birthDate) : undefined,
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        experiences: safeJsonParse(userProfile.experience, []),
        education: safeJsonParse(userProfile.education, []),
        summary: userProfile.summary || '',
      });
    }
  }, [userProfile, profileForm]);

  
  useEffect(() => {
    if (!loading && (!user || userProfile?.accountType !== 'candidate')) {
      router.push('/login');
    }
  }, [user, userProfile, loading, router]);
  
  // --- Manual Save Logic ---
  const saveProfile = async (profileData: ProfileFormValues) => {
    if (!user || !userProfile) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado.' });
        return;
    }
    
    try {
        await updateProfile(user, { displayName: profileData.name });
        const userDocRef = doc(db, 'users', user.uid);

        await setDoc(userDocRef, {
            ...userProfile,
            displayName: profileData.name,
            birthDate: profileData.birthDate?.toISOString(),
            phone: profileData.phone,
            location: profileData.location,
            experience: JSON.stringify(profileData.experiences || []),
            education: JSON.stringify(profileData.education || []),
            summary: profileData.summary || '',
        }, { merge: true });

        await reloadUserData();
        toast({ title: 'Perfil Salvo!', description: 'Suas informações foram atualizadas com sucesso.' });
        
    } catch (error) {
        console.error("Error saving profile:", error);
        toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível salvar o seu perfil.' });
    }
  };

  const onManualSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    await saveProfile(data);
  };


  // --- Render Logic ---
  if (loading) {
    return <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">Carregando...</div>;
  }

  if (!user || !userProfile || userProfile.accountType !== 'candidate') {
    return <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold">Acesso Negado</h1>
      <p className="mt-1 text-muted-foreground">Você precisa estar logado como candidato para ver seu perfil.</p>
      <Link href="/login" className="mt-4 inline-block text-primary underline">Fazer Login</Link>
    </div>
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div>
            <h1 className="font-headline text-3xl font-bold">Meu Currículo</h1>
            <p className="mt-1 text-muted-foreground">Mantenha suas informações atualizadas para facilitar suas candidaturas.</p>
        </div>

        {/* Manual Profile Form */}
        <form onSubmit={profileForm.handleSubmit(onManualSubmit)} className="space-y-8 mt-8">
             <Card>
                <CardHeader>
                    <CardTitle>Informações Pessoais e de Contato</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" {...profileForm.register("name")} />
                        {profileForm.formState.errors.name && <p className="text-sm text-destructive">{profileForm.formState.errors.name.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="birthDate">Data de Nascimento</Label>
                          <Controller
                            control={profileForm.control}
                            name="birthDate"
                            render={({ field }) => (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                            locale={ptBR}
                                            captionLayout="dropdown-buttons"
                                            fromYear={1950}
                                            toYear={new Date().getFullYear()}
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" {...profileForm.register("phone")} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="location">Cidade e Estado</Label>
                        <Input id="location" placeholder="Ex: Porto Alegre, RS" {...profileForm.register("location")} />
                    </div>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Experiência Profissional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {expFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                       <div className="space-y-2">
                          <Label>Cargo</Label>
                          <Input {...profileForm.register(`experiences.${index}.role`)} />
                       </div>
                        <div className="space-y-2">
                          <Label>Empresa</Label>
                          <Input {...profileForm.register(`experiences.${index}.company`)} />
                       </div>
                        <div className="space-y-2">
                          <Label>Data de Início</Label>
                          <Input placeholder="MM/AAAA" {...profileForm.register(`experiences.${index}.startDate`)} />
                       </div>
                        <div className="space-y-2">
                          <Label>Data de Término</Label>
                          <Input placeholder="MM/AAAA ou Atual" {...profileForm.register(`experiences.${index}.endDate`)} />
                       </div>
                     </div>
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeExp(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendExp({ role: '', company: '', startDate: '', endDate: '' })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Experiência
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Formação Acadêmica e Cursos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {eduFields.map((field, index) => (
                   <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Curso/Formação</Label>
                          <Input {...profileForm.register(`education.${index}.course`)} />
                       </div>
                        <div className="space-y-2">
                          <Label>Instituição</Label>
                          <Input {...profileForm.register(`education.${index}.institution`)} />
                       </div>
                        <div className="sm:col-span-2 space-y-2">
                          <Label>Ano de Conclusão</Label>
                          <Input placeholder="Ex: 2020" {...profileForm.register(`education.${index}.endDate`)} />
                       </div>
                     </div>
                     <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeEdu(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                  </div>
                ))}
                 <Button type="button" variant="outline" onClick={() => appendEdu({ course: '', institution: '', endDate: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Formação
                </Button>
              </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Sobre mim (Opcional)</CardTitle>
                    <CardDescription>Faça um breve resumo sobre você, suas paixões e objetivos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea 
                        rows={5}
                        placeholder="Escreva um pouco sobre você..."
                        {...profileForm.register("summary")}
                    />
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {profileForm.formState.isSubmitting ? 'Salvando...' : 'Salvar Currículo'}
                </Button>
            </div>
        </form>
    </div>
  );
}

    