export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      interview_sessions: {
        Row: {
          body_analysis: Json | null
          created_at: string
          date: string
          duration: string
          facial_analysis: Json
          feedback: string | null
          id: string
          response_analysis: Json | null
          role: string
          score: number
          transcript: string | null
          type: string
          user_id: string
          video_url: string | null
          voice_analysis: Json
        }
        Insert: {
          body_analysis?: Json | null
          created_at?: string
          date?: string
          duration: string
          facial_analysis?: Json
          feedback?: string | null
          id?: string
          response_analysis?: Json | null
          role: string
          score: number
          transcript?: string | null
          type: string
          user_id: string
          video_url?: string | null
          voice_analysis?: Json
        }
        Update: {
          body_analysis?: Json | null
          created_at?: string
          date?: string
          duration?: string
          facial_analysis?: Json
          feedback?: string | null
          id?: string
          response_analysis?: Json | null
          role?: string
          score?: number
          transcript?: string | null
          type?: string
          user_id?: string
          video_url?: string | null
          voice_analysis?: Json
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
