import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CandidateProfilePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold">Meu Perfil</h1>
      <p className="mt-1 text-muted-foreground">Mantenha seus dados atualizados para aumentar suas chances.</p>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Seus dados de contato e informações básicas.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" defaultValue="Fulano de Tal" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="fulano.tal@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" type="tel" defaultValue="(51) 91234-5678" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input id="location" defaultValue="Porto Alegre, RS" />
          </div>
        </CardContent>
      </Card>
      
       <Card className="mt-8">
        <CardHeader>
          <CardTitle>Experiência Profissional</CardTitle>
          <CardDescription>Descreva suas experiências anteriores.</CardDescription>
        </CardHeader>
        <CardContent>
            <Textarea placeholder="Descreva sua experiência aqui..." rows={8}/>
        </CardContent>
        <CardFooter className="flex justify-end">
             <Button variant="outline">Adicionar Experiência</Button>
        </CardFooter>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Habilidades</CardTitle>
          <CardDescription>Liste suas principais competências.</CardDescription>
        </CardHeader>
        <CardContent>
            <Input placeholder="Ex: React, Vendas, Gestão de Pessoas" />
        </CardContent>
      </Card>

      <div className="mt-12 flex justify-end">
        <Button size="lg">Salvar Alterações</Button>
      </div>
    </div>
  );
}
