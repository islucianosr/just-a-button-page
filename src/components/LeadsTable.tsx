import { useState, useMemo } from 'react';
import { Lead, PriorityLevel } from '@/types/lead';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PriorityBadge } from './PriorityBadge';
import { WhatsAppDialog } from './WhatsAppDialog';
import {
  ArrowUpDown,
  Download,
  Search,
  ExternalLink,
  Phone,
  MapPin,
  Star,
  MessageCircle,
  CheckCircle2,
  Instagram,
  Facebook,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LeadsTableProps {
  leads: Lead[];
  onLeadUpdate?: () => void;
}

type SortField = 'name' | 'priority' | 'reviewsCount' | 'rating';

export const LeadsTable = ({ leads, onLeadUpdate }: LeadsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [whatsAppDialog, setWhatsAppDialog] = useState<{ open: boolean; lead: Lead | null }>({
    open: false,
    lead: null,
  });

  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(leads.map(lead => lead.city))).filter(Boolean);
    return uniqueCities.sort();
  }, [leads]);

  const priorityOrder: Record<PriorityLevel, number> = {
    'ALTA': 2,
    'BAIXA': 1,
  };

  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads.filter(lead => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCity = cityFilter === 'all' || lead.city === cityFilter;
      const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;

      return matchesSearch && matchesCity && matchesPriority;
    });

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'priority':
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'reviewsCount':
          comparison = a.reviewsCount - b.reviewsCount;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [leads, searchTerm, cityFilter, priorityFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const openWhatsAppDialog = (lead: Lead) => {
    setWhatsAppDialog({ open: true, lead });
  };

  const getInstagramSearchUrl = (businessName: string, city?: string) => {
    const searchQuery = city ? `${businessName} ${city}` : businessName;
    return `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(searchQuery)}`;
  };

  const exportToCSV = () => {
    const headers = [
      'Prioridade',
      'Nome',
      'Telefone',
      'Email',
      'Cidade',
      'Endereço',
      'Categoria',
      'Avaliações',
      'Rating',
      'Tem Site?',
      'Website',
      'Instagram',
      'Facebook',
      'Observações',
      'Google Maps',
    ].join(',');

    const rows = filteredAndSortedLeads.map(lead =>
      [
        lead.priority,
        `"${lead.name}"`,
        lead.phone,
        lead.email,
        lead.city,
        `"${lead.address}"`,
        `"${lead.category}"`,
        lead.reviewsCount,
        lead.rating.toFixed(1),
        lead.hasWebsite ? 'Sim' : 'Não',
        lead.website,
        lead.instagramUrl || '',
        lead.facebookUrl || '',
        `"${lead.observations}"`,
        lead.googleMapsUrl,
      ].join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads-clinicas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <>
      <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-lg">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {filteredAndSortedLeads.length} Leads Encontrados
            </h2>
            <Button onClick={exportToCSV} variant="outline" size="sm" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as prioridades</SelectItem>
                <SelectItem value="MUITO ALTA">⭐ Oportunidades Principais</SelectItem>
                <SelectItem value="ALTA">🟠 Alta</SelectItem>
                <SelectItem value="MÉDIA">🟡 Média</SelectItem>
                <SelectItem value="BAIXA">⚪ Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-primary/10 to-accent/10">
                  <TableHead className="whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('priority')}
                      className="font-semibold"
                    >
                      Prioridade
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('name')}
                      className="font-semibold"
                    >
                      Nome
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">Contato</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap hidden lg:table-cell">Localização</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap hidden xl:table-cell">Categoria</TableHead>
                  <TableHead className="whitespace-nowrap hidden md:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('reviewsCount')}
                      className="font-semibold"
                    >
                      Avaliações
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="whitespace-nowrap hidden md:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('rating')}
                      className="font-semibold"
                    >
                      Rating
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap hidden sm:table-cell">Website</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap hidden lg:table-cell">Redes Sociais</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-muted/50 transition-all duration-200">
                    <TableCell>
                      <div className="space-y-1">
                        <PriorityBadge priority={lead.priority} />
                        {lead.observations && lead.observations.includes('OPORTUNIDADE PRINCIPAL') && (
                          <div className="text-xs text-muted-foreground italic">
                            {lead.observations}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium min-w-[150px]">{lead.name}</TableCell>
                    <TableCell className="min-w-[120px]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <a
                            href={`tel:${lead.phone}`}
                            className="text-primary hover:underline"
                          >
                            {lead.phone}
                          </a>
                        </div>
                        {lead.email && (
                          <div className="text-sm text-muted-foreground">{lead.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell min-w-[150px]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {lead.city}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {lead.address}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm hidden xl:table-cell min-w-[120px]">{lead.category}</TableCell>
                    <TableCell className="text-center hidden md:table-cell">{lead.reviewsCount}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{lead.rating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {lead.hasWebsite ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm flex items-center gap-1"
                        >
                          Site
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-destructive font-medium text-sm">Sem site</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-col gap-1">
                        {lead.instagramUrl && (
                          <a
                            href={lead.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-500 hover:underline text-sm flex items-center gap-1"
                          >
                            <Instagram className="w-3 h-3" />
                            Instagram
                          </a>
                        )}
                        {lead.facebookUrl && (
                          <a
                            href={lead.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                          >
                            <Facebook className="w-3 h-3" />
                            Facebook
                          </a>
                        )}
                        {!lead.instagramUrl && !lead.facebookUrl && (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row gap-2 min-w-[180px]">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full sm:w-auto"
                        >
                          <a
                            href={lead.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Maps</span>
                          </a>
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => openWhatsAppDialog(lead)}
                          className="w-full sm:w-auto bg-accent hover:bg-accent/90 relative"
                        >
                          {lead.whatsappSent && (
                            <CheckCircle2 className="w-3 h-3 absolute -top-1 -right-1 text-green-500 fill-green-500" />
                          )}
                          <MessageCircle className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full sm:w-auto hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600"
                          title={lead.instagramUrl ? 'Abrir Instagram' : 'Pesquisar no Instagram'}
                        >
                          <a
                            href={lead.instagramUrl || getInstagramSearchUrl(lead.name, lead.city)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Instagram className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Instagram</span>
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {filteredAndSortedLeads.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum lead encontrado com os filtros selecionados.
          </div>
        )}
      </Card>

      <WhatsAppDialog
        open={whatsAppDialog.open}
        onOpenChange={(open) => setWhatsAppDialog({ open, lead: null })}
        clinicName={whatsAppDialog.lead?.name || ''}
        phone={whatsAppDialog.lead?.phone || ''}
        leadId={whatsAppDialog.lead?.id || ''}
        onMessageSent={onLeadUpdate}
      />
    </>
  );
};
