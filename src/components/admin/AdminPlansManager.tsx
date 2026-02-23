import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Package } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  duration_months: number;
  leads_limit: number;
  has_api_access: boolean;
  has_white_label: boolean;
  is_unlimited: boolean;
  is_active: boolean;
  created_at: string;
}

export const AdminPlansManager = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDuration, setFormDuration] = useState('1');
  const [formLeadsLimit, setFormLeadsLimit] = useState('');
  const [formHasApi, setFormHasApi] = useState(false);
  const [formHasWhiteLabel, setFormHasWhiteLabel] = useState(false);
  const [formIsUnlimited, setFormIsUnlimited] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('price_cents', { ascending: true });

    if (!error && data) {
      setPlans(data);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormName('');
    setFormSlug('');
    setFormPrice('');
    setFormDuration('1');
    setFormLeadsLimit('');
    setFormHasApi(false);
    setFormHasWhiteLabel(false);
    setFormIsUnlimited(false);
    setFormIsActive(true);
    setEditingPlan(null);
  };

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setFormName(plan.name);
    setFormSlug(plan.slug);
    setFormPrice((plan.price_cents / 100).toString());
    setFormDuration(plan.duration_months.toString());
    setFormLeadsLimit(plan.leads_limit.toString());
    setFormHasApi(plan.has_api_access);
    setFormHasWhiteLabel(plan.has_white_label);
    setFormIsUnlimited(plan.is_unlimited);
    setFormIsActive(plan.is_active);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const planData = {
      name: formName,
      slug: formSlug.toLowerCase().replace(/\s+/g, '-'),
      price_cents: Math.round(parseFloat(formPrice) * 100),
      duration_months: parseInt(formDuration),
      leads_limit: parseInt(formLeadsLimit) || 0,
      has_api_access: formHasApi,
      has_white_label: formHasWhiteLabel,
      is_unlimited: formIsUnlimited,
      is_active: formIsActive,
    };

    let error;

    if (editingPlan) {
      const result = await supabase
        .from('plans')
        .update(planData)
        .eq('id', editingPlan.id);
      error = result.error;
    } else {
      const result = await supabase.from('plans').insert(planData);
      error = result.error;
    }

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: editingPlan ? 'Plano actualizado' : 'Plano criado' });
    setDialogOpen(false);
    resetForm();
    fetchPlans();
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Gestão de Planos
          </CardTitle>
          <CardDescription>
            Configure os planos disponíveis na plataforma
          </CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
              <DialogDescription>
                Configure os detalhes do plano
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Pro"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="pro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="97.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duração (meses)</Label>
                  <Input
                    type="number"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Limite de Leads/mês</Label>
                <Input
                  type="number"
                  value={formLeadsLimit}
                  onChange={(e) => setFormLeadsLimit(e.target.value)}
                  placeholder="1000"
                  disabled={formIsUnlimited}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label>Acesso API</Label>
                  <Switch checked={formHasApi} onCheckedChange={setFormHasApi} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>White Label</Label>
                  <Switch checked={formHasWhiteLabel} onCheckedChange={setFormHasWhiteLabel} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Leads Ilimitados</Label>
                  <Switch checked={formIsUnlimited} onCheckedChange={setFormIsUnlimited} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Activo</Label>
                  <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingPlan ? 'Actualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plano</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Leads</TableHead>
              <TableHead>Funcionalidades</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acções</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  A carregar...
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{formatPrice(plan.price_cents)}</TableCell>
                  <TableCell>{plan.duration_months} mês(es)</TableCell>
                  <TableCell>
                    {plan.is_unlimited ? '∞' : plan.leads_limit.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {plan.has_api_access && (
                        <Badge variant="secondary" className="text-xs">API</Badge>
                      )}
                      {plan.has_white_label && (
                        <Badge variant="secondary" className="text-xs">White Label</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                      {plan.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(plan)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
