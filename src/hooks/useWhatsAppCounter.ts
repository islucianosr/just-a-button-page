import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DAILY_LIMIT = 39;

export const useWhatsAppCounter = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('whatsapp_daily_count')
        .select('message_count')
        .eq('user_id', user.id)
        .eq('count_date', today)
        .maybeSingle();

      if (error) throw error;
      setCount(data?.message_count || 0);
    } catch (error) {
      console.error('Error fetching WhatsApp count:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  const incrementCount = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const today = new Date().toISOString().split('T')[0];
      
      // Try to update existing record
      const { data: existing } = await supabase
        .from('whatsapp_daily_count')
        .select('id, message_count')
        .eq('user_id', user.id)
        .eq('count_date', today)
        .maybeSingle();

      if (existing) {
        const newCount = existing.message_count + 1;
        await supabase
          .from('whatsapp_daily_count')
          .update({ message_count: newCount })
          .eq('id', existing.id);
        setCount(newCount);
      } else {
        await supabase
          .from('whatsapp_daily_count')
          .insert({ 
            user_id: user.id, 
            count_date: today, 
            message_count: 1 
          });
        setCount(1);
      }

      return true;
    } catch (error) {
      console.error('Error incrementing WhatsApp count:', error);
      return false;
    }
  }, []);

  const isLimitReached = count >= DAILY_LIMIT;
  const remaining = Math.max(0, DAILY_LIMIT - count);

  return {
    count,
    loading,
    incrementCount,
    isLimitReached,
    remaining,
    limit: DAILY_LIMIT,
    refetch: fetchCount,
  };
};
