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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      assessment_invites: {
        Row: {
          assessment_id: string
          candidate_email: string | null
          candidate_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          link: string | null
          recruiter_id: string
          status: string | null
          token: string | null
        }
        Insert: {
          assessment_id: string
          candidate_email?: string | null
          candidate_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          recruiter_id: string
          status?: string | null
          token?: string | null
        }
        Update: {
          assessment_id?: string
          candidate_email?: string | null
          candidate_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          recruiter_id?: string
          status?: string | null
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_invites_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_invites_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_invites_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiters"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_submissions: {
        Row: {
          ai_analysis: Json | null
          audio_url: string | null
          candidate_id: string
          completed_at: string | null
          feedback: string | null
          id: string
          invite_id: string
          responses: Json
          session_duration: number | null
          transcript: Json | null
          video_url: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          audio_url?: string | null
          candidate_id: string
          completed_at?: string | null
          feedback?: string | null
          id?: string
          invite_id: string
          responses: Json
          session_duration?: number | null
          transcript?: Json | null
          video_url?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          audio_url?: string | null
          candidate_id?: string
          completed_at?: string | null
          feedback?: string | null
          id?: string
          invite_id?: string
          responses?: Json
          session_duration?: number | null
          transcript?: Json | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_submissions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_submissions_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "assessment_invites"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          questions: Json
          recruiter_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          questions: Json
          recruiter_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          questions?: Json
          recruiter_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiters"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_call_sessions: {
        Row: {
          audio_urls: string[]
          callback_url: string | null
          candidate_id: string
          completed_at: string | null
          created_at: string
          id: string
          phone_number: string
          prompts: string[]
          status: string
          voice_id: string
          webhook_data: Json | null
        }
        Insert: {
          audio_urls?: string[]
          callback_url?: string | null
          candidate_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          phone_number: string
          prompts?: string[]
          status?: string
          voice_id: string
          webhook_data?: Json | null
        }
        Update: {
          audio_urls?: string[]
          callback_url?: string | null
          candidate_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          phone_number?: string
          prompts?: string[]
          status?: string
          voice_id?: string
          webhook_data?: Json | null
        }
        Relationships: []
      }
      interview_invites: {
        Row: {
          created_at: string | null
          id: string
          interview_date: string | null
          invite_link: string | null
          recruiter_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interview_date?: string | null
          invite_link?: string | null
          recruiter_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interview_date?: string | null
          invite_link?: string | null
          recruiter_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_invites_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_invites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_results: {
        Row: {
          ai_feedback: string | null
          audio_url: string | null
          created_at: string | null
          id: string
          invite_id: string
          score: number | null
          transcript: string | null
          video_url: string | null
        }
        Insert: {
          ai_feedback?: string | null
          audio_url?: string | null
          created_at?: string | null
          id?: string
          invite_id: string
          score?: number | null
          transcript?: string | null
          video_url?: string | null
        }
        Update: {
          ai_feedback?: string | null
          audio_url?: string | null
          created_at?: string | null
          id?: string
          invite_id?: string
          score?: number | null
          transcript?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_results_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "interview_invites"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          body_analysis: Json | null
          body_language: number | null
          candidate_name: string | null
          clarity: number | null
          communication_style: number | null
          confidence: number | null
          confidence_score: string | null
          created_at: string
          date: string
          duration: string
          email_address: string | null
          example_usage: number | null
          facial_analysis: Json
          feedback: string | null
          id: string
          interview_overall_score: string | null
          interview_report_url: string | null
          language_used: string | null
          mobile_number: string | null
          problem_solving: number | null
          relevance: number | null
          response_analysis: Json | null
          resume_url: string | null
          role: string
          score: number
          structure: number | null
          target_role: string | null
          tone_language: number | null
          transcript: string | null
          type: string
          user_id: string
          video_url: string | null
          voice_analysis: Json
          voice_modulation: number | null
        }
        Insert: {
          body_analysis?: Json | null
          body_language?: number | null
          candidate_name?: string | null
          clarity?: number | null
          communication_style?: number | null
          confidence?: number | null
          confidence_score?: string | null
          created_at?: string
          date?: string
          duration: string
          email_address?: string | null
          example_usage?: number | null
          facial_analysis?: Json
          feedback?: string | null
          id?: string
          interview_overall_score?: string | null
          interview_report_url?: string | null
          language_used?: string | null
          mobile_number?: string | null
          problem_solving?: number | null
          relevance?: number | null
          response_analysis?: Json | null
          resume_url?: string | null
          role: string
          score: number
          structure?: number | null
          target_role?: string | null
          tone_language?: number | null
          transcript?: string | null
          type: string
          user_id: string
          video_url?: string | null
          voice_analysis?: Json
          voice_modulation?: number | null
        }
        Update: {
          body_analysis?: Json | null
          body_language?: number | null
          candidate_name?: string | null
          clarity?: number | null
          communication_style?: number | null
          confidence?: number | null
          confidence_score?: string | null
          created_at?: string
          date?: string
          duration?: string
          email_address?: string | null
          example_usage?: number | null
          facial_analysis?: Json
          feedback?: string | null
          id?: string
          interview_overall_score?: string | null
          interview_report_url?: string | null
          language_used?: string | null
          mobile_number?: string | null
          problem_solving?: number | null
          relevance?: number | null
          response_analysis?: Json | null
          resume_url?: string | null
          role?: string
          score?: number
          structure?: number | null
          target_role?: string | null
          tone_language?: number | null
          transcript?: string | null
          type?: string
          user_id?: string
          video_url?: string | null
          voice_analysis?: Json
          voice_modulation?: number | null
        }
        Relationships: []
      }
      meetup_attendees: {
        Row: {
          created_at: string
          id: string
          meetup_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meetup_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meetup_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetup_attendees_meetup_id_fkey"
            columns: ["meetup_id"]
            isOneToOne: false
            referencedRelation: "meetups"
            referencedColumns: ["id"]
          },
        ]
      }
      meetups: {
        Row: {
          attendees: number
          avatar: string | null
          capacity: number
          coordinates: Json | null
          created_at: string
          date: string
          description: string
          host: string
          host_title: string
          id: string
          location: string
          tags: string[]
          time: string
          title: string
          user_id: string
        }
        Insert: {
          attendees?: number
          avatar?: string | null
          capacity: number
          coordinates?: Json | null
          created_at?: string
          date: string
          description: string
          host: string
          host_title: string
          id?: string
          location: string
          tags?: string[]
          time: string
          title: string
          user_id: string
        }
        Update: {
          attendees?: number
          avatar?: string | null
          capacity?: number
          coordinates?: Json | null
          created_at?: string
          date?: string
          description?: string
          host?: string
          host_title?: string
          id?: string
          location?: string
          tags?: string[]
          time?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          interview_preferences: Json | null
          languages: string | null
          linkedin_url: string | null
          phone_number: string | null
          resume_url: string | null
          skills: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          interview_preferences?: Json | null
          languages?: string | null
          linkedin_url?: string | null
          phone_number?: string | null
          resume_url?: string | null
          skills?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          interview_preferences?: Json | null
          languages?: string | null
          linkedin_url?: string | null
          phone_number?: string | null
          resume_url?: string | null
          skills?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recruiters: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          id: string
          name: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      shortlistings: {
        Row: {
          created_at: string | null
          feedback: string | null
          id: string
          recruiter_id: string
          status: string | null
          user_id: string
          user_score: number
        }
        Insert: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          recruiter_id: string
          status?: string | null
          user_id: string
          user_score: number
        }
        Update: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          recruiter_id?: string
          status?: string | null
          user_id?: string
          user_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "shortlistings_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shortlistings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_batch_call_sessions: {
        Args: Record<PropertyKey, never>
        Returns: {
          audio_urls: string[]
          callback_url: string | null
          candidate_id: string
          completed_at: string | null
          created_at: string
          id: string
          phone_number: string
          prompts: string[]
          status: string
          voice_id: string
          webhook_data: Json | null
        }[]
      }
      get_invite_by_token: {
        Args: { invite_token: string }
        Returns: {
          assessment_id: string
          candidate_email: string
          candidate_id: string
          completed_at: string
          created_at: string
          id: string
          link: string
          recruiter_id: string
          status: string
          token: string
        }[]
      }
      update_invite_by_token: {
        Args: {
          invite_token: string
          new_candidate_id?: string
          new_status?: string
        }
        Returns: boolean
      }
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
