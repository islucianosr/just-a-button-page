import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiKey } = await req.json();
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate API key with Apify
    // Formato correto: ?token=apify_api_xxx
    const token = String(apiKey).trim();
    console.log('🔍 Validando chave API com Apify...');

    // Tentar validação com query param (formato oficial da Apify)
    const response = await fetch(
      `https://api.apify.com/v2/users/me?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000) // 15 second timeout
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Validação da Apify falhou:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 200)
      });

      let errorMessage = '❌ Token inválido ou expirado. Verifique e tente novamente.';

      if (response.status === 401 || response.status === 403) {
        errorMessage = '❌ Token inválido ou expirado. Verifique e tente novamente.';
      } else if (response.status === 404) {
        errorMessage = '❌ Endpoint da Apify não encontrado. Verifique sua conexão.';
      } else if (response.status === 429) {
        errorMessage = '❌ Limite de requisições excedido. Aguarde alguns minutos.';
      } else if (response.status >= 500) {
        errorMessage = '❌ Servidor da Apify temporariamente indisponível. Tente novamente.';
      }

      return new Response(
        JSON.stringify({
          isValid: false,
          error: errorMessage
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userData = await response.json();
    console.log('✅ Validação bem-sucedida! Usuário:', userData.data?.username || userData.data?.id);
    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Utilizador não encontrado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if config exists
    const { data: existingConfig } = await supabaseClient
      .from('apify_config')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    // Insert or update config
    if (existingConfig) {
      await supabaseClient
        .from('apify_config')
        .update({
          api_key: apiKey,
          is_valid: true,
          last_tested_at: new Date().toISOString()
        })
        .eq('id', existingConfig.id);
    } else {
      await supabaseClient
        .from('apify_config')
        .insert({
          user_id: user.id,
          api_key: apiKey,
          is_valid: true,
          last_tested_at: new Date().toISOString()
        });
    }

    return new Response(
      JSON.stringify({ 
        isValid: true,
        message: '✅ Conexão bem-sucedida com Apify!',
        username: userData.data?.username || 'Usuário'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in apify-validate-key:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});