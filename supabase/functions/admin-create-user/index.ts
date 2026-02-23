import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verify the caller is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if caller is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Acesso restrito a administradores' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get request body
    const body = await req.json();
    const { 
      email, 
      password, 
      fullName, 
      companyName, 
      planId, 
      accountType, 
      durationMonths, 
      customLeadsLimit,
      sendCredentials 
    } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email e password são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Admin ${caller.email} creating user: ${email}`);

    // Create user with admin API
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        company_name: companyName,
      },
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // The trigger will create the profile, but we need to update it with custom values
    if (newUser.user) {
      const subscriptionEnd = new Date();
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + (durationMonths || 1));

      const updateData: any = {
        full_name: fullName,
        company_name: companyName,
        account_type: accountType || 'regular',
        subscription_end: subscriptionEnd.toISOString(),
      };

      if (planId) {
        updateData.plan_id = planId;
      }

      if (customLeadsLimit) {
        // Store custom limit in profile or handle it differently
        console.log(`Custom leads limit set: ${customLeadsLimit}`);
      }

      // Wait a bit for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 500));

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', newUser.user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
      }

      // TODO: If sendCredentials is true, send email with credentials
      if (sendCredentials) {
        console.log(`Should send credentials to ${email}`);
        // Implement email sending logic here
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      userId: newUser.user?.id,
      message: 'Utilizador criado com sucesso'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
