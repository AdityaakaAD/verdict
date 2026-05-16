// AUTO-GENERATED from Supabase project `Verdict` (zyzsgwnzjpybuqnpzipx).
// Regenerate with: supabase gen types typescript --project-id zyzsgwnzjpybuqnpzipx > apps/web/types/database.ts
// Do not edit by hand.

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
      featured_scenarios: {
        Row: {
          drop_at: string
          global_a_count: number
          global_b_count: number
          id: string
          region: string
          scenario_id: string
          total_participants: number
        }
        Insert: {
          drop_at: string
          global_a_count?: number
          global_b_count?: number
          id?: string
          region?: string
          scenario_id: string
          total_participants?: number
        }
        Update: {
          drop_at?: string
          global_a_count?: number
          global_b_count?: number
          id?: string
          region?: string
          scenario_id?: string
          total_participants?: number
        }
        Relationships: [
          {
            foreignKeyName: "featured_scenarios_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          alias: string
          avatar_id: string
          badges_earned: string[]
          ban_reason: string | null
          created_at: string
          current_streak: number
          id: string
          interests: string[]
          invite_code: string
          invited_by_user_id: string | null
          is_banned: boolean
          last_played_date: string | null
          longest_streak: number
          notifications_drop: boolean
          notifications_reveal: boolean
          notifications_social: boolean
          region: string
          show_on_leaderboard: boolean
          sound_enabled: boolean
          successful_invites: number
          tier: string
          timezone: string
          verdict_score: number
          warning_count: number
        }
        Insert: {
          alias: string
          avatar_id: string
          badges_earned?: string[]
          ban_reason?: string | null
          created_at?: string
          current_streak?: number
          id: string
          interests?: string[]
          invite_code: string
          invited_by_user_id?: string | null
          is_banned?: boolean
          last_played_date?: string | null
          longest_streak?: number
          notifications_drop?: boolean
          notifications_reveal?: boolean
          notifications_social?: boolean
          region?: string
          show_on_leaderboard?: boolean
          sound_enabled?: boolean
          successful_invites?: number
          tier?: string
          timezone?: string
          verdict_score?: number
          warning_count?: number
        }
        Update: {
          alias?: string
          avatar_id?: string
          badges_earned?: string[]
          ban_reason?: string | null
          created_at?: string
          current_streak?: number
          id?: string
          interests?: string[]
          invite_code?: string
          invited_by_user_id?: string | null
          is_banned?: boolean
          last_played_date?: string | null
          longest_streak?: number
          notifications_drop?: boolean
          notifications_reveal?: boolean
          notifications_social?: boolean
          region?: string
          show_on_leaderboard?: boolean
          sound_enabled?: boolean
          successful_invites?: number
          tier?: string
          timezone?: string
          verdict_score?: number
          warning_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            isOneToOne: false
            referencedRelation: "daily_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            isOneToOne: false
            referencedRelation: "weekly_leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          participant_id: string | null
          reason: string
          reported_user_id: string
          reporter_id: string
          resolved_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          participant_id?: string | null
          reason: string
          reported_user_id: string
          reporter_id: string
          resolved_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          participant_id?: string | null
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "room_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "daily_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "weekly_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "daily_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "weekly_leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      room_participants: {
        Row: {
          bot_persona: string | null
          changed_vote_during_conversion: boolean
          conversions_made: number
          id: string
          initial_vote: string | null
          is_bot: boolean
          joined_at: string
          room_id: string
          score_delta: number
          statement: string | null
          statement_upvotes: number
          user_id: string | null
          vote: string | null
          was_minority: boolean | null
        }
        Insert: {
          bot_persona?: string | null
          changed_vote_during_conversion?: boolean
          conversions_made?: number
          id?: string
          initial_vote?: string | null
          is_bot?: boolean
          joined_at?: string
          room_id: string
          score_delta?: number
          statement?: string | null
          statement_upvotes?: number
          user_id?: string | null
          vote?: string | null
          was_minority?: boolean | null
        }
        Update: {
          bot_persona?: string | null
          changed_vote_during_conversion?: boolean
          conversions_made?: number
          id?: string
          initial_vote?: string | null
          is_bot?: boolean
          joined_at?: string
          room_id?: string
          score_delta?: number
          statement?: string | null
          statement_upvotes?: number
          user_id?: string | null
          vote?: string | null
          was_minority?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "daily_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "room_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "weekly_leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      rooms: {
        Row: {
          completed_at: string | null
          created_at: string
          current_phase_ends_at: string | null
          id: string
          invite_code: string | null
          max_players: number
          player_count: number
          region: string
          result_majority_side: string | null
          result_minority_won: boolean | null
          scenario_id: string
          state: string
          total_conversions: number
          type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_phase_ends_at?: string | null
          id?: string
          invite_code?: string | null
          max_players?: number
          player_count?: number
          region?: string
          result_majority_side?: string | null
          result_minority_won?: boolean | null
          scenario_id: string
          state?: string
          total_conversions?: number
          type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_phase_ends_at?: string | null
          id?: string
          invite_code?: string | null
          max_players?: number
          player_count?: number
          region?: string
          result_majority_side?: string | null
          result_minority_won?: boolean | null
          scenario_id?: string
          state?: string
          total_conversions?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      scenarios: {
        Row: {
          category: string
          context_tag: string | null
          created_at: string
          freshness_tier: string
          id: string
          is_active: boolean
          language: string
          question: string
          region_locked: string[]
          retired_at: string | null
          side_a_label: string
          side_a_meaning: string
          side_b_label: string
          side_b_meaning: string
          source: string
          text: string
          total_a_votes: number
          total_b_votes: number
          total_plays: number
          vote_balance_score: number
        }
        Insert: {
          category: string
          context_tag?: string | null
          created_at?: string
          freshness_tier: string
          id?: string
          is_active?: boolean
          language?: string
          question: string
          region_locked?: string[]
          retired_at?: string | null
          side_a_label?: string
          side_a_meaning: string
          side_b_label?: string
          side_b_meaning: string
          source: string
          text: string
          total_a_votes?: number
          total_b_votes?: number
          total_plays?: number
          vote_balance_score?: number
        }
        Update: {
          category?: string
          context_tag?: string | null
          created_at?: string
          freshness_tier?: string
          id?: string
          is_active?: boolean
          language?: string
          question?: string
          region_locked?: string[]
          retired_at?: string | null
          side_a_label?: string
          side_a_meaning?: string
          side_b_label?: string
          side_b_meaning?: string
          source?: string
          text?: string
          total_a_votes?: number
          total_b_votes?: number
          total_plays?: number
          vote_balance_score?: number
        }
        Relationships: []
      }
      statement_upvotes: {
        Row: {
          created_at: string
          participant_id: string
          upvoter_id: string
        }
        Insert: {
          created_at?: string
          participant_id: string
          upvoter_id: string
        }
        Update: {
          created_at?: string
          participant_id?: string
          upvoter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "statement_upvotes_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "room_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "statement_upvotes_upvoter_id_fkey"
            columns: ["upvoter_id"]
            isOneToOne: false
            referencedRelation: "daily_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "statement_upvotes_upvoter_id_fkey"
            columns: ["upvoter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "statement_upvotes_upvoter_id_fkey"
            columns: ["upvoter_id"]
            isOneToOne: false
            referencedRelation: "weekly_leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_scenario_history: {
        Row: {
          played_at: string
          scenario_id: string
          user_id: string
        }
        Insert: {
          played_at?: string
          scenario_id: string
          user_id: string
        }
        Update: {
          played_at?: string
          scenario_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_scenario_history_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_scenario_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "daily_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_scenario_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_scenario_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "weekly_leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      daily_leaderboard: {
        Row: {
          alias: string | null
          avatar_id: string | null
          quality_score: number | null
          region: string | null
          rounds_played: number | null
          tier: string | null
          user_id: string | null
        }
        Relationships: []
      }
      weekly_leaderboard: {
        Row: {
          alias: string | null
          avatar_id: string | null
          quality_score: number | null
          region: string | null
          rounds_played: number | null
          tier: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      gen_invite_code: { Args: never; Returns: string }
      refresh_leaderboards: { Args: never; Returns: undefined }
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
