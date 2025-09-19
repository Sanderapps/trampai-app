'use client';

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resumeAutoFill } from '@/ai/flows/resume-auto-fill';
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

// Define Zod schema for form validation
const profileSchema = z.object({
    name: z.string().min(2, "Nome é obrigatório."),
    email: z.string().email(),
    phone: z.string().min(10, "Telefone é obrigatório."),
    location: z.string().optional(),
    linkedinUrl: z.string().url("Por favor, insira uma URL válida.").optional().or(z.literal('')),
    experience: z.string().optional(),
    skills: z.string().optional(),
    resumeText: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;


// Helper function to resize and optimize image
const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.8)); // 80% quality JPEG
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};


export default function CandidateProfilePage() {
  const { user, userProfile, loading, reloadUserData } = useAuth();
  const router = useRouter();
  const { register, setValue, handleSubmit, watch, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema)
  });
  const { toast } = useToast();
  const [isParsing, setIsParsing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(user?.photoURL);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const resumeText = watch('resumeText');

  useEffect(() => {
    if (user && userProfile) {
      setValue("name", user.displayName || "");
      setValue("email", user.email || "");
      setPhotoUrl(user.photoURL);
      
      const fetchProfileData = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            setValue("phone", data.phone);
            setValue("location", data.location);
            setValue("linkedinUrl", data.linkedinUrl);
            setValue("experience", data.experience);
            setValue("skills", data.skills);
            setValue("resumeText", data.resumeText);
        }
      }
      fetchProfileData();

    } else if (!loading && (!user || userProfile?.accountType !== 'candidate')) {
      router.push('/login');
    }
  }, [user, userProfile, loading, setValue, router]);

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
      const result = await resumeAutoFill({ resumeText });
      
      setValue("name", result.name || user?.displayName, { shouldValidate: true });
      setValue("phone", result.phone, { shouldValidate: true });
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

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit before optimization
        toast({
            variant: "destructive",
            title: "Arquivo muito grande",
            description: "A foto de perfil deve ter no máximo 5MB.",
        });
        return;
    }

    try {
        toast({ title: "Otimizando imagem..."});
        const resizedPhoto = await resizeImage(file);
        
        await updateProfile(auth.currentUser!, { photoURL: resizedPhoto });
        setPhotoUrl(resizedPhoto);
        reloadUserData(); // Refresh user data in context
        toast({
            title: "Foto de perfil atualizada!",
        });
    } catch (error) {
        console.error("Error uploading photo:", error);
        toast({
            variant: "destructive",
            title: "Erro ao enviar foto",
            description: "Não foi possível atualizar sua foto de perfil.",
        });
    }
  }


  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    try {
        await updateProfile(user, { displayName: data.name });
        
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
            ...userProfile,
            phone: data.phone,
            location: data.location,
            linkedinUrl: data.linkedinUrl,
            experience: data.experience,
            skills: data.skills,
            resumeText: data.resumeText,
        }, { merge: true });

        reloadUserData();
        toast({ title: "Perfil salvo!", description: "Suas informações foram atualizadas."})
    } catch(e) {
        console.error("Error saving profile: ", e);
        toast({ variant: "destructive", title: "Erro ao salvar", description: "Não foi possível atualizar seu perfil."})
    }
  };

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
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={photoUrl ?? undefined} alt={user.displayName ?? ""} />
                <AvatarFallback className="text-3xl">{user.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
             <Button 
                variant="outline"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full"
                onClick={() => fileInputRef.current?.click()}
             >
                <Camera className="h-4 w-4" />
             </Button>
             <Input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg"
                onChange={handlePhotoUpload}
            />
        </div>
        <div>
            <h1 className="font-headline text-3xl font-bold">{user.displayName}</h1>
            <p className="mt-1 text-muted-foreground">Mantenha seus dados atualizados para aumentar suas chances.</p>
        </div>
      </div>
      
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
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" type="tel" placeholder="(51) 91234-5678" {...register("phone")} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Localização (Opcional)</Label>
              <Input id="location" placeholder="Porto Alegre, RS" {...register("location")} />
            </div>
             <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn (Opcional)</Label>
              <Input id="linkedinUrl" type="url" placeholder="https://www.linkedin.com/in/seu-perfil" {...register("linkedinUrl")} />
              {errors.linkedinUrl && <p className="text-sm text-destructive">{errors.linkedinUrl.message}</p>}
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
