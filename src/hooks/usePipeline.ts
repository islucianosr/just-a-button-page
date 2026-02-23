import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PipelineLead, PipelineStage, LeadNote, LeadFollowup, FollowupType } from '@/types/pipeline';

export const usePipeline = () => {
  const [pipelineLeads, setPipelineLeads] = useState<PipelineLead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPipelineLeads = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('pipeline_leads')
        .select(`
          *,
          lead:leads(id, name, phone, email, city, website, categories, rating, reviews_count, observations)
        `)
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (error) throw error;
      setPipelineLeads((data as unknown as PipelineLead[]) || []);
    } catch (error) {
      console.error('Error fetching pipeline leads:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipelineLeads();
  }, [fetchPipelineLeads]);

  const addLeadToPipeline = async (leadId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check if lead already exists in pipeline
      const existing = pipelineLeads.find(pl => pl.lead_id === leadId);
      if (existing) return false;

      const { error } = await supabase
        .from('pipeline_leads')
        .insert({
          lead_id: leadId,
          user_id: user.id,
          stage: 'lead_novo' as PipelineStage,
          position: pipelineLeads.filter(pl => pl.stage === 'lead_novo').length,
        });

      if (error) throw error;
      await fetchPipelineLeads();
      return true;
    } catch (error) {
      console.error('Error adding lead to pipeline:', error);
      return false;
    }
  };

  const moveLeadToStage = async (pipelineLeadId: string, newStage: PipelineStage): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('pipeline_leads')
        .update({ stage: newStage })
        .eq('id', pipelineLeadId);

      if (error) throw error;
      await fetchPipelineLeads();
      return true;
    } catch (error) {
      console.error('Error moving lead:', error);
      return false;
    }
  };

  const removeFromPipeline = async (pipelineLeadId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('pipeline_leads')
        .delete()
        .eq('id', pipelineLeadId);

      if (error) throw error;
      await fetchPipelineLeads();
      return true;
    } catch (error) {
      console.error('Error removing lead from pipeline:', error);
      return false;
    }
  };

  return {
    pipelineLeads,
    loading,
    addLeadToPipeline,
    moveLeadToStage,
    removeFromPipeline,
    refetch: fetchPipelineLeads,
  };
};

export const useLeadNotes = (leadId: string) => {
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!leadId) return;
    
    try {
      const { data, error } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = async (content: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('lead_notes')
        .insert({
          lead_id: leadId,
          user_id: user.id,
          content,
        });

      if (error) throw error;
      await fetchNotes();
      return true;
    } catch (error) {
      console.error('Error adding note:', error);
      return false;
    }
  };

  const deleteNote = async (noteId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('lead_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      await fetchNotes();
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  };

  return { notes, loading, addNote, deleteNote, refetch: fetchNotes };
};

export const useLeadFollowups = (leadId?: string) => {
  const [followups, setFollowups] = useState<LeadFollowup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowups = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('lead_followups')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true });

      if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFollowups((data as LeadFollowup[]) || []);
    } catch (error) {
      console.error('Error fetching followups:', error);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchFollowups();
  }, [fetchFollowups]);

  const addFollowup = async (
    targetLeadId: string,
    type: FollowupType,
    scheduledDate: Date,
    note?: string
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('lead_followups')
        .insert({
          lead_id: targetLeadId,
          user_id: user.id,
          followup_type: type,
          scheduled_date: scheduledDate.toISOString(),
          note,
        });

      if (error) throw error;
      await fetchFollowups();
      return true;
    } catch (error) {
      console.error('Error adding followup:', error);
      return false;
    }
  };

  const completeFollowup = async (followupId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('lead_followups')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', followupId);

      if (error) throw error;
      await fetchFollowups();
      return true;
    } catch (error) {
      console.error('Error completing followup:', error);
      return false;
    }
  };

  const deleteFollowup = async (followupId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('lead_followups')
        .delete()
        .eq('id', followupId);

      if (error) throw error;
      await fetchFollowups();
      return true;
    } catch (error) {
      console.error('Error deleting followup:', error);
      return false;
    }
  };

  // Get overdue followups
  const overdueFollowups = followups.filter(
    f => !f.completed && new Date(f.scheduled_date) < new Date()
  );

  // Get next followup
  const nextFollowup = followups.find(f => !f.completed);

  // Get last completed followup
  const lastCompleted = followups
    .filter(f => f.completed)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0];

  return {
    followups,
    loading,
    addFollowup,
    completeFollowup,
    deleteFollowup,
    overdueFollowups,
    nextFollowup,
    lastCompleted,
    refetch: fetchFollowups,
  };
};
