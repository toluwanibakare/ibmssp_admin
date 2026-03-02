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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: number
          member_id: number | null
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: never
          member_id?: number | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: never
          member_id?: number | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          id: number
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: never
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: never
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      graduate_details: {
        Row: {
          certificate_file: string | null
          cv_file: string | null
          graduation_year: number
          institution: string
          member_id: number
          ny_sc_status: string | null
          qualification: string
          study_duration: string | null
        }
        Insert: {
          certificate_file?: string | null
          cv_file?: string | null
          graduation_year: number
          institution: string
          member_id: number
          ny_sc_status?: string | null
          qualification: string
          study_duration?: string | null
        }
        Update: {
          certificate_file?: string | null
          cv_file?: string | null
          graduation_year?: number
          institution?: string
          member_id?: number
          ny_sc_status?: string | null
          qualification?: string
          study_duration?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "graduate_details_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
        ]
      }
      members: {
        Row: {
          address: string | null
          category: string
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          first_name: string
          gender: string | null
          last_name: string
          member_id: number
          other_name: string | null
          payment_status: string
          phone: string
          public_id: string | null
          registration_status: string
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          category: string
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          first_name: string
          gender?: string | null
          last_name: string
          member_id?: never
          other_name?: string | null
          payment_status?: string
          phone: string
          public_id?: string | null
          registration_status?: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: string
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          first_name?: string
          gender?: string | null
          last_name?: string
          member_id?: never
          other_name?: string | null
          payment_status?: string
          phone?: string
          public_id?: string | null
          registration_status?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      organization_details: {
        Row: {
          company_address: string | null
          company_certificate_file: string | null
          company_email: string
          company_phone: string
          contact_person: string | null
          contact_person_role: string | null
          industry: string | null
          iso_start_year: string | null
          member_id: number
          number_of_staff: number | null
          organization_name: string
          organization_type: string | null
          rc_number: string | null
        }
        Insert: {
          company_address?: string | null
          company_certificate_file?: string | null
          company_email: string
          company_phone: string
          contact_person?: string | null
          contact_person_role?: string | null
          industry?: string | null
          iso_start_year?: string | null
          member_id: number
          number_of_staff?: number | null
          organization_name: string
          organization_type?: string | null
          rc_number?: string | null
        }
        Update: {
          company_address?: string | null
          company_certificate_file?: string | null
          company_email?: string
          company_phone?: string
          contact_person?: string | null
          contact_person_role?: string | null
          industry?: string | null
          iso_start_year?: string | null
          member_id?: number
          number_of_staff?: number | null
          organization_name?: string
          organization_type?: string | null
          rc_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_details_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
        ]
      }
      professional_details: {
        Row: {
          current_company: string | null
          cv_file: string | null
          license_number: string | null
          member_id: number
          profession: string
          professional_certifications: string | null
          specialization: string | null
          years_of_experience: number | null
        }
        Insert: {
          current_company?: string | null
          cv_file?: string | null
          license_number?: string | null
          member_id: number
          profession: string
          professional_certifications?: string | null
          specialization?: string | null
          years_of_experience?: number | null
        }
        Update: {
          current_company?: string | null
          cv_file?: string | null
          license_number?: string | null
          member_id?: number
          profession?: string
          professional_certifications?: string | null
          specialization?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_details_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      sent_emails: {
        Row: {
          body: string | null
          id: number
          member_id: number | null
          recipient_email: string
          recipient_name: string | null
          sent_at: string
          sent_by: string | null
          status: string
          subject: string
        }
        Insert: {
          body?: string | null
          id?: never
          member_id?: number | null
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string
          sent_by?: string | null
          status?: string
          subject: string
        }
        Update: {
          body?: string | null
          id?: never
          member_id?: number | null
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string
          sent_by?: string | null
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "sent_emails_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
        ]
      }
      student_details: {
        Row: {
          course_of_study: string
          expected_graduation_year: number | null
          institution_name: string
          level: string | null
          matric_number: string | null
          member_id: number
          student_id_card_file: string | null
        }
        Insert: {
          course_of_study: string
          expected_graduation_year?: number | null
          institution_name: string
          level?: string | null
          matric_number?: string | null
          member_id: number
          student_id_card_file?: string | null
        }
        Update: {
          course_of_study?: string
          expected_graduation_year?: number | null
          institution_name?: string
          level?: string | null
          matric_number?: string | null
          member_id?: number
          student_id_card_file?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_details_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Enums: {
      app_role: "admin" | "editor"
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
      app_role: ["admin", "editor"],
    },
  },
} as const
