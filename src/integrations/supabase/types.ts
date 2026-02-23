export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      apify_config: {
        Row: {
          api_key: string
          created_at: string
          id: string
          is_valid: boolean | null
          last_tested_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          is_valid?: boolean | null
          last_tested_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          is_valid?: boolean | null
          last_tested_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      apify_searches: {
        Row: {
          created_at: string
          dataset_id: string | null
          error_message: string | null
          estimated_cost: number | null
          id: string
          name: string
          run_id: string | null
          search_params: Json
          search_type: string
          status: string
          total_results: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dataset_id?: string | null
          error_message?: string | null
          estimated_cost?: number | null
          id?: string
          name: string
          run_id?: string | null
          search_params: Json
          search_type: string
          status?: string
          total_results?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dataset_id?: string | null
          error_message?: string | null
          estimated_cost?: number | null
          id?: string
          name?: string
          run_id?: string | null
          search_params?: Json
          search_type?: string
          status?: string
          total_results?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lead_followups: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          followup_type: string
          id: string
          lead_id: string
          note: string | null
          scheduled_date: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          followup_type: string
          id?: string
          lead_id: string
          note?: string | null
          scheduled_date: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          followup_type?: string
          id?: string
          lead_id?: string
          note?: string | null
          scheduled_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_followups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          lead_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lead_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lead_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          categories: string[] | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          google_url: string | null
          id: string
          is_contacted: boolean | null
          name: string
          observations: string | null
          phone: string | null
          priority_score: number | null
          profile_id: string | null
          rating: number | null
          reviews_count: number | null
          search_id: string | null
          updated_at: string
          user_id: string
          website: string | null
          whatsapp_sent: boolean | null
          whatsapp_sent_at: string | null
        }
        Insert: {
          address?: string | null
          categories?: string[] | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          google_url?: string | null
          id?: string
          is_contacted?: boolean | null
          name: string
          observations?: string | null
          phone?: string | null
          priority_score?: number | null
          profile_id?: string | null
          rating?: number | null
          reviews_count?: number | null
          search_id?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          whatsapp_sent?: boolean | null
          whatsapp_sent_at?: string | null
        }
        Update: {
          address?: string | null
          categories?: string[] | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          google_url?: string | null
          id?: string
          is_contacted?: boolean | null
          name?: string
          observations?: string | null
          phone?: string | null
          priority_score?: number | null
          profile_id?: string | null
          rating?: number | null
          reviews_count?: number | null
          search_id?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          whatsapp_sent?: boolean | null
          whatsapp_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "apify_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_leads: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          position: number
          stage: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          position?: number
          stage?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          position?: number
          stage?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          duration_months: number
          has_api_access: boolean | null
          has_white_label: boolean | null
          id: string
          is_active: boolean | null
          is_unlimited: boolean | null
          leads_limit: number
          name: string
          price_cents: number
          slug: string
        }
        Insert: {
          created_at?: string
          duration_months?: number
          has_api_access?: boolean | null
          has_white_label?: boolean | null
          id?: string
          is_active?: boolean | null
          is_unlimited?: boolean | null
          leads_limit?: number
          name: string
          price_cents?: number
          slug: string
        }
        Update: {
          created_at?: string
          duration_months?: number
          has_api_access?: boolean | null
          has_white_label?: boolean | null
          id?: string
          is_active?: boolean | null
          is_unlimited?: boolean | null
          leads_limit?: number
          name?: string
          price_cents?: number
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string | null
          account_type: string | null
          company_name: string | null
          created_at: string
          days_active: number | null
          email: string
          full_name: string | null
          id: string
          last_login_at: string | null
          leads_reset_date: string | null
          leads_used_this_month: number | null
          plan_id: string | null
          subscription_end: string | null
          subscription_start: string | null
          updated_at: string
        }
        Insert: {
          account_status?: string | null
          account_type?: string | null
          company_name?: string | null
          created_at?: string
          days_active?: number | null
          email: string
          full_name?: string | null
          id: string
          last_login_at?: string | null
          leads_reset_date?: string | null
          leads_used_this_month?: number | null
          plan_id?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          updated_at?: string
        }
        Update: {
          account_status?: string | null
          account_type?: string | null
          company_name?: string | null
          created_at?: string
          days_active?: number | null
          email?: string
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          leads_reset_date?: string | null
          leads_used_this_month?: number | null
          plan_id?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_submissions: {
        Row: {
          accepts_rules: boolean
          country: string
          created_at: string
          decision_maker: string
          email: string
          full_name: string
          has_sales_process: string
          id: string
          lead_objective: string
          monthly_investment: string
          profile_type: string
          status: string
          updated_at: string
          whatsapp: string
          willing_to_invest: string
        }
        Insert: {
          accepts_rules?: boolean
          country: string
          created_at?: string
          decision_maker: string
          email: string
          full_name: string
          has_sales_process: string
          id?: string
          lead_objective: string
          monthly_investment: string
          profile_type: string
          status?: string
          updated_at?: string
          whatsapp: string
          willing_to_invest: string
        }
        Update: {
          accepts_rules?: boolean
          country?: string
          created_at?: string
          decision_maker?: string
          email?: string
          full_name?: string
          has_sales_process?: string
          id?: string
          lead_objective?: string
          monthly_investment?: string
          profile_type?: string
          status?: string
          updated_at?: string
          whatsapp?: string
          willing_to_invest?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_daily_count: {
        Row: {
          count_date: string
          created_at: string
          id: string
          message_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          count_date?: string
          created_at?: string
          id?: string
          message_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          count_date?: string
          created_at?: string
          id?: string
          message_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      set_admin_by_email: { Args: { _email: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
