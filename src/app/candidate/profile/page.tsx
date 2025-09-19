
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, Sparkles } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { conversationalResume } from "@/ai/flows/conversational-resume";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConversationMessage, ProfileData } from "@/lib/types";

const chatSchema = z.object({
  message: z.string().min(1, "A mensagem não pode estar vazia."),
});
type ChatFormValues = z.infer<typeof chatSchema>;

export default function CandidateProfilePage() {
  const { user, userProfile, loading, reloadUserData } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, reset, setFocus, formState: { errors } } = useForm<ChatFormValues>({
    resolver: zodResolver(chatSchema)
  });

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);
  
  useEffect(() => {
    if (!loading && (!user || userProfile?.accountType !== 'candidate')) {
      router.push('/login');
    }
  }, [user, userProfile, loading, router]);

  const startConversation = async () => {
    setIsBuilding(true);
    setIsAiResponding(true);
    setConversation([]);
    try {
      const result = await conversationalResume({ history: [] });
      setConversation(prev => [...prev, { role: 'model', content: result.nextQuestion }]);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível iniciar o assistente de IA.' });
      setIsBuilding(false);
    } finally {
      setIsAiResponding(false);
       setTimeout(() => setFocus('message'), 100);
    }
  };
  
  const saveProfile = async (profileData: ProfileData) => {
    if (!user || !userProfile) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado.' });
        return;
    }
    
    try {
        await updateProfile(user, { displayName: profileData.name });
        const userDocRef = doc(db, 'users', user.uid);
        
        // Convert structured data to JSON strings for storage
        const experienceString = profileData.experiences ? JSON.stringify(profileData.experiences) : '';
        const educationString = profileData.education ? JSON.stringify(profileData.education) : '';
        
        await setDoc(userDocRef, {
            ...userProfile,
            displayName: profileData.name,
            phone: profileData.phone,
            location: profileData.location,
            experience: experienceString,
            education: educationString,
            skills: profileData.skills?.join(', '),
            summary: profileData.summary,
        }, { merge: true });

        await reloadUserData();
        
    } catch (error) {
        console.error("Error saving profile:", error);
        toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível salvar o seu perfil.' });
    }
  };

  const onSendMessage = async (data: ChatFormValues) => {
    const userMessage: ConversationMessage = { role: 'user', content: data.message };
    const newConversation = [...conversation, userMessage];
    setConversation(newConversation);
    reset();
    setIsAiResponding(true);
    
    try {
        const result = await conversationalResume({ history: newConversation });

        if (result.isFinished && result.profile) {
            toast({ title: 'Currículo criado!', description: 'A IA finalizou a criação do seu currículo. Salvando perfil...' });
            
            await saveProfile(result.profile);

            setConversation(prev => [...prev, { role: 'model', content: result.nextQuestion }]);
            setIsBuilding(false); // End the building session

        } else {
            setConversation(prev => [...prev, { role: 'model', content: result.nextQuestion }]);
        }

    } catch (error) {
        console.error("Error during conversational resume:", error);
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
        setConversation(prev => [...prev, { role: 'model', content: `Desculpe, ocorreu um erro: ${errorMessage}. Vamos tentar de novo. Qual era a informação que estávamos discutindo?` }]);
    } finally {
        setIsAiResponding(false);
        setTimeout(() => setFocus('message'), 100);
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
    <div className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div>
            <h1 className="font-headline text-3xl font-bold">Meu Currículo</h1>
            <p className="mt-1 text-muted-foreground">Use nosso assistente de IA para criar seu currículo de forma rápida e fácil, respondendo a algumas perguntas.</p>
        </div>
        
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="text-primary"/>
                    Assistente de Currículo
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!isBuilding ? (
                    <div className="text-center p-8">
                        <p className="mb-4">Pronto para criar ou atualizar seu currículo? A nossa IA vai te guiar com algumas perguntas.</p>
                        <Button onClick={startConversation}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Começar a criar
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
                        <form onSubmit={handleSubmit(onSendMessage)} className="mt-4 flex gap-2">
                            <Input 
                                {...register("message")}
                                placeholder="Digite sua resposta..."
                                autoComplete="off"
                                disabled={isAiResponding}
                            />
                            <Button type="submit" disabled={isAiResponding}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                         {errors.message && <p className="text-sm text-destructive mt-1">{errors.message.message}</p>}
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
