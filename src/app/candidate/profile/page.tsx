
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from "@/hooks/use-toast";
import { Bot, Save, Send, Sparkles } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { db } from "@/lib/firebase/client";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { conversationalResume } from "@/ai/flows/conversational-resume";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConversationMessage, ProfileData, Experience, Education } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Schema for the manual form
const profileSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório.'),
  phone: z.string().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  skills: z.string().optional(),
  experiences: z.array(z.object({
      role: z.string(),
      company: z.string(),
      startDate: z.string(),
      endDate: z.string(),
  })).optional(),
  education: z.array(z.object({
      course: z.string(),
      institution: z.string(),
      endDate: z.string(),
  })).optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

// Schema for the chat form
const chatSchema = z.object({
  message: z.string().min(1, "A mensagem não pode estar vazia."),
});
type ChatFormValues = z.infer<typeof chatSchema>;


export default function CandidateProfilePage() {
  const { user, userProfile, loading, reloadUserData } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isBuildingWithAI, setIsBuildingWithAI] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  
  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Form for manual editing
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  // Form for AI chat
  const chatForm = useForm<ChatFormValues>({
    resolver: zodResolver(chatSchema),
  });

  // Populate form with user data on load
  useEffect(() => {
    if (userProfile) {
      profileForm.reset({
        name: userProfile.displayName || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        summary: userProfile.summary || '',
        skills: userProfile.skills || '',
        experiences: userProfile.experience ? JSON.parse(userProfile.experience) : [],
        education: userProfile.education ? JSON.parse(userProfile.education) : [],
      });
    }
  }, [userProfile, profileForm.reset]);


  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);
  
  useEffect(() => {
    if (!loading && (!user || userProfile?.accountType !== 'candidate')) {
      router.push('/login');
    }
  }, [user, userProfile, loading, router]);

  // --- AI Conversation Logic ---
  const startConversation = async () => {
    setIsBuildingWithAI(true);
    setIsAiResponding(true);
    setConversation([]);
    try {
      const result = await conversationalResume({ history: [] });
      setConversation(prev => [...prev, { role: 'model', content: result.nextQuestion }]);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível iniciar o assistente de IA.' });
      setIsBuildingWithAI(false);
    } finally {
      setIsAiResponding(false);
       setTimeout(() => chatForm.setFocus('message'), 100);
    }
  };

  const onSendMessage = async (data: ChatFormValues) => {
    const userMessage: ConversationMessage = { role: 'user', content: data.message };
    const newConversation = [...conversation, userMessage];
    setConversation(newConversation);
    chatForm.reset();
    setIsAiResponding(true);
    
    try {
        const result = await conversationalResume({ history: newConversation });

        if (result.isFinished && result.profile) {
            toast({ title: 'Currículo criado!', description: 'A IA finalizou a criação do seu currículo. Salvando perfil...' });
            
            await saveProfile(result.profile);

            setConversation(prev => [...prev, { role: 'model', content: result.nextQuestion }]);
            setIsBuildingWithAI(false);

        } else {
            setConversation(prev => [...prev, { role: 'model', content: result.nextQuestion }]);
        }

    } catch (error) {
        console.error("Error during conversational resume:", error);
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
        setConversation(prev => [...prev, { role: 'model', content: `Desculpe, ocorreu um erro: ${errorMessage}. Vamos tentar de novo. Qual era a informação que estávamos discutindo?` }]);
    } finally {
        setIsAiResponding(false);
        setTimeout(() => chatForm.setFocus('message'), 100);
    }
  };
  
  // --- Manual Save Logic ---
  const saveProfile = async (profileData: ProfileData | ProfileFormValues) => {
    if (!user || !userProfile) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado.' });
        return;
    }
    
    try {
        await updateProfile(user, { displayName: profileData.name });
        const userDocRef = doc(db, 'users', user.uid);
        
        const experiences = 'experiences' in profileData ? profileData.experiences : [];
        const education = 'education' in profileData ? profileData.education : [];
        const skills = 'skills' in profileData ? (Array.isArray(profileData.skills) ? profileData.skills.join(', ') : profileData.skills) : '';


        await setDoc(userDocRef, {
            ...userProfile,
            displayName: profileData.name,
            phone: profileData.phone,
            location: profileData.location,
            summary: profileData.summary,
            skills: skills,
            experience: JSON.stringify(experiences),
            education: JSON.stringify(education),
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
        <form onSubmit={profileForm.handleSubmit(onManualSubmit)} className="mt-8 space-y-8">
             <Card>
                <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" {...profileForm.register("name")} />
                        {profileForm.formState.errors.name && <p className="text-sm text-destructive">{profileForm.formState.errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" {...profileForm.register("phone")} />
                    </div>
                     <div className="sm:col-span-2 space-y-2">
                        <Label htmlFor="location">Cidade e Estado</Label>
                        <Input id="location" placeholder="Ex: Porto Alegre, RS" {...profileForm.register("location")} />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                        <Label htmlFor="summary">Sobre Mim</Label>
                        <Textarea id="summary" placeholder="Um breve resumo sobre seu perfil profissional..." {...profileForm.register("summary")} />
                    </div>
                     <div className="sm:col-span-2 space-y-2">
                        <Label htmlFor="skills">Habilidades</Label>
                        <Input id="skills" placeholder="Ex: Comunicação, Proatividade, Cozinha" {...profileForm.register("skills")} />
                        <p className="text-sm text-muted-foreground">Separe as habilidades por vírgula.</p>
                    </div>
                </CardContent>
            </Card>

             {/* TODO: Add Experience and Education manual fields */}

            <div className="flex justify-end">
                <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {profileForm.formState.isSubmitting ? 'Salvando...' : 'Salvar Currículo'}
                </Button>
            </div>
        </form>

        {/* AI Assistant Card */}
        <Card className="mt-12">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="text-primary"/>
                    Assistente de Currículo com IA
                </CardTitle>
                 <CardDescription>
                    Não quer preencher manualmente? Deixe que nossa IA construa seu currículo através de uma conversa rápida.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!isBuildingWithAI ? (
                    <div className="text-center p-4">
                        <Button onClick={startConversation}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Começar a criar com IA
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col h-[60vh]">
                        <div className="flex-grow space-y-4 overflow-y-auto pr-4">
                            {conversation.map((msg, index) => (
                                <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                    {msg.role === 'model' && <Avatar className="h-8 w-8"><AvatarFallback><Bot size={20}/></AvatarFallback></Avatar>}
                                    <div className={`max-w-md rounded-lg p-3 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                    {msg.role === 'user' && (
                                      <Avatar className="h-8 w-8">
                                          <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ""} />
                                          <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                    )}
                                </div>
                            ))}
                             {isAiResponding && (
                                <div className="flex items-end gap-2">
                                     <Avatar className="h-8 w-8"><AvatarFallback><Bot size={20}/></AvatarFallback></Avatar>
                                    <div className="max-w-md rounded-lg p-3 bg-muted">
                                        <div className="flex items-center gap-2">
                                           <span className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                           <span className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                           <span className="h-2 w-2 bg-primary rounded-full animate-pulse"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={conversationEndRef} />
                        </div>
                        <form onSubmit={chatForm.handleSubmit(onSendMessage)} className="mt-4 flex gap-2">
                            <Input 
                                {...chatForm.register("message")}
                                placeholder="Digite sua resposta..."
                                autoComplete="off"
                                disabled={isAiResponding}
                            />
                            <Button type="submit" disabled={isAiResponding}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                         {chatForm.formState.errors.message && <p className="text-sm text-destructive mt-1">{chatForm.formState.errors.message.message}</p>}
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
