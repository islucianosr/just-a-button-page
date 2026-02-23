import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft, Search } from 'lucide-react';
import logo from '@/assets/logo.svg';


const NewSearch = () => {
  const [cidade, setCidade] = useState('');
  const [categoria, setCategoria] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();


  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!cidade.trim() || cidade.trim().length < 3) {
      newErrors.cidade = 'Localização é obrigatória (mínimo 3 caracteres)';
    }
    if (!categoria.trim() || categoria.trim().length < 3) {
      newErrors.categoria = 'Nicho é obrigatório (mínimo 3 caracteres)';
    }
    if (!quantidade || parseInt(quantidade) < 1) {
      newErrors.quantidade = 'Quantidade é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBuscarLeads = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      toast({
        title: 'Buscando leads...',
        description: 'Extraindo leads do Google Maps. Isso pode levar até 3 minutos.'
      });

      const { data, error } = await supabase.functions.invoke('apify-execute-search', {
        body: {
          searchName: `${categoria.trim()} em ${cidade.trim()}`,
          searchType: 'local',
          keyword: categoria.trim(),
          location: cidade.trim(),
          language: 'pt',
          maxResults: parseInt(quantidade),
        }
      });

      // Extract real error message from edge function response body
      if (error) {
        const context = (error as any).context;
        let realMessage = error.message;
        if (context) {
          try {
            const body = await context.json();
            realMessage = body?.error || body?.message || realMessage;
          } catch {
            try { realMessage = await context.text() || realMessage; } catch { /* noop */ }
          }
        }
        throw new Error(realMessage);
      }

      if (data?.error) throw new Error(data.error);

      toast({
        title: '✅ Busca concluída!',
        description: `${data?.totalResults || 0} leads encontrados.`
      });

      navigate('/results');
    } catch (error: any) {
      console.error('Error fetching leads:', error);
      const msg = error.message || 'Erro ao buscar leads. Tente novamente.';
      const isConfigError = msg.includes('Chave API') || msg.includes('não configurada') || msg.includes('inválida');
      toast({
        title: 'Erro',
        description: msg,
        variant: 'destructive'
      });
      if (isConfigError) {
        setTimeout(() => navigate('/settings'), 2500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Leadsx1B" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold">Leadsx1B</h1>
              <p className="text-xs text-muted-foreground">
                Gerador de Leads Automatizado
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Nova Busca de Leads
              </CardTitle>
              <CardDescription>
                Extraia leads do Google Maps automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Localização (usuário digita cidade + país) */}
              <div className="space-y-2">
                <Label htmlFor="cidade">Localização</Label>
                <Input
                  id="cidade"
                  placeholder="Ex: São Paulo, Brasil ou Lisboa, Portugal"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className={errors.cidade ? 'border-destructive' : ''}
                />
                {errors.cidade && (
                  <p className="text-xs text-destructive">{errors.cidade}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Digite a cidade e o país (ex: São Paulo, Brasil)
                </p>
              </div>

              {/* Nicho/Categoria */}
              <div className="space-y-2">
                <Label htmlFor="categoria">Nicho do Negócio</Label>
                <Input
                  id="categoria"
                  placeholder="Ex: restaurante, clínica estética, academia, dentista"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className={errors.categoria ? 'border-destructive' : ''}
                />
                {errors.categoria && (
                  <p className="text-xs text-destructive">{errors.categoria}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Digite o tipo de negócio que deseja buscar
                </p>
              </div>

              {/* Quantidade (input livre com limite do plano) */}
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade de Leads</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  max="1000"
                  placeholder="Ex: 50, 100, 200"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  className={errors.quantidade ? 'border-destructive' : ''}
                />
                {errors.quantidade && (
                  <p className="text-xs text-destructive">{errors.quantidade}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Quantos leads deseja extrair
                </p>
              </div>

              {/* Botão full-width */}
              <Button
                onClick={handleBuscarLeads}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Buscando leads...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Leads Automaticamente
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewSearch;
