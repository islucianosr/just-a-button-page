import { Lead, PriorityLevel } from '@/types/lead';

export const parseXMLFile = async (file: File): Promise<Lead[]> => {
  const text = await file.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, 'text/xml');
  
  const items = xmlDoc.querySelectorAll('item');
  const leads: Lead[] = [];

  items.forEach((item, index) => {
    const phone = item.querySelector('phone')?.textContent || '';
    
    // Apenas incluir se tiver telefone
    if (!phone) return;

    const name = item.querySelector('title')?.textContent || '';
    const street = item.querySelector('street')?.textContent || '';
    const city = item.querySelector('city')?.textContent || '';
    const category = item.querySelector('categoryName')?.textContent || '';
    const website = item.querySelector('website')?.textContent || '';
    const reviewsCount = parseInt(item.querySelector('reviewsCount')?.textContent || '0');
    const rating = parseFloat(item.querySelector('totalScore')?.textContent || '0');
    const googleMapsUrl = item.querySelector('url')?.textContent || '';

    const hasWebsite = checkHasWebsite(website);
    const priority = calculatePriority(hasWebsite);
    const observations = generateObservations(website, reviewsCount, rating, hasWebsite);

    leads.push({
      id: `lead-${index}`,
      name,
      phone,
      email: '', // Campo vazio para preenchimento manual
      address: street,
      city,
      category,
      website,
      reviewsCount,
      rating,
      googleMapsUrl,
      priority,
      hasWebsite,
      observations,
    });
  });

  return leads;
};

const checkHasWebsite = (website: string): boolean => {
  if (!website) return false;
  
  const socialMediaDomains = [
    'instagram.com',
    'facebook.com',
    'fb.com',
    'twitter.com',
    'linkedin.com',
  ];
  
  const isSocialMedia = socialMediaDomains.some(domain => 
    website.toLowerCase().includes(domain)
  );
  
  return !isSocialMedia;
};

const calculatePriority = (hasWebsite: boolean): PriorityLevel => {
  // Empresas SEM website = ALTA PRIORIDADE
  // Empresas COM website = BAIXA PRIORIDADE
  return !hasWebsite ? 'ALTA' : 'BAIXA';
};

const generateObservations = (
  website: string,
  reviewsCount: number,
  rating: number,
  hasWebsite: boolean
): string => {
  const obs: string[] = [];
  
  // Marcar empresas sem site
  if (!hasWebsite) {
    obs.push('⭐ SEM WEBSITE - Alta Prioridade');
  }
  
  if (website.includes('instagram.com')) {
    obs.push('Apenas Instagram');
  } else if (website.includes('facebook.com')) {
    obs.push('Apenas Facebook');
  }
  
  if (reviewsCount < 5) {
    obs.push(`Apenas ${reviewsCount} avaliações`);
  }
  
  if (rating < 4.0 && rating > 0) {
    obs.push(`Rating baixo: ${rating.toFixed(1)}`);
  }
  
  if (reviewsCount > 100) {
    obs.push('Já estabelecida');
  }
  
  return obs.join(' • ');
};
