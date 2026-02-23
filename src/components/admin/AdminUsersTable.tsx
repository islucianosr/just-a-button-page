import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { 
  MoreHorizontal, Search, Pause, Play, Trash2, 
  Edit, RotateCcw, History, LogOut, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  plan_id: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
  leads_used_this_month: number;
  leads_reset_date: string | null;
  account_status: string;
  account_type: string;
  last_login_at: string | null;
  days_active: number;
  created_at: string;
  plans?: { name: string; leads_limit: number; is_unlimited: boolean } | null;
}

interface Plan {
  id: string;
  name: string;
  leads_limit: number;
  is_unlimited: boolean;
}

interface AdminUsersTableProps {
  onUpdate: () => void;
}

export const AdminUsersTable = ({ onUpdate }: AdminUsersTableProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const { logAction } = useAdmin();
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
    fetchPlans();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*, plans(name, leads_limit, is_unlimited)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProfiles(data);
    }
    setLoading(false);
  };

  const fetchPlans = async () => {
    const { data } = await supabase.from('plans').select('id, name, leads_limit, is_unlimited');
    if (data) setPlans(data);
  };

  const handlePauseAccount = async (profile: Profile) => {
    const newStatus = profile.account_status === 'paused' ? 'active' : 'paused';
    
    const { error } = await supabase
      .from('profiles')
      .update({ account_status: newStatus })
      .eq('id', profile.id);

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }

    await logAction(
      newStatus === 'paused' ? 'PAUSE_ACCOUNT' : 'REACTIVATE_ACCOUNT',
      profile.id,
      { email: profile.email }
    );

    toast({ 
      title: newStatus === 'paused' ? 'Conta pausada' : 'Conta reactivada',
      description: `Conta de ${profile.email} foi ${newStatus === 'paused' ? 'pausada' : 'reactivada'}.`
    });

    fetchProfiles();
    onUpdate();
  };

  const handleDeleteAccount = async (profile: Profile) => {
    const { error } = await supabase
      .from('profiles')
      .update({ account_status: 'deleted' })
      .eq('id', profile.id);

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }

    await logAction('DELETE_ACCOUNT', profile.id, { email: profile.email });

    toast({ 
      title: 'Conta eliminada',
      description: `Conta de ${profile.email} foi marcada como eliminada.`
    });

    fetchProfiles();
    onUpdate();
  };

  const handleResetLeads = async (profile: Profile) => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        leads_used_this_month: 0,
        leads_reset_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
      })
      .eq('id', profile.id);

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }

    await logAction('RESET_LEADS', profile.id, { email: profile.email });

    toast({ 
      title: 'Leads resetados',
      description: `Limite de leads de ${profile.email} foi resetado.`
    });

    fetchProfiles();
  };

  const openEditDialog = (profile: Profile) => {
    setSelectedUser(profile);
    setSelectedPlan(profile.plan_id || '');
    setSelectedStatus(profile.account_status);
    setSelectedType(profile.account_type);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        plan_id: selectedPlan || null,
        account_status: selectedStatus,
        account_type: selectedType,
      })
      .eq('id', selectedUser.id);

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }

    await logAction('EDIT_USER', selectedUser.id, {
      email: selectedUser.email,
      changes: { plan_id: selectedPlan, account_status: selectedStatus, account_type: selectedType }
    });

    toast({ title: 'Utilizador actualizado' });
    setEditDialogOpen(false);
    fetchProfiles();
    onUpdate();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Activa</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Pausada</Badge>;
      case 'expired':
        return <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">Expirada</Badge>;
      case 'deleted':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Eliminada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'fundador':
        return <Badge className="bg-primary/20 text-primary border-primary/30">Fundador</Badge>;
      case 'teste':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Teste</Badge>;
      case 'parceiro':
        return <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30">Parceiro</Badge>;
      default:
        return null;
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestão de Utilizadores</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="icon" onClick={fetchProfiles}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilizador</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead>Criado</TableHead>
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
                ) : filteredProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum utilizador encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{profile.full_name || profile.email}</p>
                          <p className="text-sm text-muted-foreground">{profile.email}</p>
                          {profile.company_name && (
                            <p className="text-xs text-muted-foreground">{profile.company_name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span>{profile.plans?.name || 'Sem plano'}</span>
                          {getTypeBadge(profile.account_type)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(profile.account_status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{profile.leads_used_this_month}</span>
                          <span className="text-muted-foreground">
                            /{profile.plans?.is_unlimited ? '∞' : profile.plans?.leads_limit || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {profile.last_login_at 
                          ? format(new Date(profile.last_login_at), 'dd/MM/yyyy HH:mm', { locale: pt })
                          : 'Nunca'
                        }
                      </TableCell>
                      <TableCell>
                        {format(new Date(profile.created_at), 'dd/MM/yyyy', { locale: pt })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acções</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(profile)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePauseAccount(profile)}>
                              {profile.account_status === 'paused' ? (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Reactivar
                                </>
                              ) : (
                                <>
                                  <Pause className="w-4 h-4 mr-2" />
                                  Pausar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetLeads(profile)}>
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Resetar Leads
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteAccount(profile)}
                              className="text-red-500 focus:text-red-500"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Utilizador</DialogTitle>
            <DialogDescription>
              {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plano</label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
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
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activa</SelectItem>
                  <SelectItem value="paused">Pausada</SelectItem>
                  <SelectItem value="expired">Expirada</SelectItem>
                  <SelectItem value="deleted">Eliminada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Conta</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
