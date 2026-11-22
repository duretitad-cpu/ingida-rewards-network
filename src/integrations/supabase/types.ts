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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          invited_by: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          code_prefix: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          image_path: string
          name: string
          notes: string
          quantity: number
          quest_reward: boolean
          sticker_hashtag: string
          sticker_title: string
        }
        Insert: {
          code_prefix?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          image_path?: string
          name: string
          notes?: string
          quantity?: number
          quest_reward?: boolean
          sticker_hashtag?: string
          sticker_title?: string
        }
        Update: {
          code_prefix?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          image_path?: string
          name?: string
          notes?: string
          quantity?: number
          quest_reward?: boolean
          sticker_hashtag?: string
          sticker_title?: string
        }
        Relationships: []
      }
      inventory_units: {
        Row: {
          assigned_at: string | null
          assigned_name: string
          assigned_phone: string
          claim_note: string
          claimed_at: string | null
          claimed_by: string | null
          code: string
          created_at: string
          id: string
          item_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_name?: string
          assigned_phone?: string
          claim_note?: string
          claimed_at?: string | null
          claimed_by?: string | null
          code: string
          created_at?: string
          id?: string
          item_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_name?: string
          assigned_phone?: string
          claim_note?: string
          claimed_at?: string | null
          claimed_by?: string | null
          code?: string
          created_at?: string
          id?: string
          item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_units_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      nfc_cards: {
        Row: {
          capture_mode: boolean
          card_key: string
          card_name: string
          created_at: string
          destination_url: string
          id: string
          is_active: boolean
          owner_email: string
          owner_name: string
          owner_phone: string
          owner_title: string
          tap_count: number
          updated_at: string
        }
        Insert: {
          capture_mode?: boolean
          card_key: string
          card_name?: string
          created_at?: string
          destination_url?: string
          id?: string
          is_active?: boolean
          owner_email?: string
          owner_name?: string
          owner_phone?: string
          owner_title?: string
          tap_count?: number
          updated_at?: string
        }
        Update: {
          capture_mode?: boolean
          card_key?: string
          card_name?: string
          created_at?: string
          destination_url?: string
          id?: string
          is_active?: boolean
          owner_email?: string
          owner_name?: string
          owner_phone?: string
          owner_title?: string
          tap_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      nfc_contacts: {
        Row: {
          card_id: string
          company: string
          consent_given: boolean
          contact_type: string
          created_at: string
          email: string
          full_name: string
          id: string
          notes: string
          phone: string
        }
        Insert: {
          card_id: string
          company?: string
          consent_given?: boolean
          contact_type?: string
          created_at?: string
          email?: string
          full_name: string
          id?: string
          notes?: string
          phone?: string
        }
        Update: {
          card_id?: string
          company?: string
          consent_given?: boolean
          contact_type?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notes?: string
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "nfc_contacts_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "nfc_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_invite_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
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
      waitlist_submissions: {
        Row: {
          business_name: string
          city: string
          created_at: string
          email: string
          id: string
          name: string
          notes: string
          phone: string
          role: string
          source: string
          status: string
          wants_alerts: boolean | null
        }
        Insert: {
          business_name?: string
          city?: string
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string
          phone: string
          role: string
          source?: string
          status?: string
          wants_alerts?: boolean | null
        }
        Update: {
          business_name?: string
          city?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string
          phone?: string
          role?: string
          source?: string
          status?: string
          wants_alerts?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_quest_prize: {
        Args: { _answers: Json; _name: string; _phone: string }
        Returns: {
          already: boolean
          code: string
          description: string
          image: string
          item: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_operator: { Args: { _user_id: string }; Returns: boolean }
      quest_prize_preview: {
        Args: never
        Returns: {
          description: string
          image: string
          item: string
          remaining: number
          sticker_hashtag: string
          sticker_title: string
        }[]
      }
      submit_early_access: {
        Args: {
          _business_name: string
          _email: string
          _name: string
          _phone: string
          _role: string
          _wants_alerts: boolean
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "operator"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "operator"],
    },
  },
} as const
