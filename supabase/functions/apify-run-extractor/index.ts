import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      query = 'restaurant',
      location = 'Luanda, Angola',
      maxResults = 50,
      language = 'pt'
    } = await req.json();

    // Token do dono da plataforma via variável de ambiente
    const apiToken = (Deno.env.get('APIFY_API_TOKEN') ?? '').trim();

    if (!apiToken) {
      console.error('❌ APIFY_API_TOKEN não configurado no ambiente');
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Configuração interna ausente. Contate o suporte.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const actorInput = {
      searchStringsArray: [query],
      locationQuery: location,
      maxCrawledPlacesPerSearch: maxResults,
      language: language,
      countryCode: '',
    };

    console.log('🚀 Executando busca no Google Maps...');
    console.log(`📍 Parâmetros: ${query} em ${location} (max: ${maxResults})`);

    // Executa o actor lukaskrivka/google-maps-with-contact-details via API
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/lukaskrivka~google-maps-with-contact-details/run-sync-get-dataset-items?token=${encodeURIComponent(apiToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actorInput),
        signal: AbortSignal.timeout(120000) // 2 minutos timeout
      }
    );

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      console.error(`❌ Erro da Apify API: ${runResponse.status} - ${errorText}`);
      throw new Error(`Apify API error: ${runResponse.status}`);
    }

    const items = await runResponse.json();

    console.log(`✅ Extraídos ${items.length} resultados.`);

    return new Response(
      JSON.stringify({
        status: 'success',
        total: items.length,
        data: items
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ Erro ao executar extractor:', error);

    // Verifica se é erro de autenticação ou limite
    const isAuthError = error.message?.includes('401') ||
      error.message?.includes('authentication') ||
      error.message?.includes('token');

    const isLimitError = error.message?.includes('402') ||
      error.message?.includes('limit') ||
      error.message?.includes('quota');

    let errorMessage = 'Erro ao executar busca no Google Maps';

    if (isAuthError || isLimitError) {
      errorMessage = 'Erro: Token inválido ou limite atingido';
    }

    return new Response(
      JSON.stringify({
        status: 'error',
        message: errorMessage,
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
