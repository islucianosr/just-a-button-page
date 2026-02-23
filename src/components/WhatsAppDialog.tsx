import { MessageCircle, Copy, Send, Edit, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useMessageTemplate } from '@/hooks/use-message-template';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WhatsAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicName: string;
  phone: string;
  leadId: string;
  onMessageSent?: () => void;
}

export const WhatsAppDialog = ({ open, onOpenChange, clinicName, phone, leadId, onMessageSent }: WhatsAppDialogProps) => {
  const { toast } = useToast();
  const { template, saveTemplate, resetTemplate, generateMessage } = useMessageTemplate();
  const [message, setMessage] = useState('');
  const [editingTemplate, setEditingTemplate] = useState(template);

  useEffect(() => {
    setMessage(generateMessage(clinicName));
  }, [clinicName, template]);

  useEffect(() => {
    setEditingTemplate(template);
  }, [template]);

  const markAsSent = async () => {
    try {
      await supabase
        .from('leads')
        .update({ 
          whatsapp_sent: true,
          whatsapp_sent_at: new Date().toISOString()
        })
        .eq('id', leadId);
      
      onMessageSent?.();
    } catch (error) {
      console.error('Error marking message as sent:', error);
    }
  };

  const copyMessage = async () => {
    navigator.clipboard.writeText(message);
    await markAsSent();
    toast({
      title: "Mensagem copiada!",
      description: "A mensagem foi copiada para a área de transferência.",
    });
  };

  const openWhatsApp = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    await markAsSent();
    window.open(whatsappUrl, '_blank');
  };

  const handleSaveTemplate = () => {
    saveTemplate(editingTemplate);
    toast({
      title: "Template salvo!",
      description: "O template foi salvo e será usado para todos os leads.",
    });
  };

  const handleResetTemplate = () => {
    resetTemplate();
    toast({
      title: "Template restaurado!",
      description: "O template padrão foi restaurado.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageCircle className="w-6 h-6 text-accent" />
            Enviar para {clinicName}
          </DialogTitle>
          <DialogDescription>
            Edite o template global ou envie a mensagem personalizada
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="message" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="message">Mensagem</TabsTrigger>
            <TabsTrigger value="template">
              <Edit className="w-4 h-4 mr-2" />
              Editar Template
            </TabsTrigger>
          </TabsList>

          <TabsContent value="message" className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Mensagem para {clinicName}:</h3>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                placeholder="Digite sua mensagem aqui..."
              />
              <p className="text-xs text-muted-foreground">
                Edite a mensagem para este lead específico. Use *asteriscos* para negrito e _underline_ para itálico.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                onClick={copyMessage}
                variant="outline"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Mensagem
              </Button>

              <Button 
                onClick={openWhatsApp}
                className="w-full bg-accent hover:bg-accent/90"
              >
                <Send className="w-4 h-4 mr-2" />
                Abrir WhatsApp
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="template" className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Template Global:</h3>
              <Textarea
                value={editingTemplate}
                onChange={(e) => setEditingTemplate(e.target.value)}
                className="min-h-[250px] font-mono text-sm"
                placeholder="Digite o template aqui..."
              />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Este template será usado para todos os leads. Use <code className="bg-muted px-1 py-0.5 rounded">{'{clinicName}'}</code> onde quiser inserir o nome da clínica.
                </p>
                <p className="text-xs text-muted-foreground">
                  Exemplo: "Notei que a *{'{clinicName}'}* ainda não tem um site profissional."
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                onClick={handleResetTemplate}
                variant="outline"
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restaurar Padrão
              </Button>

              <Button 
                onClick={handleSaveTemplate}
                className="w-full"
              >
                <Edit className="w-4 h-4 mr-2" />
                Salvar Template
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
