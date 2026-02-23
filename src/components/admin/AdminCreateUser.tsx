import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Mail, Building2, User } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  duration_months: number;
  leads_limit: number;
  is_unlimited: boolean;
}

interface AdminCreateUserProps {
  onCreated: () => void;
}

export const AdminCreateUser = ({ onCreated }: AdminCreateUserProps) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [planId, setPlanId] = useState('');
  const [accountType, setAccountType] = useState('regular');
  const [durationMonths, setDurationMonths] = useState('1');
  const [customLeadsLimit, setCustomLeadsLimit] = useState('');
  const [sendCredentials, setSendCredentials] = useState(true);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const { logAction } = useAdmin();
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const { data } = await supabase.from('plans').select('*').eq('is_active', true);
    if (data) setPlans(data);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const password = generatePassword();

      // Create user via Supabase Auth Admin API (via edge function)
      const { data: authData, error: authError } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email,
          password,
          fullName,
          companyName,
          planId: planId || null,
          accountType,
          durationMonths: parseInt(durationMonths),
          customLeadsLimit: customLeadsLimit ? parseInt(customLeadsLimit) : null,
          sendCredentials,
        },
      });

      if (authError) throw authError;

      await logAction('CREATE_USER', authData?.userId, {
        email,
        accountType,
        planId,
      });

      toast({
        title: 'Conta criada com sucesso',
        description: sendCredentials 
          ? `Credenciais enviadas para ${email}`
          : `Password temporária: ${password}`,
      });

      // Reset form
      setEmail('');
      setFullName('');
      setCompanyName('');
      setPlanId('');
      setAccountType('regular');
      setDurationMonths('1');
      setCustomLeadsLimit('');

      onCreated();
    } catch (error: any) {
      toast({
        title: 'Erro ao criar conta',
        description: error.message || 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Criar Nova Conta
        </CardTitle>
        <CardDescription>
          Crie manualmente uma conta de utilizador com plano e configurações personalizadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateUser} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="utilizador@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    placeholder="João Silva"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Empresa</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="companyName"
                    placeholder="Empresa Lda"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Plano</Label>
                <Select value={planId} onValueChange={setPlanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} ({plan.is_unlimited ? 'Ilimitado' : `${plan.leads_limit} leads`})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Conta</Label>
                <Select value={accountType} onValueChange={setAccountType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="fundador">Fundador</SelectItem>
                    <SelectItem value="teste">Teste</SelectItem>
                    <SelectItem value="parceiro">Parceiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duração (meses)</Label>
                  <Select value={durationMonths} onValueChange={setDurationMonths}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 mês</SelectItem>
                      <SelectItem value="2">2 meses</SelectItem>
                      <SelectItem value="3">3 meses</SelectItem>
                      <SelectItem value="6">6 meses</SelectItem>
                      <SelectItem value="12">12 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Leads Personalizados</Label>
                  <Input
                    type="number"
                    placeholder="Opcional"
                    value={customLeadsLimit}
                    onChange={(e) => setCustomLeadsLimit(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-4 border-t">
            <Checkbox
              id="sendCredentials"
              checked={sendCredentials}
              onCheckedChange={(checked) => setSendCredentials(checked as boolean)}
            />
            <Label htmlFor="sendCredentials" className="text-sm font-normal">
              Enviar credenciais automaticamente por email
            </Label>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'A criar...' : 'Criar Conta'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
