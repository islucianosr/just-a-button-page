import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchParams {
  searchName: string;
  searchType: 'local' | 'urls';
  keyword?: string;
  location?: string;
  urls?: string[];
  language?: string;
  maxResults?: number;
  radius?: number;
}

const SOCIAL_MEDIA_DOMAINS = ['instagram.com', 'facebook.com', 'fb.com', 'twitter.com', 'linkedin.com'];

function hasRealWebsite(website: string): boolean {
  if (!website || website.trim() === '') return false;
  return !SOCIAL_MEDIA_DOMAINS.some(domain => website.toLowerCase().includes(domain));
}

function calculatePriorityScore(lead: any): number {
  const realWebsite = hasRealWebsite(lead.website);
  return realWebsite ? 30 : 100;
}

// ─── Logger helper ─────────────────────────────────────────────────────────────
async function writeLog(
  client: any,
  userId: string,
  level: 'info' | 'warn' | 'error' | 'success',
  step: string,
  message: string,
  details?: Record<string, any>,
  searchId?: string
) {
  try {
    await client.from('search_logs').insert({
      user_id: userId,
      search_id: searchId ?? null,
      level,
      step,
      message,
      details: details ?? null,
    });
  } catch (e) {
    // Logging should never crash the main flow
    console.error('Failed to write log:', e);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const params: SearchParams = await req.json();
    console.log('Received search params:', { ...params, urls: params.urls?.length });

    if (!params.searchName?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Nome da pesquisa é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const maxResults = Math.min(params.maxResults || 20, 100);

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Utilizador não encontrado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const uid = user.id;
    console.log('User authenticated:', uid);

    // Token do dono da plataforma via variável de ambiente
    const apiToken = (Deno.env.get('APIFY_API_TOKEN') ?? '').trim();

    if (!apiToken) {
      await writeLog(supabaseClient, uid, 'error', 'config', 'APIFY_API_TOKEN não configurado no servidor');
      return new Response(
        JSON.stringify({ error: 'Configuração interna ausente. Contate o suporte.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build Apify input
    let apifyInput: any = {
      language: params.language || 'pt',
      countryCode: '',
      maxCrawledPlacesPerSearch: maxResults,
    };

    if (params.searchType === 'local') {
      if (!params.keyword?.trim() || !params.location?.trim()) {
        return new Response(
          JSON.stringify({ error: 'Palavra-chave e localização são obrigatórios para busca local' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      apifyInput.searchStringsArray = [params.keyword];
      apifyInput.locationQuery = params.location;
      if (params.radius) apifyInput.maxCrawledPlaces = params.radius;
    } else {
      if (!params.urls || params.urls.length === 0) {
        return new Response(
          JSON.stringify({ error: 'URLs são obrigatórias para busca por URLs' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      apifyInput.startUrls = params.urls.map(url => ({ url }));
    }

    // Create search record
    const { data: searchRecord, error: searchError } = await supabaseClient
      .from('apify_searches')
      .insert({
        user_id: uid,
        name: params.searchName,
        search_type: params.searchType,
        search_params: apifyInput,
        status: 'running',
        estimated_cost: maxResults * 0.004
      })
      .select()
      .single();

    if (searchError || !searchRecord) {
      await writeLog(supabaseClient, uid, 'error', 'db_insert_search', 'Erro ao criar registo de pesquisa', { error: searchError?.message });
      return new Response(
        JSON.stringify({ error: 'Erro ao criar pesquisa' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sid = searchRecord.id;

    // ── LOG: search started ──────────────────────────────────────────────────
    await writeLog(supabaseClient, uid, 'info', 'search_start', `Busca iniciada: "${params.searchName}"`, {
      keyword: params.keyword,
      location: params.location,
      maxResults,
    }, sid);

    // Execute Apify actor
    console.log('🚀 Executando Apify actor...');
    await writeLog(supabaseClient, uid, 'info', 'apify_request', 'Enviando pedido para Apify API...', {
      actor: 'lukaskrivka~google-maps-with-contact-details',
      maxCrawledPlacesPerSearch: maxResults,
    }, sid);

    let apifyResponse: Response;
    try {
      apifyResponse = await fetch(
        `https://api.apify.com/v2/acts/lukaskrivka~google-maps-with-contact-details/run-sync-get-dataset-items?token=${encodeURIComponent(apiToken)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apifyInput),
          signal: AbortSignal.timeout(180000)
        }
      );
    } catch (fetchErr: any) {
      const isTimeout = fetchErr?.name === 'TimeoutError' || fetchErr?.message?.includes('timeout');
      const msg = isTimeout ? 'Timeout: Apify demorou mais de 3 minutos' : `Erro de rede ao contactar Apify: ${fetchErr?.message}`;
      await writeLog(supabaseClient, uid, 'error', 'apify_request', msg, { error: fetchErr?.message }, sid);
      await supabaseClient.from('apify_searches').update({ status: 'failed', error_message: msg }).eq('id', sid);
      return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('Apify response status:', apifyResponse.status);

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text();
      let errorMessage = 'Erro ao executar pesquisa na Apify';
      if (apifyResponse.status === 401 || apifyResponse.status === 403) {
        errorMessage = '❌ Token inválido ou expirado. Verifique nas configurações.';
      } else if (apifyResponse.status === 402) {
        errorMessage = '❌ Saldo insuficiente na conta Apify.';
      } else if (apifyResponse.status === 404) {
        errorMessage = '❌ Actor não encontrado.';
      } else if (apifyResponse.status === 429) {
        errorMessage = '❌ Limite de requisições excedido. Aguarde alguns minutos.';
      } else if (apifyResponse.status >= 500) {
        errorMessage = '❌ Servidor da Apify temporariamente indisponível.';
      }

      await writeLog(supabaseClient, uid, 'error', 'apify_response', errorMessage, {
        status: apifyResponse.status,
        body: errorText.substring(0, 500),
      }, sid);

      await supabaseClient.from('apify_searches').update({ status: 'failed', error_message: errorMessage }).eq('id', sid);
      return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const results = await apifyResponse.json();

    await writeLog(supabaseClient, uid, 'success', 'apify_response', `Apify retornou ${results.length} resultados`, {
      count: results.length,
    }, sid);

    console.log('Apify results:', results.length, 'items');

    // Process leads
    const leadsToInsert = results.map((item: any) => {
      const lead: any = {
        search_id: sid,
        user_id: uid,
        name: item.title || item.name || 'Sem nome',
        address: item.address || '',
        city: item.city || '',
        country: item.country || '',
        phone: item.phone || item.phoneNumber || '',
        email: item.email || (item.emails && item.emails[0]) || '',
        website: item.website || '',
        rating: item.totalScore ? parseFloat(item.totalScore) : (item.rating ? parseFloat(item.rating) : null),
        reviews_count: item.reviewsCount || 0,
        categories: item.categories || (item.categoryName ? [item.categoryName] : []),
        google_url: item.url || '',
        instagram_url: (item.instagramProfiles && item.instagramProfiles[0]) || (item.instagrams && item.instagrams[0]) || '',
        facebook_url: (item.facebookUrls && item.facebookUrls[0]) || (item.facebooks && item.facebooks[0]) || '',
        priority_score: 0,
        is_contacted: false,
        observations: ''
      };
      lead.priority_score = calculatePriorityScore(lead);
      if (lead.priority_score >= 70) lead.observations = '⭐ SEM WEBSITE - Alta Prioridade';
      return lead;
    }).sort((a: any, b: any) => b.priority_score - a.priority_score);

    if (leadsToInsert.length > 0) {
      const { error: insertError } = await supabaseClient.from('leads').insert(leadsToInsert);
      if (insertError) {
        await writeLog(supabaseClient, uid, 'error', 'db_insert_leads', 'Erro ao gravar leads na base de dados', { error: insertError.message }, sid);
        console.error('Error inserting leads:', insertError);
      } else {
        await writeLog(supabaseClient, uid, 'success', 'db_insert_leads', `${leadsToInsert.length} leads guardados com sucesso`, {
          total: leadsToInsert.length,
          highPriority: leadsToInsert.filter((l: any) => l.priority_score >= 70).length,
        }, sid);
      }
    }

    await supabaseClient.from('apify_searches').update({ status: 'succeeded', total_results: results.length }).eq('id', sid);

    const highPriorityCount = leadsToInsert.filter((l: any) => l.priority_score >= 70).length;

    await writeLog(supabaseClient, uid, 'success', 'search_complete', `✅ Busca concluída: ${results.length} leads | ${highPriorityCount} alta prioridade`, {
      total: results.length,
      highPriority: highPriorityCount,
    }, sid);

    console.log(`✅ Busca concluída: ${results.length} leads | ${highPriorityCount} Oportunidades Principais`);

    return new Response(
      JSON.stringify({ success: true, searchId: sid, totalResults: results.length, highPriorityCount }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in apify-execute-search:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});