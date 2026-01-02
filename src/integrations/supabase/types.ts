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
      aligner_changes: {
        Row: {
          aligner_number: number
          arch: Database["public"]["Enums"]["arch_type"]
          changed_at: string
          id: string
          notes: string | null
          patient_id: string
          photo_url: string | null
        }
        Insert: {
          aligner_number: number
          arch: Database["public"]["Enums"]["arch_type"]
          changed_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          photo_url?: string | null
        }
        Update: {
          aligner_number?: number
          arch?: Database["public"]["Enums"]["arch_type"]
          changed_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aligner_changes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      aligner_deliveries: {
        Row: {
          delivered_at: string
          delivered_by: string | null
          id: string
          lower_from: number
          lower_retainer_qty: number | null
          lower_to: number
          notes: string | null
          patient_id: string
          upper_from: number
          upper_retainer_qty: number | null
          upper_to: number
        }
        Insert: {
          delivered_at?: string
          delivered_by?: string | null
          id?: string
          lower_from?: number
          lower_retainer_qty?: number | null
          lower_to?: number
          notes?: string | null
          patient_id: string
          upper_from?: number
          upper_retainer_qty?: number | null
          upper_to?: number
        }
        Update: {
          delivered_at?: string
          delivered_by?: string | null
          id?: string
          lower_from?: number
          lower_retainer_qty?: number | null
          lower_to?: number
          notes?: string | null
          patient_id?: string
          upper_from?: number
          upper_retainer_qty?: number | null
          upper_to?: number
        }
        Relationships: [
          {
            foreignKeyName: "aligner_deliveries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          dentist_observation: string | null
          id: string
          is_read: boolean
          message: string
          patient_id: string
          read_at: string | null
          related_arch: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          dentist_observation?: string | null
          id?: string
          is_read?: boolean
          message: string
          patient_id: string
          read_at?: string | null
          related_arch?: string | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          dentist_observation?: string | null
          id?: string
          is_read?: boolean
          message?: string
          patient_id?: string
          read_at?: string | null
          related_arch?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          arch: Database["public"]["Enums"]["arch_type"]
          avatar_url: string | null
          birth_date: string
          cpf: string
          created_at: string
          current_lower_aligner: number
          current_refining_lower: number | null
          current_refining_upper: number | null
          current_upper_aligner: number
          days_per_aligner: number
          dentist_id: string | null
          dentist_name: string | null
          email: string
          estimated_completion_date: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          lower_aligners: number
          lower_arch_status: Database["public"]["Enums"]["arch_status"] | null
          lower_last_change_date: string | null
          notes: string | null
          phone: string
          process_number: string | null
          provisional_password: string | null
          refining_active: boolean | null
          refining_lower_aligners: number | null
          refining_lower_last_change: string | null
          refining_lower_status:
            | Database["public"]["Enums"]["arch_status"]
            | null
          refining_upper_aligners: number | null
          refining_upper_last_change: string | null
          refining_upper_status:
            | Database["public"]["Enums"]["arch_status"]
            | null
          start_date: string
          treatment_status: Database["public"]["Enums"]["treatment_status"]
          updated_at: string
          upper_aligners: number
          upper_arch_status: Database["public"]["Enums"]["arch_status"] | null
          upper_last_change_date: string | null
        }
        Insert: {
          address?: string | null
          arch?: Database["public"]["Enums"]["arch_type"]
          avatar_url?: string | null
          birth_date: string
          cpf: string
          created_at?: string
          current_lower_aligner?: number
          current_refining_lower?: number | null
          current_refining_upper?: number | null
          current_upper_aligner?: number
          days_per_aligner?: number
          dentist_id?: string | null
          dentist_name?: string | null
          email: string
          estimated_completion_date?: string | null
          full_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          lower_aligners?: number
          lower_arch_status?: Database["public"]["Enums"]["arch_status"] | null
          lower_last_change_date?: string | null
          notes?: string | null
          phone: string
          process_number?: string | null
          provisional_password?: string | null
          refining_active?: boolean | null
          refining_lower_aligners?: number | null
          refining_lower_last_change?: string | null
          refining_lower_status?:
            | Database["public"]["Enums"]["arch_status"]
            | null
          refining_upper_aligners?: number | null
          refining_upper_last_change?: string | null
          refining_upper_status?:
            | Database["public"]["Enums"]["arch_status"]
            | null
          start_date?: string
          treatment_status?: Database["public"]["Enums"]["treatment_status"]
          updated_at?: string
          upper_aligners?: number
          upper_arch_status?: Database["public"]["Enums"]["arch_status"] | null
          upper_last_change_date?: string | null
        }
        Update: {
          address?: string | null
          arch?: Database["public"]["Enums"]["arch_type"]
          avatar_url?: string | null
          birth_date?: string
          cpf?: string
          created_at?: string
          current_lower_aligner?: number
          current_refining_lower?: number | null
          current_refining_upper?: number | null
          current_upper_aligner?: number
          days_per_aligner?: number
          dentist_id?: string | null
          dentist_name?: string | null
          email?: string
          estimated_completion_date?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          lower_aligners?: number
          lower_arch_status?: Database["public"]["Enums"]["arch_status"] | null
          lower_last_change_date?: string | null
          notes?: string | null
          phone?: string
          process_number?: string | null
          provisional_password?: string | null
          refining_active?: boolean | null
          refining_lower_aligners?: number | null
          refining_lower_last_change?: string | null
          refining_lower_status?:
            | Database["public"]["Enums"]["arch_status"]
            | null
          refining_upper_aligners?: number | null
          refining_upper_last_change?: string | null
          refining_upper_status?:
            | Database["public"]["Enums"]["arch_status"]
            | null
          start_date?: string
          treatment_status?: Database["public"]["Enums"]["treatment_status"]
          updated_at?: string
          upper_aligners?: number
          upper_arch_status?: Database["public"]["Enums"]["arch_status"] | null
          upper_last_change_date?: string | null
        }
        Relationships: []
      }
      photos: {
        Row: {
          aligner_number: number
          arch: Database["public"]["Enums"]["arch_type"] | null
          id: string
          notes: string | null
          patient_id: string
          type: Database["public"]["Enums"]["photo_type"]
          uploaded_at: string
          url: string
        }
        Insert: {
          aligner_number?: number
          arch?: Database["public"]["Enums"]["arch_type"] | null
          id?: string
          notes?: string | null
          patient_id: string
          type: Database["public"]["Enums"]["photo_type"]
          uploaded_at?: string
          url: string
        }
        Update: {
          aligner_number?: number
          arch?: Database["public"]["Enums"]["arch_type"] | null
          id?: string
          notes?: string | null
          patient_id?: string
          type?: Database["public"]["Enums"]["photo_type"]
          uploaded_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      production_items: {
        Row: {
          entry_date: string
          id: string
          lower_aligner_count: number
          patient_id: string
          patient_name: string
          responsible: string | null
          status: Database["public"]["Enums"]["production_status"]
          updated_at: string
          upper_aligner_count: number
        }
        Insert: {
          entry_date?: string
          id?: string
          lower_aligner_count?: number
          patient_id: string
          patient_name: string
          responsible?: string | null
          status?: Database["public"]["Enums"]["production_status"]
          updated_at?: string
          upper_aligner_count?: number
        }
        Update: {
          entry_date?: string
          id?: string
          lower_aligner_count?: number
          patient_id?: string
          patient_name?: string
          responsible?: string | null
          status?: Database["public"]["Enums"]["production_status"]
          updated_at?: string
          upper_aligner_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "production_items_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          patient_id: string
          updated_at: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          patient_id: string
          updated_at?: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          patient_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      refining_items: {
        Row: {
          completed_at: string | null
          id: string
          lower_aligner_count: number
          patient_id: string
          patient_name: string
          received_at: string
          returned_at: string | null
          status: Database["public"]["Enums"]["refining_status"]
          upper_aligner_count: number
          value: number
        }
        Insert: {
          completed_at?: string | null
          id?: string
          lower_aligner_count?: number
          patient_id: string
          patient_name: string
          received_at?: string
          returned_at?: string | null
          status?: Database["public"]["Enums"]["refining_status"]
          upper_aligner_count?: number
          value?: number
        }
        Update: {
          completed_at?: string | null
          id?: string
          lower_aligner_count?: number
          patient_id?: string
          patient_name?: string
          received_at?: string
          returned_at?: string | null
          status?: Database["public"]["Enums"]["refining_status"]
          upper_aligner_count?: number
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "refining_items_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_history: {
        Row: {
          aligner_from: number | null
          aligner_to: number | null
          arch: Database["public"]["Enums"]["arch_type"]
          created_by: string | null
          dentist_note: string | null
          event_date: string
          event_type: string
          id: string
          is_refining: boolean | null
          patient_id: string
          patient_reason: string | null
        }
        Insert: {
          aligner_from?: number | null
          aligner_to?: number | null
          arch: Database["public"]["Enums"]["arch_type"]
          created_by?: string | null
          dentist_note?: string | null
          event_date?: string
          event_type: string
          id?: string
          is_refining?: boolean | null
          patient_id: string
          patient_reason?: string | null
        }
        Update: {
          aligner_from?: number | null
          aligner_to?: number | null
          arch?: Database["public"]["Enums"]["arch_type"]
          created_by?: string | null
          dentist_note?: string | null
          event_date?: string
          event_type?: string
          id?: string
          is_refining?: boolean | null
          patient_id?: string
          patient_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
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
      get_patient_user_id: { Args: { _patient_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "patient" | "dentist" | "admin" | "refiner"
      arch_status: "em_uso" | "pausado" | "finalizado"
      arch_type: "upper" | "lower" | "both"
      gender_type: "male" | "female"
      photo_type: "before" | "during" | "progress"
      production_status:
        | "files_received"
        | "preparing_3d"
        | "printing"
        | "printed"
        | "ready_for_refining"
      refining_status: "received" | "refining" | "completed" | "returned"
      treatment_status: "in_treatment" | "completed" | "refino"
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
      app_role: ["patient", "dentist", "admin", "refiner"],
      arch_status: ["em_uso", "pausado", "finalizado"],
      arch_type: ["upper", "lower", "both"],
      gender_type: ["male", "female"],
      photo_type: ["before", "during", "progress"],
      production_status: [
        "files_received",
        "preparing_3d",
        "printing",
        "printed",
        "ready_for_refining",
      ],
      refining_status: ["received", "refining", "completed", "returned"],
      treatment_status: ["in_treatment", "completed", "refino"],
    },
  },
} as const
