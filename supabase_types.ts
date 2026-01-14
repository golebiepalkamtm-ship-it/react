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
      _prisma_migrations: {
        Row: {
          applied_steps_count: number | null
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string | null
        }
        Insert: {
          applied_steps_count?: number | null
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string | null
        }
        Update: {
          applied_steps_count?: number | null
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string | null
        }
        Relationships: []
      }
      auctions: {
        Row: {
          age: number
          buy_now_price: number | null
          category: string
          created_at: string
          current_price: number
          description: string | null
          documents: Json
          ends_at: string | null
          id: string
          images: Json
          location: string
          min_bid_increment: number
          owner_id: string | null
          pigeon: Json
          reserve_met: boolean
          reserve_price: number | null
          sex: string
          snipe_extension_minutes: number
          snipe_threshold_minutes: number
          starting_price: number
          starts_at: string | null
          status: string | null
          title: string
          updated_at: string
          videos: Json
          winner_id: string | null
        }
        Insert: {
          age?: number
          buy_now_price?: number | null
          category?: string
          created_at?: string
          current_price?: number
          description?: string | null
          documents?: Json
          ends_at?: string | null
          id?: string
          images?: Json
          location?: string
          min_bid_increment?: number
          owner_id?: string | null
          pigeon?: Json
          reserve_met?: boolean
          reserve_price?: number | null
          sex?: string
          snipe_extension_minutes?: number
          snipe_threshold_minutes?: number
          starting_price?: number
          starts_at?: string | null
          status?: string | null
          title: string
          updated_at?: string
          videos?: Json
          winner_id?: string | null
        }
        Update: {
          age?: number
          buy_now_price?: number | null
          category?: string
          created_at?: string
          current_price?: number
          description?: string | null
          documents?: Json
          ends_at?: string | null
          id?: string
          images?: Json
          location?: string
          min_bid_increment?: number
          owner_id?: string | null
          pigeon?: Json
          reserve_met?: boolean
          reserve_price?: number | null
          sex?: string
          snipe_extension_minutes?: number
          snipe_threshold_minutes?: number
          starting_price?: number
          starts_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          videos?: Json
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auctions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auctions_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          amount: number
          auction_id: string | null
          bidder_id: string | null
          created_at: string
          display_name: string | null
          id: string
          is_proxy: boolean | null
          max_bid: number | null
        }
        Insert: {
          amount: number
          auction_id?: string | null
          bidder_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_proxy?: boolean | null
          max_bid?: number | null
        }
        Update: {
          amount?: number
          auction_id?: string | null
          bidder_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_proxy?: boolean | null
          max_bid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "active_auctions_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_bidder_id_fkey"
            columns: ["bidder_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          author_id: string | null
          created_at: string
          date: string | null
          description: string | null
          id: string
          images: Json | null
          location: string | null
          name: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          location?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          location?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          auction_id: string | null
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auction_id?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Update: {
          auction_id?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "active_auctions_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      references: {
        Row: {
          achievements: string | null
          breederName: string
          created_at: string | null
          experience: string | null
          id: string
          images: Json | null
          isApproved: boolean | null
          location: string
          opinion: string | null
          pigeonName: string | null
          rating: number | null
          updated_at: string | null
        }
        Insert: {
          achievements?: string | null
          breederName: string
          created_at?: string | null
          experience?: string | null
          id?: string
          images?: Json | null
          isApproved?: boolean | null
          location: string
          opinion?: string | null
          pigeonName?: string | null
          rating?: number | null
          updated_at?: string | null
        }
        Update: {
          achievements?: string | null
          breederName?: string
          created_at?: string | null
          experience?: string | null
          id?: string
          images?: Json | null
          isApproved?: boolean | null
          location?: string
          opinion?: string | null
          pigeonName?: string | null
          rating?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          auction_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          auction_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewee_id: string
          reviewer_id: string
          updated_at: string
        }
        Update: {
          auction_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "active_auctions_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters: Json
          id?: string
          is_active?: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          banned_until: string | null
          blocked_until: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          is_banned: boolean
          is_blocked: boolean
          last_name: string | null
          name: string | null
          phone: string | null
          postal_code: string | null
          role: string | null
          street: string | null
          trust_score: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          banned_until?: string | null
          blocked_until?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          is_banned?: boolean
          is_blocked?: boolean
          last_name?: string | null
          name?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: string | null
          street?: string | null
          trust_score?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          banned_until?: string | null
          blocked_until?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_banned?: boolean
          is_blocked?: boolean
          last_name?: string | null
          name?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: string | null
          street?: string | null
          trust_score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      watchlists: {
        Row: {
          auction_id: string | null
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          auction_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          auction_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "watchlists_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "active_auctions_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watchlists_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watchlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_auctions_summary: {
        Row: {
          category: string | null
          created_at: string | null
          current_price: number | null
          description: string | null
          ends_at: string | null
          id: string | null
          owner_id: string | null
          starting_price: number | null
          status: string | null
          title: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          current_price?: number | null
          description?: string | null
          ends_at?: string | null
          id?: string | null
          owner_id?: string | null
          starting_price?: number | null
          status?: string | null
          title?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          current_price?: number | null
          description?: string | null
          ends_at?: string | null
          id?: string | null
          owner_id?: string | null
          starting_price?: number | null
          status?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auctions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      close_expired_auctions: { Args: never; Returns: number }
      place_bid_atomic: {
        Args: {
          p_amount: number
          p_auction_id: string
          p_bidder_id: string
          p_display_name?: string
        }
        Returns: {
          amount: number
          auction_id: string
          bid_id: string
          bidder_id: string
          created_at: string
          new_ends_at: string
          new_price: number
          reserve_met: boolean
          was_extended: boolean
        }[]
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
