'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const signupSchema = z.object({
    name: z.string().min(2, 'Nome é obrigatório'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    accountType: z.enum(['candidate', 'employer'], {
        required_error: 'Selecione o tipo de conta'
    })
});

type SignupFormValues = z.infer<typeof signupSchema>;


export default function SignupPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema)
    });

    const onSubmit = (data: SignupFormValues) => {
        console.log(data);
        // Handle signup logic
    };

  return (
     <div className="flex min-h-[calc(100vh-var(--header-height)-var(--footer-height))] items-center justify-center bg-muted/40 py-12">
        <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
            <CardTitle className="text-xl">Cadastre-se</CardTitle>
            <CardDescription>
            Crie sua conta para encontrar um trampo ou o candidato ideal.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" placeholder="Seu nome" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
                />
                 {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" {...register('password')} />
                 {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="grid gap-2">
                <Label>Tipo de conta</Label>
                <RadioGroup defaultValue="candidate" className="flex" {...register('accountType')}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="candidate" id="candidate" />
                        <Label htmlFor="candidate">Sou candidato</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="employer" id="employer" />
                        <Label htmlFor="employer">Sou empregador</Label>
                    </div>
                </RadioGroup>
                {errors.accountType && <p className="text-sm text-destructive">{errors.accountType.message}</p>}
            </div>


            <Button type="submit" className="w-full">
                Criar conta
            </Button>
            <Button variant="outline" className="w-full">
                Cadastrar com Google
            </Button>
            </form>
            <div className="mt-4 text-center text-sm">
            Já tem uma conta?{' '}
            <Link href="/login" className="underline">
                Entrar
            </Link>
            </div>
        </CardContent>
        </Card>
    </div>
  )
}
