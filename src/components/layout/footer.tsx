
import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Briefcase className="h-7 w-7 text-primary" />
              <span className="font-headline text-2xl font-bold">Trampaí</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Conectando talentos e empresas no Rio Grande do Sul.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold tracking-wider text-foreground">
                  Candidatos
                </h3>
                <ul className="mt-4 space-y-4">
                  <li><Link href="/jobs" className="text-sm text-muted-foreground hover:text-foreground">Buscar Vagas</Link></li>
                  <li><Link href="/candidate/profile" className="text-sm text-muted-foreground hover:text-foreground">Meu Perfil</Link></li>
                  <li><Link href="/candidate/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Minhas Candidaturas</Link></li>
                   <li><Link href="/candidate/saved-jobs" className="text-sm text-muted-foreground hover:text-foreground">Vagas Salvas</Link></li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold tracking-wider text-foreground">
                  Empresas
                </h3>
                <ul className="mt-4 space-y-4">
                  <li><Link href="/employer/jobs/new" className="text-sm text-muted-foreground hover:text-foreground">Publicar Vaga</Link></li>
                  <li><Link href="/employer/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Painel do Empregador</Link></li>
                  <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Planos</Link></li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold tracking-wider text-foreground">
                  Trampaí
                </h3>
                <ul className="mt-4 space-y-4">
                  <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">Sobre Nós</Link></li>
                  <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contato</Link></li>
                  <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Política de Privacidade</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {currentYear} Trampaí. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
