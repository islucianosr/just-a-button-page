export type PriorityLevel = 'ALTA' | 'BAIXA';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  category: string;
  website: string;
  reviewsCount: number;
  rating: number;
  googleMapsUrl: string;
  priority: PriorityLevel;
  hasWebsite: boolean;
  observations: string;
  whatsappSent?: boolean;
  whatsappSentAt?: string;
  searchId?: string;
  instagramUrl?: string;
  facebookUrl?: string;
}

export interface LeadStats {
  total: number;
  high: number;
  low: number;
  withoutWebsite: number;
  withWebsite: number;
}
