import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface WhatsAppLimitAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  limit: number;
  onConfirm: () => void;
}

export const WhatsAppLimitAlert = ({
  open,
  onOpenChange,
  count,
  limit,
  onConfirm,
}: WhatsAppLimitAlertProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Limite de Mensagens Atingido
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Atingiste o limite seguro de <strong>{limit} mensagens</strong> hoje.
              Enviar muitas mensagens pode resultar em bloqueio da tua conta WhatsApp.
            </p>
            <p className="text-sm text-muted-foreground">
              Mensagens enviadas hoje: <strong>{count}</strong>
            </p>
            <p className="text-sm font-medium text-destructive">
              Recomendamos aguardar até amanhã para continuar.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Enviar Mesmo Assim
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
