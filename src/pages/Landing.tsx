import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Target, 
  Search, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Zap,
  Shield,
  BarChart3,
  Building2,
  Briefcase,
  UserCheck,
  Lock
} from 'lucide-react';

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/LOGO-03.svg" 
                alt="Leadsx1B" 
                className="h-8 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="ml-2 text-xl font-bold text-foreground">Leadsx1B</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection('como-funciona')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Como funciona
              </button>
              <button 
                onClick={() => scrollToSection('planos')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Planos
              </button>
              <button 
                onClick={() => scrollToSection('beneficios')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Benefícios
              </button>
              <Link 
                to="/auth"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </Link>
              <Link to="/quiz">
                <Button size="sm" variant="outline">
                  Começar agora
                </Button>
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`block h-0.5 w-full bg-foreground transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block h-0.5 w-full bg-foreground ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-full bg-foreground transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-b border-border">
            <div className="px-4 py-4 space-y-4">
              <button 
                onClick={() => scrollToSection('como-funciona')}
                className="block w-full text-left text-sm text-muted-foreground hover:text-foreground"
              >
                Como funciona
              </button>
              <button 
                onClick={() => scrollToSection('planos')}
                className="block w-full text-left text-sm text-muted-foreground hover:text-foreground"
              >
                Planos
              </button>
              <button 
                onClick={() => scrollToSection('beneficios')}
                className="block w-full text-left text-sm text-muted-foreground hover:text-foreground"
              >
                Benefícios
              </button>
              <Link 
                to="/auth"
                className="block text-sm text-muted-foreground hover:text-foreground"
              >
                Login
              </Link>
              <Link to="/quiz" className="block">
                <Button size="sm" className="w-full">
                  Começar agora
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Gere até <span className="text-primary">1.000 leads</span> qualificados por mês
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  A Leadsx1B é uma plataforma de prospecção inteligente para negócios que querem escala, previsibilidade e exclusividade.
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Dados organizados. Leads filtrados. Decisores reais.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/quiz">
                  <Button size="lg" className="w-full sm:w-auto gap-2 text-base">
                    Ver se me qualifico
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
                    Testar gratuitamente
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-muted-foreground">
                <Lock className="w-3 h-3 inline mr-1" />
                Acesso limitado. Apenas para perfis aprovados.
              </p>
            </div>

            {/* Right - Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 border border-border">
                {/* Mock Dashboard */}
                <div className="bg-card rounded-xl shadow-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-24 bg-muted rounded" />
                    <div className="h-8 w-8 bg-primary/10 rounded-full" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-16 bg-muted/50 rounded-lg" />
                    <div className="h-16 bg-muted/50 rounded-lg" />
                    <div className="h-16 bg-muted/50 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-10 bg-muted/30 rounded" />
                    <div className="h-10 bg-muted/30 rounded" />
                    <div className="h-10 bg-muted/30 rounded" />
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-4 -right-4 bg-card rounded-lg shadow-lg p-3 border border-border">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">+1.000 leads/mês</span>
                  </div>
                </div>

                <div className="absolute top-1/2 -left-4 bg-card rounded-lg shadow-lg p-3 border border-border">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Controlo total</span>
                  </div>
                </div>

                <div className="absolute -bottom-4 right-8 bg-card rounded-lg shadow-lg p-3 border border-border">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Exclusivo para decisores</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Como funciona
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Três passos simples para começar a gerar leads qualificados
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-card rounded-xl p-8 border border-border h-full">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Define o teu perfil ideal
                </h3>
                <p className="text-muted-foreground">
                  Segmentação por negócio, localização e intenção. Tu defines quem queres encontrar.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-card rounded-xl p-8 border border-border h-full">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  A plataforma faz a pesquisa
                </h3>
                <p className="text-muted-foreground">
                  Leads organizados, filtrados e prontos para contacto. Sem trabalho manual.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-card rounded-xl p-8 border border-border h-full">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Tu decides como usar
                </h3>
                <p className="text-muted-foreground">
                  Exportar, contactar ou integrar no teu processo. Total flexibilidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  Não é para todos.<br />
                  <span className="text-primary">É para quem leva vendas a sério.</span>
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Até 1.000 leads mensais</p>
                    <p className="text-sm text-muted-foreground">Volume suficiente para escalar qualquer operação</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Controlo total de uso</p>
                    <p className="text-sm text-muted-foreground">Dashboard individual com métricas em tempo real</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Sem spam, sem listas genéricas</p>
                    <p className="text-sm text-muted-foreground">Dados verificados e filtrados por qualidade</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Exclusividade por perfil</p>
                    <p className="text-sm text-muted-foreground">Acesso limitado para manter a qualidade</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center border-border">
                <Building2 className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-medium text-foreground">Agências</p>
                <p className="text-xs text-muted-foreground mt-1">Marketing e vendas</p>
              </Card>
              <Card className="p-6 text-center border-border">
                <Briefcase className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-medium text-foreground">Founders</p>
                <p className="text-xs text-muted-foreground mt-1">Startups e PMEs</p>
              </Card>
              <Card className="p-6 text-center border-border">
                <UserCheck className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-medium text-foreground">Closers</p>
                <p className="text-xs text-muted-foreground mt-1">Vendedores de alta performance</p>
              </Card>
              <Card className="p-6 text-center border-border">
                <BarChart3 className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-medium text-foreground">Times comerciais</p>
                <p className="text-xs text-muted-foreground mt-1">Pequenos e focados</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Planos
            </h2>
            <p className="text-muted-foreground">
              Escolhe o plano que melhor se adapta ao teu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Founder Plan */}
            <Card className="relative p-8 border-2 border-primary">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  MAIS POPULAR
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-foreground mb-2">Plano Fundador</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">R$197</span>
                  <span className="text-muted-foreground">/ mês</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Preço exclusivo para primeiros membros
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Até 1.000 leads / mês</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Acesso à plataforma</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Dashboard individual</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Suporte básico</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Comunidade fechada (bónus)</span>
                </li>
              </ul>

              <Link to="/quiz" className="block">
                <Button className="w-full" size="lg">
                  Quero garantir o preço de fundador
                </Button>
              </Link>
            </Card>

            {/* Standard Plan */}
            <Card className="p-8 border border-border">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-foreground mb-2">Plano Standard</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">R$297</span>
                  <span className="text-muted-foreground">/ mês</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Para quem quer mais recursos
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Tudo do Fundador</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Prioridade no suporte</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Mais filtros avançados</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Histórico completo</span>
                </li>
              </ul>

              <Link to="/quiz" className="block">
                <Button className="w-full" size="lg" variant="outline">
                  Aplicar para acesso
                </Button>
              </Link>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8 max-w-xl mx-auto">
            O acesso não é automático. Reservamo-nos o direito de aprovar perfis para manter a qualidade da plataforma.
          </p>
        </div>
      </section>

      {/* Exclusivity Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-2xl sm:text-3xl font-medium text-foreground leading-relaxed">
            "A Leadsx1B foi criada para quem entende que{' '}
            <span className="text-primary">dados certos valem mais</span>{' '}
            do que volume vazio."
          </blockquote>
          <p className="mt-6 text-muted-foreground">
            Menos utilizadores. Mais resultados.
          </p>
          <div className="mt-8">
            <Link to="/quiz">
              <Button size="lg" className="gap-2">
                Quero fazer parte
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">Leadsx1B</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Termos</a>
              <a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-foreground transition-colors">Contacto</a>
              <Link to="/auth" className="hover:text-foreground transition-colors">Login</Link>
              <Link 
                to="/admin/login" 
                className="text-muted-foreground/50 hover:text-muted-foreground transition-colors text-xs"
              >
                Admin
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Leadsx1B. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
