import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Shield } from 'lucide-react';

interface FormData {
  fullName: string;
  email: string;
  whatsapp: string;
  profileType: string;
  country: string;
  leadObjective: string;
  monthlyInvestment: string;
  willingToInvest: string;
  hasSalesProcess: string;
  decisionMaker: string;
  acceptsRules: boolean;
}

const Quiz = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    whatsapp: '',
    profileType: '',
    country: '',
    leadObjective: '',
    monthlyInvestment: '',
    willingToInvest: '',
    hasSalesProcess: '',
    decisionMaker: '',
    acceptsRules: false,
  });

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return formData.fullName.trim() !== '' && 
               formData.email.trim() !== '' && 
               formData.whatsapp.trim() !== '';
      case 2:
        return formData.profileType !== '' && formData.country !== '' && formData.leadObjective !== '';
      case 3:
        return formData.monthlyInvestment !== '' && formData.willingToInvest !== '';
      case 4:
        return formData.hasSalesProcess !== '' && formData.decisionMaker !== '';
      case 5:
        return formData.acceptsRules;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    } else {
      toast.error('Por favor, preenche todos os campos obrigatórios.');
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    if (!formData.acceptsRules) {
      toast.error('Por favor, aceita os termos para continuar.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('quiz_submissions').insert({
        full_name: formData.fullName,
        email: formData.email,
        whatsapp: formData.whatsapp,
        profile_type: formData.profileType,
        country: formData.country,
        lead_objective: formData.leadObjective,
        monthly_investment: formData.monthlyInvestment,
        willing_to_invest: formData.willingToInvest,
        has_sales_process: formData.hasSalesProcess,
        decision_maker: formData.decisionMaker,
        accepts_rules: formData.acceptsRules,
        status: 'em_analise',
      });

      if (error) throw error;

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Erro ao enviar formulário. Por favor, tenta novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thank you page
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-lg w-full p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Formulário recebido com sucesso
          </h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            A tua candidatura será analisada manualmente. Caso o teu perfil seja aprovado, 
            entraremos em contacto via WhatsApp ou email nas próximas 24–48h.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Se não houver contacto, significa que neste momento o perfil não se enquadra.
          </p>
          <Link to="/">
            <Button variant="outline">
              Voltar à página inicial
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Intro step
  if (step === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-lg w-full p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              A Leadsx1B não é para todos.
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Este questionário serve para garantir que apenas negócios com perfil sério, 
              estrutura mínima e intenção real tenham acesso à plataforma.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 mb-8">
            <p className="text-sm text-center text-muted-foreground">
              ⚠️ O preenchimento não garante aprovação.
            </p>
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">
              Tempo médio: 2 minutos
            </p>
          </div>

          <Button onClick={() => setStep(1)} className="w-full" size="lg">
            Começar avaliação
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Voltar à página inicial
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-foreground">Dados Básicos</h2>
              <p className="text-sm text-muted-foreground mt-1">Identificação</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nome completo *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => updateFormData('fullName', e.target.value)}
                  placeholder="O teu nome completo"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email profissional *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="email@empresa.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp com DDD *</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => updateFormData('whatsapp', e.target.value)}
                  placeholder="+55 11 99999-9999"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-foreground">Perfil do Negócio</h2>
              <p className="text-sm text-muted-foreground mt-1">Conta-nos sobre ti</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base">Qual descreve melhor o teu perfil? *</Label>
                <RadioGroup
                  value={formData.profileType}
                  onValueChange={(value) => updateFormData('profileType', value)}
                  className="mt-3 space-y-2"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="agencia" id="agencia" />
                    <Label htmlFor="agencia" className="cursor-pointer flex-1">Agência de marketing</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="freelancer" id="freelancer" />
                    <Label htmlFor="freelancer" className="cursor-pointer flex-1">Freelancer</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="empresa" id="empresa" />
                    <Label htmlFor="empresa" className="cursor-pointer flex-1">Empresa com equipa comercial</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="founder" id="founder" />
                    <Label htmlFor="founder" className="cursor-pointer flex-1">Founder / Dono de negócio</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="outro" id="outro" />
                    <Label htmlFor="outro" className="cursor-pointer flex-1">Outro</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base">Em que país operas principalmente? *</Label>
                <RadioGroup
                  value={formData.country}
                  onValueChange={(value) => updateFormData('country', value)}
                  className="mt-3 space-y-2"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="brasil" id="brasil" />
                    <Label htmlFor="brasil" className="cursor-pointer flex-1">Brasil</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="portugal" id="portugal" />
                    <Label htmlFor="portugal" className="cursor-pointer flex-1">Portugal</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="angola" id="angola" />
                    <Label htmlFor="angola" className="cursor-pointer flex-1">Angola</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="outro_pais" id="outro_pais" />
                    <Label htmlFor="outro_pais" className="cursor-pointer flex-1">Outro</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base">Qual é o teu objectivo principal com leads? *</Label>
                <RadioGroup
                  value={formData.leadObjective}
                  onValueChange={(value) => updateFormData('leadObjective', value)}
                  className="mt-3 space-y-2"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="ticket_alto" id="ticket_alto" />
                    <Label htmlFor="ticket_alto" className="cursor-pointer flex-1">Fechar clientes de ticket médio/alto</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="escalar" id="escalar" />
                    <Label htmlFor="escalar" className="cursor-pointer flex-1">Escalar vendas</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="b2b" id="b2b" />
                    <Label htmlFor="b2b" className="cursor-pointer flex-1">Prospecção B2B</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="validar" id="validar" />
                    <Label htmlFor="validar" className="cursor-pointer flex-1">Ainda estou a validar</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-foreground">Capacidade de Investimento</h2>
              <p className="text-sm text-muted-foreground mt-1">Ajuda-nos a entender o teu contexto</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base">Quanto investes actualmente por mês em aquisição de clientes? *</Label>
                <RadioGroup
                  value={formData.monthlyInvestment}
                  onValueChange={(value) => updateFormData('monthlyInvestment', value)}
                  className="mt-3 space-y-2"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="nada" id="nada" />
                    <Label htmlFor="nada" className="cursor-pointer flex-1">Nada ainda</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="ate_500" id="ate_500" />
                    <Label htmlFor="ate_500" className="cursor-pointer flex-1">Até R$500</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="500_1500" id="500_1500" />
                    <Label htmlFor="500_1500" className="cursor-pointer flex-1">R$500 – R$1.500</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="mais_1500" id="mais_1500" />
                    <Label htmlFor="mais_1500" className="cursor-pointer flex-1">+R$1.500</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base">Estarias disposto a investir numa ferramenta mensal se ela gerar retorno real? *</Label>
                <RadioGroup
                  value={formData.willingToInvest}
                  onValueChange={(value) => updateFormData('willingToInvest', value)}
                  className="mt-3 space-y-2"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="sim" id="willing_sim" />
                    <Label htmlFor="willing_sim" className="cursor-pointer flex-1">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="talvez" id="willing_talvez" />
                    <Label htmlFor="willing_talvez" className="cursor-pointer flex-1">Talvez</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="nao" id="willing_nao" />
                    <Label htmlFor="willing_nao" className="cursor-pointer flex-1">Não</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-foreground">Maturidade do Lead</h2>
              <p className="text-sm text-muted-foreground mt-1">Sobre a tua operação actual</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base">Tens processo de vendas activo hoje? *</Label>
                <RadioGroup
                  value={formData.hasSalesProcess}
                  onValueChange={(value) => updateFormData('hasSalesProcess', value)}
                  className="mt-3 space-y-2"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="sim" id="process_sim" />
                    <Label htmlFor="process_sim" className="cursor-pointer flex-1">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="em_construcao" id="process_construcao" />
                    <Label htmlFor="process_construcao" className="cursor-pointer flex-1">Em construção</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="nao" id="process_nao" />
                    <Label htmlFor="process_nao" className="cursor-pointer flex-1">Não</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base">Quem decide a contratação de ferramentas no teu negócio? *</Label>
                <RadioGroup
                  value={formData.decisionMaker}
                  onValueChange={(value) => updateFormData('decisionMaker', value)}
                  className="mt-3 space-y-2"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="eu" id="decision_eu" />
                    <Label htmlFor="decision_eu" className="cursor-pointer flex-1">Eu</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="socio" id="decision_socio" />
                    <Label htmlFor="decision_socio" className="cursor-pointer flex-1">Sócio</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="outra_pessoa" id="decision_outra" />
                    <Label htmlFor="decision_outra" className="cursor-pointer flex-1">Outra pessoa</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-foreground">Compromisso</h2>
              <p className="text-sm text-muted-foreground mt-1">Última etapa</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-foreground leading-relaxed">
                A Leadsx1B oferece até 1.000 leads por mês, com acesso limitado e controlo rigoroso.
              </p>
            </div>

            <div>
              <Label className="text-base mb-4 block">
                Se aprovado, estás disposto a respeitar as regras da plataforma e manter uma relação profissional? *
              </Label>
              
              <div className="space-y-4 mt-6">
                <div className="flex items-start space-x-3 p-4 rounded-lg border border-border bg-card">
                  <Checkbox
                    id="acceptsRules"
                    checked={formData.acceptsRules}
                    onCheckedChange={(checked) => updateFormData('acceptsRules', checked as boolean)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="acceptsRules" className="cursor-pointer text-sm leading-relaxed">
                    Ao enviar este formulário, concordo que:
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• O acesso pode ser recusado</li>
                      <li>• A aprovação não é automática</li>
                      <li>• O contacto será feito apenas se o perfil for aprovado</li>
                    </ul>
                  </Label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Passo {step} de 5</span>
            <span className="text-sm text-muted-foreground">{Math.round((step / 5) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        <Card className="p-6 sm:p-8">
          {renderStepContent()}

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            {step < 5 ? (
              <Button onClick={nextStep}>
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting || !formData.acceptsRules}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    A enviar...
                  </>
                ) : (
                  'Enviar para análise'
                )}
              </Button>
            )}
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 inline mr-1" />
            Voltar à página inicial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
