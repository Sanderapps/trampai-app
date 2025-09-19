
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-muted/50">
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">
            Política de Privacidade
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Sua privacidade é nossa prioridade.
          </p>
        </div>
        
        <Card>
          <CardHeader>
             <CardTitle>Última atualização: 25 de Julho de 2024</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-foreground prose-headings:font-headline prose-h2:text-xl prose-h2:mb-4 prose-p:mb-4 prose-ul:mb-4">
            <p>
              A sua privacidade é fundamental para nós. É política do Trampaí respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar em nossa plataforma.
            </p>

            <h2>1. Informações que Coletamos</h2>
            <p>
              Coletamos diferentes tipos de informações para fornecer e melhorar nossos serviços a você.
            </p>
            <ul>
              <li><strong>Para Candidatos:</strong> Nome, e-mail, foto de perfil, telefone, localização, experiências profissionais, habilidades e o conteúdo do seu currículo (texto e arquivo).</li>
              <li><strong>Para Empregadores:</strong> Nome, e-mail e informações sobre as vagas que você publica.</li>
              <li><strong>Dados de Uso:</strong> Coletamos informações sobre como você acessa e usa a plataforma, como seu endereço IP, tipo de navegador, páginas visitadas e horários de acesso.</li>
            </ul>

            <h2>2. Como Usamos Suas Informações</h2>
            <p>
              Usamos as informações que coletamos para as seguintes finalidades:
            </p>
            <ul>
              <li><strong>Prover e Manter o Serviço:</strong> Operar a plataforma, permitir a criação de perfis, publicação de vagas e o processo de candidatura.</li>
              <li><strong>Conectar Candidatos e Empregadores:</strong> Facilitar a busca por vagas e a análise de perfis de candidatos. Suas informações de perfil e currículo são compartilhadas com os empregadores quando você se candidata a uma vaga.</li>
              <li><strong>Comunicação:</strong> Enviar e-mails transacionais (confirmação de cadastro, notificações de candidatura) e, se autorizado, comunicados sobre novas oportunidades e recursos da plataforma.</li>
              <li><strong>Melhorar a Plataforma:</strong> Entender como nossos usuários utilizam o Trampaí para aprimorar a experiência, a usabilidade e desenvolver novas funcionalidades.</li>
              <li><strong>Segurança:</strong> Monitorar a atividade para prevenir fraudes e proteger a segurança dos nossos usuários.</li>
            </ul>

            <h2>3. Compartilhamento de Informações</h2>
            <p>
              Não compartilhamos suas informações pessoais com terceiros, exceto nas seguintes situações:
            </p>
             <ul>
              <li>Com empregadores, quando um candidato se candidata a uma de suas vagas.</li>
              <li>Para cumprir com obrigações legais ou solicitações governamentais.</li>
              <li>Para proteger os direitos e a segurança do Trampaí e de seus usuários.</li>
            </ul>


            <h2>4. Armazenamento e Segurança dos Dados</h2>
            <p>
              Seus dados são armazenados de forma segura em servidores do Google Firebase. Empregamos medidas de segurança técnicas e administrativas para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
            </p>
            
            <h2>5. Seus Direitos</h2>
            <p>
                Você tem o direito de acessar, corrigir ou excluir suas informações pessoais a qualquer momento. Você pode gerenciar os dados do seu perfil diretamente na sua conta ou entrando em contato conosco.
            </p>

            <h2>6. Cookies</h2>
            <p>
              Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência de navegação, como manter sua sessão ativa. Você pode configurar seu navegador para recusar cookies, mas isso pode limitar a funcionalidade de certas áreas da nossa plataforma.
            </p>
            
            <h2>7. Contato</h2>
            <p>
              Se você tiver alguma dúvida sobre nossa Política de Privacidade, entre em <a href="/contact">contato conosco</a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
