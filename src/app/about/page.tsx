import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">
            Sobre a Trampaí
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            Nossa missão é fortalecer a economia do Rio Grande do Sul, conectando profissionais talentosos a grandes oportunidades de carreira em empresas locais.
          </p>
        </div>

        <div className="mt-16 overflow-hidden rounded-lg">
           <Image
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1920&auto=format&fit=crop"
              alt="Equipe Trampaí"
              width={1920}
              height={1080}
              className="w-full h-auto object-cover"
              data-ai-hint="team meeting"
            />
        </div>

        <div className="prose prose-lg mx-auto mt-16 max-w-none text-foreground lg:prose-xl">
          <h2>Nossa História</h2>
          <p>
            A Trampaí nasceu da vontade de fazer a diferença no cenário de empregos do Rio Grande do Sul. Em meio a desafios econômicos, percebemos a necessidade de uma plataforma que fosse mais do que um simples portal de vagas, mas um verdadeiro ponto de encontro entre quem busca uma oportunidade e quem oferece.
          </p>
          <p>
            Com foco total em nosso estado, entendemos as particularidades da nossa cultura e do nosso mercado de trabalho. Queremos impulsionar carreiras e ajudar empresas gaúchas a encontrar as pessoas certas para crescerem juntas.
          </p>
          
          <h2>Nossos Valores</h2>
          <ul>
            <li><strong>Foco Local:</strong> Somos 100% dedicados ao Rio Grande do Sul.</li>
            <li><strong>Tecnologia e Inovação:</strong> Usamos a tecnologia para simplificar e otimizar o processo de recrutamento.</li>
            <li><strong>Comunidade:</strong> Acreditamos no poder da colaboração para construir um mercado de trabalho mais forte.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
