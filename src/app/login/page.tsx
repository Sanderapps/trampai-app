'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  accountType: z.enum(['candidate', 'employer'], { required_error: 'Selecione o tipo de conta' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      
      toast({
        title: 'Login bem-sucedido!',
      });

      // In a real app, you would fetch user profile data to confirm account type
      // before redirecting. For this example, we'll trust the user's selection.
      if (data.accountType === 'candidate') {
        router.push('/candidate/dashboard');
      } else {
        router.push('/employer/dashboard');
      }
    } catch (error: any) {
        console.error("Firebase Login Error:", error);
        let description = "Ocorreu um erro ao fazer login. Verifique seu e-mail e senha.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = "E-mail ou senha inválidos.";
        }
        toast({
            variant: "destructive",
            title: "Erro no login",
            description: description,
        });
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-var(--header-height)-var(--footer-height))] items-center justify-center bg-muted/40 py-12">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Entre com seu e-mail e senha para acessar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
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
              <div className="flex items-center">
                <Label htmlFor="password">Senha</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            
            <div className="grid gap-2">
                <Label>Acessar como</Label>
                <RadioGroup 
                    onValueChange={(value) => setValue('accountType', value as 'candidate' | 'employer', { shouldValidate: true })} 
                    className="flex"
                  >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="candidate" id="candidate" />
                        <Label htmlFor="candidate">Candidato</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="employer" id="employer" />
                        <Label htmlFor="employer">Empregador</Label>
                    </div>
                </RadioGroup>
                {errors.accountType && <p className="text-sm text-destructive">{errors.accountType.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
            <Button variant="outline" className="w-full" type="button">
              Entrar com Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{' '}
            <Link href="/signup" className="underline">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
