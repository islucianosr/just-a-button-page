import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/FileUpload';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { supabaseHelper } from '@/lib/supabase-helper';
import { parseXMLFile } from '@/utils/xmlParser';
import { ArrowLeft, Loader2 } from 'lucide-react';

const UploadXML = () => {
  const [searchName, setSearchName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!searchName) {
      setSearchName(file.name.replace('.xml', ''));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !searchName.trim()) {
      toast({
        title: 'Erro',
        description: 'Selecione um arquivo e dê um nome à pesquisa',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Parse XML
      const leads = await parseXMLFile(selectedFile);

      if (leads.length === 0) {
        toast({
          title: 'Aviso',
          description: 'Nenhum lead encontrado no arquivo XML',
          variant: 'destructive'
        });
        return;
      }

      // Create search record
      const { data: searchData, error: searchError } = await (supabaseHelper as any)
        .from('apify_searches')
        .insert({
          user_id: user.id,
          name: searchName,
          search_type: 'manual_xml',
          status: 'succeeded',
          total_results: leads.length,
          search_params: { filename: selectedFile.name }
        })
        .select('id')
        .single();

      if (searchError) throw searchError;
      if (!searchData) throw new Error('Erro ao criar registo de pesquisa');

      // Insert leads
      const leadsToInsert = leads.map(lead => ({
        user_id: user.id,
        search_id: (searchData as any).id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email || '',
        address: lead.address,
        city: lead.city,
        categories: lead.category ? [lead.category] : [],
        website: lead.website,
        reviews_count: lead.reviewsCount,
        rating: lead.rating,
        google_url: lead.googleMapsUrl,
        priority_score: calculatePriorityScore(lead.priority),
        observations: lead.observations
      }));

      const { error: leadsError } = await (supabaseHelper as any)
        .from('leads')
        .insert(leadsToInsert);

      if (leadsError) throw leadsError;

      toast({
        title: 'Sucesso!',
        description: `${leads.length} leads importados com sucesso`
      });

      navigate(`/results?search=${(searchData as any).id}`);
    } catch (error: any) {
      console.error('Error processing XML:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao processar arquivo XML',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const calculatePriorityScore = (priority: string): number => {
    // Alta prioridade (sem site) = 100 pontos
    // Baixa prioridade (com site) = 30 pontos
    return priority === 'ALTA' ? 100 : 30;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Importar XML do Google Maps</CardTitle>
              <CardDescription>
                Faça upload do arquivo XML exportado do Google Maps Extractor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="searchName">Nome da Pesquisa</Label>
                <Input
                  id="searchName"
                  placeholder="Ex: Clínicas Estéticas - Luanda"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>

              <FileUpload onFileSelect={handleFileSelect} />

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Processar e Importar
              </Button>
            </CardContent>
          </Card>

          <Card className="border-muted-foreground/20 bg-muted/10">
            <CardHeader>
              <CardTitle className="text-base">Como funciona?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>1. Exporte seus dados do Google Maps Extractor (Apify) em formato XML</p>
              <p>2. Faça o upload do arquivo XML aqui</p>
              <p>3. Os leads serão automaticamente processados e priorizados</p>
              <p>4. Você poderá visualizar e gerenciar os leads na página de resultados</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UploadXML;
