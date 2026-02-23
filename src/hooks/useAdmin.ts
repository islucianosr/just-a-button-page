import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          navigate('/admin/login');
          return;
        }

        setUser(session.user);

        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error || !roleData) {
          navigate('/admin/login');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session) {
          navigate('/admin/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const logAction = async (action: string, targetUserId?: string, details?: any) => {
    if (!user) return;

    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action,
      target_user_id: targetUserId,
      details,
    });
  };

  return { isAdmin, loading, user, logAction };
};
