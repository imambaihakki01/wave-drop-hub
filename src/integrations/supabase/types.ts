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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          event_end_at: string
          id: number
          telegram_url: string
          twitter_url: string
          updated_at: string
        }
        Insert: {
          event_end_at?: string
          id?: number
          telegram_url?: string
          twitter_url?: string
          updated_at?: string
        }
        Update: {
          event_end_at?: string
          id?: number
          telegram_url?: string
          twitter_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      participants: {
        Row: {
          created_at: string
          id: string
          is_banned: boolean
          last_check_in: string | null
          points: number
          referral_code: string
          referral_count: number
          referred_by: string | null
          task_telegram_joined: boolean
          task_telegram_submitted: boolean
          task_twitter_followed: boolean
          telegram_username: string | null
          updated_at: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_banned?: boolean
          last_check_in?: string | null
          points?: number
          referral_code: string
          referral_count?: number
          referred_by?: string | null
          task_telegram_joined?: boolean
          task_telegram_submitted?: boolean
          task_twitter_followed?: boolean
          telegram_username?: string | null
          updated_at?: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          id?: string
          is_banned?: boolean
          last_check_in?: string | null
          points?: number
          referral_code?: string
          referral_count?: number
          referred_by?: string | null
          task_telegram_joined?: boolean
          task_telegram_submitted?: boolean
          task_twitter_followed?: boolean
          telegram_username?: string | null
          updated_at?: string
          wallet_address?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_adjust_points: {
        Args: { _delta: number; _participant_id: string }
        Returns: {
          created_at: string
          id: string
          is_banned: boolean
          last_check_in: string | null
          points: number
          referral_code: string
          referral_count: number
          referred_by: string | null
          task_telegram_joined: boolean
          task_telegram_submitted: boolean
          task_twitter_followed: boolean
          telegram_username: string | null
          updated_at: string
          wallet_address: string
        }
        SetofOptions: {
          from: "*"
          to: "participants"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_toggle_ban: {
        Args: { _participant_id: string }
        Returns: {
          created_at: string
          id: string
          is_banned: boolean
          last_check_in: string | null
          points: number
          referral_code: string
          referral_count: number
          referred_by: string | null
          task_telegram_joined: boolean
          task_telegram_submitted: boolean
          task_twitter_followed: boolean
          telegram_username: string | null
          updated_at: string
          wallet_address: string
        }
        SetofOptions: {
          from: "*"
          to: "participants"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      award_referral: { Args: { _ref_code: string }; Returns: boolean }
      award_task: {
        Args: { _task: string; _wallet: string }
        Returns: {
          created_at: string
          id: string
          is_banned: boolean
          last_check_in: string | null
          points: number
          referral_code: string
          referral_count: number
          referred_by: string | null
          task_telegram_joined: boolean
          task_telegram_submitted: boolean
          task_twitter_followed: boolean
          telegram_username: string | null
          updated_at: string
          wallet_address: string
        }
        SetofOptions: {
          from: "*"
          to: "participants"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      claim_daily: {
        Args: { _wallet: string }
        Returns: {
          created_at: string
          id: string
          is_banned: boolean
          last_check_in: string | null
          points: number
          referral_code: string
          referral_count: number
          referred_by: string | null
          task_telegram_joined: boolean
          task_telegram_submitted: boolean
          task_twitter_followed: boolean
          telegram_username: string | null
          updated_at: string
          wallet_address: string
        }
        SetofOptions: {
          from: "*"
          to: "participants"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      claim_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      referral_exists: { Args: { _code: string }; Returns: boolean }
      submit_telegram_username: {
        Args: { _username: string; _wallet: string }
        Returns: {
          created_at: string
          id: string
          is_banned: boolean
          last_check_in: string | null
          points: number
          referral_code: string
          referral_count: number
          referred_by: string | null
          task_telegram_joined: boolean
          task_telegram_submitted: boolean
          task_twitter_followed: boolean
          telegram_username: string | null
          updated_at: string
          wallet_address: string
        }
        SetofOptions: {
          from: "*"
          to: "participants"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
