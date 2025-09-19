import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Check } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">
          Planos flexíveis para sua empresa
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Escolha o plano que melhor se adapta às suas necessidades de contratação.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Free Plan */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Básico</CardTitle>
            <CardDescription>Para começar a contratar</CardDescription>
            <div className="mt-4">
                <span className="text-4xl font-bold">R$0</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> 1 vaga ativa por vez</li>
              <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Visualização de candidaturas</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline">Começar Agora</Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="border-primary ring-2 ring-primary">
           <CardHeader className="text-center">
            <CardTitle className="text-2xl">Profissional</CardTitle>
            <CardDescription>Para empresas em crescimento</CardDescription>
            <div className="mt-4">
                <span className="text-4xl font-bold">R$79</span>
                <span className="text-muted-foreground">/mês</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> 5 vagas ativas por vez</li>
              <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Destaque nas buscas</li>
              <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Suporte prioritário</li>
               <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Assistente de IA para vagas</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Escolher Plano</Button>
          </CardFooter>
        </Card>

        {/* Enterprise Plan */}
        <Card>
           <CardHeader className="text-center">
            <CardTitle className="text-2xl">Empresarial</CardTitle>
            <CardDescription>Para grandes volumes de contratação</CardDescription>
             <div className="mt-4">
                <span className="text-4xl font-bold">Contato</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Vagas ilimitadas</li>
              <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Página da empresa personalizada</li>
              <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Integração com ATS</li>
              <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Gerente de contas dedicado</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline">Entre em Contato</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
