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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          agreed_at: string | null
          created_at: string | null
          id: string
          message: string | null
          payment_agreed: boolean | null
          status: Database["public"]["Enums"]["booking_status"] | null
          task_doer_id: string
          task_id: string
          updated_at: string | null
        }
        Insert: {
          agreed_at?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          payment_agreed?: boolean | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          task_doer_id: string
          task_id: string
          updated_at?: string | null
        }
        Update: {
          agreed_at?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          payment_agreed?: boolean | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          task_doer_id?: string
          task_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_task_doer_id_fkey"
            columns: ["task_doer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_task_doer_id_fkey"
            columns: ["task_doer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      cancellations: {
        Row: {
          booking_id: string
          cancellation_fee: number | null
          cancellation_reason: string | null
          cancelled_by: string
          created_at: string | null
          id: string
          stripe_refund_id: string | null
          task_id: string
        }
        Insert: {
          booking_id: string
          cancellation_fee?: number | null
          cancellation_reason?: string | null
          cancelled_by: string
          created_at?: string | null
          id?: string
          stripe_refund_id?: string | null
          task_id: string
        }
        Update: {
          booking_id?: string
          cancellation_fee?: number | null
          cancellation_reason?: string | null
          cancelled_by?: string
          created_at?: string | null
          id?: string
          stripe_refund_id?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cancellations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cancellations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          tasker_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          tasker_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          tasker_id?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          message: string
          read_at: string | null
          receiver_id: string
          sender_id: string
          status: Database["public"]["Enums"]["message_status"] | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
          status?: Database["public"]["Enums"]["message_status"] | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["message_status"] | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          card_brand: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          card_last4: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          stripe_payment_method_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          escrow_status: string | null
          id: string
          paid_at: string | null
          payee_id: string
          payer_id: string
          payment_intent_id: string | null
          payment_method: string | null
          payout_amount: number
          payout_at: string | null
          platform_fee: number
          released_at: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          task_id: string
          tax_deducted: number | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          escrow_status?: string | null
          id?: string
          paid_at?: string | null
          payee_id: string
          payer_id: string
          payment_intent_id?: string | null
          payment_method?: string | null
          payout_amount: number
          payout_at?: string | null
          platform_fee: number
          released_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          task_id: string
          tax_deducted?: number | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          escrow_status?: string | null
          id?: string
          paid_at?: string | null
          payee_id?: string
          payer_id?: string
          payment_intent_id?: string | null
          payment_method?: string | null
          payout_amount?: number
          payout_at?: string | null
          platform_fee?: number
          released_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          task_id?: string
          tax_deducted?: number | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payout_accounts: {
        Row: {
          account_status: string | null
          account_type: string | null
          bank_last4: string | null
          created_at: string | null
          id: string
          stripe_account_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_status?: string | null
          account_type?: string | null
          bank_last4?: string | null
          created_at?: string | null
          id?: string
          stripe_account_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_status?: string | null
          account_type?: string | null
          bank_last4?: string | null
          created_at?: string | null
          id?: string
          stripe_account_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          availability_status: string | null
          avatar_url: string | null
          bio: string | null
          cancellation_count: number | null
          cancellation_rate: number | null
          completed_tasks: number | null
          created_at: string | null
          email: string
          experience_years: number | null
          full_name: string | null
          hourly_rate: number | null
          id: string
          joined_date: string | null
          last_active: string | null
          on_time_rate: number | null
          phone: string | null
          preferred_categories: string[] | null
          profile_completion: number | null
          rating: number | null
          reliability_score: number | null
          response_rate: number | null
          skills: string[] | null
          stripe_customer_id: string | null
          stripe_payment_method_id: string | null
          total_reviews: number | null
          trust_score: number | null
          updated_at: string | null
          verification_level: string | null
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
          verified_by_admin: boolean | null
        }
        Insert: {
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          cancellation_count?: number | null
          cancellation_rate?: number | null
          completed_tasks?: number | null
          created_at?: string | null
          email: string
          experience_years?: number | null
          full_name?: string | null
          hourly_rate?: number | null
          id: string
          joined_date?: string | null
          last_active?: string | null
          on_time_rate?: number | null
          phone?: string | null
          preferred_categories?: string[] | null
          profile_completion?: number | null
          rating?: number | null
          reliability_score?: number | null
          response_rate?: number | null
          skills?: string[] | null
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          total_reviews?: number | null
          trust_score?: number | null
          updated_at?: string | null
          verification_level?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          verified_by_admin?: boolean | null
        }
        Update: {
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          cancellation_count?: number | null
          cancellation_rate?: number | null
          completed_tasks?: number | null
          created_at?: string | null
          email?: string
          experience_years?: number | null
          full_name?: string | null
          hourly_rate?: number | null
          id?: string
          joined_date?: string | null
          last_active?: string | null
          on_time_rate?: number | null
          phone?: string | null
          preferred_categories?: string[] | null
          profile_completion?: number | null
          rating?: number | null
          reliability_score?: number | null
          response_rate?: number | null
          skills?: string[] | null
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          total_reviews?: number | null
          trust_score?: number | null
          updated_at?: string | null
          verification_level?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          verified_by_admin?: boolean | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
          task_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          reviewee_id: string
          reviewer_id: string
          task_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      service_packages: {
        Row: {
          category: string
          created_at: string | null
          description: string
          estimated_hours: number | null
          id: string
          includes: string[] | null
          is_active: boolean | null
          price: number
          tasker_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          estimated_hours?: number | null
          id?: string
          includes?: string[] | null
          is_active?: boolean | null
          price: number
          tasker_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          estimated_hours?: number | null
          id?: string
          includes?: string[] | null
          is_active?: boolean | null
          price?: number
          tasker_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      task_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          photo_url: string
          task_id: string
          uploaded_by: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          photo_url: string
          task_id: string
          uploaded_by: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          photo_url?: string
          task_id?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          location: string
          pay_amount: number
          scheduled_date: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          task_doer_id: string | null
          task_giver_id: string
          title: string
          tools_description: string | null
          tools_provided: boolean | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          location: string
          pay_amount: number
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_doer_id?: string | null
          task_giver_id: string
          title: string
          tools_description?: string | null
          tools_provided?: boolean | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          location?: string
          pay_amount?: number
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_doer_id?: string | null
          task_giver_id?: string
          title?: string
          tools_description?: string | null
          tools_provided?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_task_doer_id_fkey"
            columns: ["task_doer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_task_doer_id_fkey"
            columns: ["task_doer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_task_giver_id_fkey"
            columns: ["task_giver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_task_giver_id_fkey"
            columns: ["task_giver_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verifications: {
        Row: {
          age_verified: boolean
          background_check_completed_at: string | null
          background_check_consent: boolean
          background_check_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          certification_documents: string[] | null
          certifications: string[] | null
          created_at: string
          date_of_birth: string | null
          has_insurance: boolean
          id: string
          id_document_url: string | null
          id_number_hash: string | null
          id_type: string | null
          id_verified: boolean
          id_verified_at: string | null
          insurance_document_url: string | null
          insurance_expiry_date: string | null
          insurance_policy_number: string | null
          insurance_provider: string | null
          legal_name: string | null
          privacy_accepted: boolean
          privacy_accepted_at: string | null
          rejection_reason: string | null
          sin_provided: boolean
          skills: string[] | null
          tax_info_complete: boolean
          terms_accepted: boolean
          terms_accepted_at: string | null
          updated_at: string
          user_id: string
          verification_completed_at: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_by: string | null
        }
        Insert: {
          age_verified?: boolean
          background_check_completed_at?: string | null
          background_check_consent?: boolean
          background_check_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          certification_documents?: string[] | null
          certifications?: string[] | null
          created_at?: string
          date_of_birth?: string | null
          has_insurance?: boolean
          id?: string
          id_document_url?: string | null
          id_number_hash?: string | null
          id_type?: string | null
          id_verified?: boolean
          id_verified_at?: string | null
          insurance_document_url?: string | null
          insurance_expiry_date?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          legal_name?: string | null
          privacy_accepted?: boolean
          privacy_accepted_at?: string | null
          rejection_reason?: string | null
          sin_provided?: boolean
          skills?: string[] | null
          tax_info_complete?: boolean
          terms_accepted?: boolean
          terms_accepted_at?: string | null
          updated_at?: string
          user_id: string
          verification_completed_at?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_by?: string | null
        }
        Update: {
          age_verified?: boolean
          background_check_completed_at?: string | null
          background_check_consent?: boolean
          background_check_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          certification_documents?: string[] | null
          certifications?: string[] | null
          created_at?: string
          date_of_birth?: string | null
          has_insurance?: boolean
          id?: string
          id_document_url?: string | null
          id_number_hash?: string | null
          id_type?: string | null
          id_verified?: boolean
          id_verified_at?: string | null
          insurance_document_url?: string | null
          insurance_expiry_date?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          legal_name?: string | null
          privacy_accepted?: boolean
          privacy_accepted_at?: string | null
          rejection_reason?: string | null
          sin_provided?: boolean
          skills?: string[] | null
          tax_info_complete?: boolean
          terms_accepted?: boolean
          terms_accepted_at?: string | null
          updated_at?: string
          user_id?: string
          verification_completed_at?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          rating: number | null
          total_reviews: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_trust_score: { Args: { user_id: string }; Returns: number }
      create_notification: {
        Args: {
          p_link?: string
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_booking_participant: {
        Args: { _booking_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "task_giver" | "task_doer" | "admin"
      booking_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "completed"
        | "cancelled"
        | "in_progress"
      message_status: "sent" | "delivered" | "read"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
      task_status: "open" | "in_progress" | "completed" | "cancelled"
      user_role: "task_giver" | "task_doer"
      verification_status: "pending" | "verified" | "rejected" | "expired"
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
      app_role: ["task_giver", "task_doer", "admin"],
      booking_status: [
        "pending",
        "accepted",
        "rejected",
        "completed",
        "cancelled",
        "in_progress",
      ],
      message_status: ["sent", "delivered", "read"],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
      ],
      task_status: ["open", "in_progress", "completed", "cancelled"],
      user_role: ["task_giver", "task_doer"],
      verification_status: ["pending", "verified", "rejected", "expired"],
    },
  },
} as const
