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
      applications: {
        Row: {
          applied_date: string | null
          created_at: string
          id: string
          job_id: string
          notes: string | null
          resume_id: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_date?: string | null
          created_at?: string
          id?: string
          job_id: string
          notes?: string | null
          resume_id?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_date?: string | null
          created_at?: string
          id?: string
          job_id?: string
          notes?: string | null
          resume_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      github_data: {
        Row: {
          created_at: string
          extracted_skills: string[] | null
          id: string
          last_synced_at: string | null
          project_summaries: Json | null
          repositories: Json | null
          top_languages: string[] | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          extracted_skills?: string[] | null
          id?: string
          last_synced_at?: string | null
          project_summaries?: Json | null
          repositories?: Json | null
          top_languages?: string[] | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          extracted_skills?: string[] | null
          id?: string
          last_synced_at?: string | null
          project_summaries?: Json | null
          repositories?: Json | null
          top_languages?: string[] | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          analysis_data: Json | null
          company_name: string | null
          created_at: string
          experience_level: string | null
          id: string
          job_description: string
          job_title: string
          keywords: string[] | null
          preferred_skills: string[] | null
          required_skills: string[] | null
          responsibilities: string[] | null
          soft_skills: string[] | null
          tools: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_data?: Json | null
          company_name?: string | null
          created_at?: string
          experience_level?: string | null
          id?: string
          job_description: string
          job_title: string
          keywords?: string[] | null
          preferred_skills?: string[] | null
          required_skills?: string[] | null
          responsibilities?: string[] | null
          soft_skills?: string[] | null
          tools?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_data?: Json | null
          company_name?: string | null
          created_at?: string
          experience_level?: string | null
          id?: string
          job_description?: string
          job_title?: string
          keywords?: string[] | null
          preferred_skills?: string[] | null
          required_skills?: string[] | null
          responsibilities?: string[] | null
          soft_skills?: string[] | null
          tools?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      linkedin_analyses: {
        Row: {
          alignment_score: number | null
          ats_tips: string[] | null
          core_skills: string[] | null
          created_at: string
          experience_highlights: string[] | null
          headline: string | null
          id: string
          improved_bullets: string[] | null
          industry_keywords: string[] | null
          matching_jobs: Json | null
          missing_keywords: string[] | null
          optimized_summary: string | null
          recommendations: string[] | null
          user_id: string
        }
        Insert: {
          alignment_score?: number | null
          ats_tips?: string[] | null
          core_skills?: string[] | null
          created_at?: string
          experience_highlights?: string[] | null
          headline?: string | null
          id?: string
          improved_bullets?: string[] | null
          industry_keywords?: string[] | null
          matching_jobs?: Json | null
          missing_keywords?: string[] | null
          optimized_summary?: string | null
          recommendations?: string[] | null
          user_id: string
        }
        Update: {
          alignment_score?: number | null
          ats_tips?: string[] | null
          core_skills?: string[] | null
          created_at?: string
          experience_highlights?: string[] | null
          headline?: string | null
          id?: string
          improved_bullets?: string[] | null
          industry_keywords?: string[] | null
          matching_jobs?: Json | null
          missing_keywords?: string[] | null
          optimized_summary?: string | null
          recommendations?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          certifications: Json | null
          created_at: string
          education: Json | null
          email: string | null
          full_name: string | null
          github_username: string | null
          id: string
          linkedin_headline: string | null
          linkedin_summary: string | null
          linkedin_url: string | null
          location: string | null
          phone: string | null
          portfolio_website: string | null
          professional_summary: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
          work_experience: Json | null
        }
        Insert: {
          certifications?: Json | null
          created_at?: string
          education?: Json | null
          email?: string | null
          full_name?: string | null
          github_username?: string | null
          id?: string
          linkedin_headline?: string | null
          linkedin_summary?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          portfolio_website?: string | null
          professional_summary?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
          work_experience?: Json | null
        }
        Update: {
          certifications?: Json | null
          created_at?: string
          education?: Json | null
          email?: string | null
          full_name?: string | null
          github_username?: string | null
          id?: string
          linkedin_headline?: string | null
          linkedin_summary?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          portfolio_website?: string | null
          professional_summary?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
          work_experience?: Json | null
        }
        Relationships: []
      }
      resume_history: {
        Row: {
          created_at: string
          education: Json | null
          email: string | null
          experience: Json | null
          full_name: string | null
          github: string | null
          id: string
          job_keywords: string[] | null
          job_title: string
          linkedin: string | null
          location: string | null
          phone: string | null
          portfolio: string | null
          projects: Json | null
          resume_text: string
          skills: string[] | null
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          education?: Json | null
          email?: string | null
          experience?: Json | null
          full_name?: string | null
          github?: string | null
          id?: string
          job_keywords?: string[] | null
          job_title: string
          linkedin?: string | null
          location?: string | null
          phone?: string | null
          portfolio?: string | null
          projects?: Json | null
          resume_text: string
          skills?: string[] | null
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          education?: Json | null
          email?: string | null
          experience?: Json | null
          full_name?: string | null
          github?: string | null
          id?: string
          job_keywords?: string[] | null
          job_title?: string
          linkedin?: string | null
          location?: string | null
          phone?: string | null
          portfolio?: string | null
          projects?: Json | null
          resume_text?: string
          skills?: string[] | null
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          ats_score: number | null
          content: Json
          created_at: string
          id: string
          is_draft: boolean | null
          job_id: string | null
          matched_keywords: string[] | null
          missing_keywords: string[] | null
          template: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ats_score?: number | null
          content: Json
          created_at?: string
          id?: string
          is_draft?: boolean | null
          job_id?: string | null
          matched_keywords?: string[] | null
          missing_keywords?: string[] | null
          template?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ats_score?: number | null
          content?: Json
          created_at?: string
          id?: string
          is_draft?: boolean | null
          job_id?: string | null
          matched_keywords?: string[] | null
          missing_keywords?: string[] | null
          template?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resumes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
