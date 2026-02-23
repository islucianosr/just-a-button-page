import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { History } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface AdminLog {
  id: string;
  admin_id: string | null;
  action: string;
  target_user_id: string | null;
  details: any;
  created_at: string;
}

export const AdminLogsTable = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  const getActionBadge = (action: string) => {
    const actionMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'CREATE_USER': { label: 'Criar Utilizador', variant: 'default' },
      'PAUSE_ACCOUNT': { label: 'Pausar Conta', variant: 'secondary' },
      'REACTIVATE_ACCOUNT': { label: 'Reactivar Conta', variant: 'default' },
      'DELETE_ACCOUNT': { label: 'Eliminar Conta', variant: 'destructive' },
      'EDIT_USER': { label: 'Editar Utilizador', variant: 'outline' },
      'RESET_LEADS': { label: 'Resetar Leads', variant: 'secondary' },
      'UPDATE_PLAN': { label: 'Actualizar Plano', variant: 'outline' },
    };

    const actionInfo = actionMap[action] || { label: action, variant: 'outline' as const };

    return <Badge variant={actionInfo.variant}>{actionInfo.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Logs de Actividade
        </CardTitle>
        <CardDescription>
          Histórico de acções administrativas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Acção</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  A carregar...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Nenhum log encontrado
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: pt })}
                  </TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground max-w-md truncate">
                      {log.details?.email && <span>Email: {log.details.email}</span>}
                      {log.details?.changes && (
                        <span className="ml-2">
                          Alterações: {JSON.stringify(log.details.changes)}
                        </span>
                      )}
                    </div>
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
