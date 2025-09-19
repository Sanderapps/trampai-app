'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  subject: z.string().min(3, 'Assunto é obrigatório'),
  message: z.string().min(10, 'A mensagem deve ter pelo menos 10 caracteres'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit: SubmitHandler<ContactFormValues> = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(data);
    toast({
      title: 'Mensagem enviada!',
      description: 'Obrigado por entrar em contato. Responderemos em breve.',
    });
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">
          Entre em Contato
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Tem alguma dúvida, sugestão ou precisa de ajuda? Fale conosco.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-2">
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold">Fale com a gente</h2>
                <p className="mt-2 text-muted-foreground">
                    Preencha o formulário ao lado ou utilize um dos nossos canais de atendimento.
                </p>
            </div>
             <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 shrink-0 text-primary" />
                <div>
                    <h3 className="font-semibold">E-mail</h3>
                    <p className="text-muted-foreground">contato@trampai.com.br</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 shrink-0 text-primary" />
                <div>
                    <h3 className="font-semibold">Telefone</h3>
                    <p className="text-muted-foreground">(51) 98765-4321</p>
                </div>
            </div>
        </div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Assunto</Label>
              <Input id="subject" {...register('subject')} />
              {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea id="message" rows={5} {...register('message')} />
              {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
