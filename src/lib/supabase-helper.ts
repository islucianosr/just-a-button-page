import { supabase } from '@/integrations/supabase/client';

// Temporary helper to bypass type issues until Supabase types are regenerated
export const supabaseHelper = {
  from: (table: string) => {
    // @ts-ignore
    return supabase.from(table);
  }
};
