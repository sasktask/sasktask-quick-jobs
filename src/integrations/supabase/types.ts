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
      availability_slots: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          badge_level: string | null
          badge_type: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_level?: string | null
          badge_type: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_level?: string | null
          badge_type?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
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
      call_sessions: {
        Row: {
          booking_id: string
          call_type: string
          caller_id: string
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          ice_servers: Json | null
          id: string
          receiver_id: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          call_type: string
          caller_id: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          ice_servers?: Json | null
          id?: string
          receiver_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          call_type?: string
          caller_id?: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          ice_servers?: Json | null
          id?: string
          receiver_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_sessions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
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
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          ip_address: string | null
          submitted_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          submitted_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          submitted_at?: string | null
        }
        Relationships: []
      }
      disputes: {
        Row: {
          against_user: string
          booking_id: string
          created_at: string | null
          dispute_details: string | null
          dispute_reason: string
          evidence_urls: string[] | null
          id: string
          raised_by: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          task_id: string
          updated_at: string | null
        }
        Insert: {
          against_user: string
          booking_id: string
          created_at?: string | null
          dispute_details?: string | null
          dispute_reason: string
          evidence_urls?: string[] | null
          id?: string
          raised_by: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          task_id: string
          updated_at?: string | null
        }
        Update: {
          against_user?: string
          booking_id?: string
          created_at?: string | null
          dispute_details?: string | null
          dispute_reason?: string
          evidence_urls?: string[] | null
          id?: string
          raised_by?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          task_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_task_id_fkey"
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
      fraud_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      insurance_claims: {
        Row: {
          admin_notes: string | null
          claim_amount: number
          claim_reason: string
          claimed_by: string
          created_at: string | null
          evidence_urls: string[] | null
          id: string
          insurance_id: string
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          claim_amount: number
          claim_reason: string
          claimed_by: string
          created_at?: string | null
          evidence_urls?: string[] | null
          id?: string
          insurance_id: string
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          claim_amount?: number
          claim_reason?: string
          claimed_by?: string
          created_at?: string | null
          evidence_urls?: string[] | null
          id?: string
          insurance_id?: string
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claims_insurance_id_fkey"
            columns: ["insurance_id"]
            isOneToOne: false
            referencedRelation: "task_insurance"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          attachment_type: string
          created_at: string
          duration: number | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          message_id: string
          storage_path: string
        }
        Insert: {
          attachment_type: string
          created_at?: string
          duration?: number | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          message_id: string
          storage_path: string
        }
        Update: {
          attachment_type?: string
          created_at?: string
          duration?: number | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          message_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_edit_history: {
        Row: {
          created_at: string
          edited_at: string
          edited_by: string
          id: string
          message_id: string
          previous_content: string
        }
        Insert: {
          created_at?: string
          edited_at?: string
          edited_by: string
          id?: string
          message_id: string
          previous_content: string
        }
        Update: {
          created_at?: string
          edited_at?: string
          edited_by?: string
          id?: string
          message_id?: string
          previous_content?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_edit_history_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          id: string
          message_id: string
          reaction: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          reaction: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          reaction?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          booking_id: string
          created_at: string
          edited_at: string | null
          id: string
          message: string
          read_at: string | null
          receiver_id: string
          reply_to_id: string | null
          sender_id: string
          status: Database["public"]["Enums"]["message_status"] | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          edited_at?: string | null
          id?: string
          message: string
          read_at?: string | null
          receiver_id: string
          reply_to_id?: string | null
          sender_id: string
          status?: Database["public"]["Enums"]["message_status"] | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          message?: string
          read_at?: string | null
          receiver_id?: string
          reply_to_id?: string | null
          sender_id?: string
          status?: Database["public"]["Enums"]["message_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          confirmation_token: string | null
          confirmed: boolean | null
          created_at: string | null
          email: string
          id: string
          ip_address: string | null
          subscribed_at: string | null
          unsubscribed_at: string | null
          user_agent: string | null
        }
        Insert: {
          confirmation_token?: string | null
          confirmed?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
          user_agent?: string | null
        }
        Update: {
          confirmation_token?: string | null
          confirmed?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
          user_agent?: string | null
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
      pinned_messages: {
        Row: {
          booking_id: string
          id: string
          message_id: string
          pinned_at: string
          pinned_by: string
        }
        Insert: {
          booking_id: string
          id?: string
          message_id: string
          pinned_at?: string
          pinned_by: string
        }
        Update: {
          booking_id?: string
          id?: string
          message_id?: string
          pinned_at?: string
          pinned_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "pinned_messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pinned_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: true
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          category: string
          client_name: string | null
          completed_date: string | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          client_name?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          client_name?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          availability_status: string | null
          avatar_url: string | null
          bio: string | null
          cancellation_count: number | null
          cancellation_rate: number | null
          city: string | null
          completed_tasks: number | null
          country: string | null
          created_at: string | null
          email: string
          experience_years: number | null
          facebook: string | null
          full_name: string | null
          hourly_rate: number | null
          id: string
          joined_date: string | null
          last_active: string | null
          last_seen: string | null
          latitude: number | null
          linkedin: string | null
          longitude: number | null
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
          twitter: string | null
          updated_at: string | null
          verification_level: string | null
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
          verified_by_admin: boolean | null
          website: string | null
        }
        Insert: {
          address?: string | null
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          cancellation_count?: number | null
          cancellation_rate?: number | null
          city?: string | null
          completed_tasks?: number | null
          country?: string | null
          created_at?: string | null
          email: string
          experience_years?: number | null
          facebook?: string | null
          full_name?: string | null
          hourly_rate?: number | null
          id: string
          joined_date?: string | null
          last_active?: string | null
          last_seen?: string | null
          latitude?: number | null
          linkedin?: string | null
          longitude?: number | null
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
          twitter?: string | null
          updated_at?: string | null
          verification_level?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          verified_by_admin?: boolean | null
          website?: string | null
        }
        Update: {
          address?: string | null
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          cancellation_count?: number | null
          cancellation_rate?: number | null
          city?: string | null
          completed_tasks?: number | null
          country?: string | null
          created_at?: string | null
          email?: string
          experience_years?: number | null
          facebook?: string | null
          full_name?: string | null
          hourly_rate?: number | null
          id?: string
          joined_date?: string | null
          last_active?: string | null
          last_seen?: string | null
          latitude?: number | null
          linkedin?: string | null
          longitude?: number | null
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
          twitter?: string | null
          updated_at?: string | null
          verification_level?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          verified_by_admin?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string
          id: string
          subscription_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subscription_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subscription_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recurring_tasks: {
        Row: {
          created_at: string
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean
          next_occurrence: string
          start_date: string
          task_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean
          next_occurrence: string
          start_date: string
          task_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          next_occurrence?: string
          start_date?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          message: string
          reminder_time: string
          reminder_type: string
          send_method: string
          sent_at: string | null
          status: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          message: string
          reminder_time: string
          reminder_type: string
          send_method?: string
          sent_at?: string | null
          status?: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          message?: string
          reminder_time?: string
          reminder_type?: string
          send_method?: string
          sent_at?: string | null
          status?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      review_responses: {
        Row: {
          created_at: string | null
          id: string
          responded_by: string
          response_text: string
          review_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          responded_by: string
          response_text: string
          review_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          responded_by?: string
          response_text?: string
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          communication_rating: number | null
          created_at: string | null
          helpful_count: number | null
          id: string
          quality_rating: number | null
          rating: number
          responded_at: string | null
          response: string | null
          reviewee_id: string
          reviewer_id: string
          task_id: string
          timeliness_rating: number | null
          verified: boolean | null
        }
        Insert: {
          comment?: string | null
          communication_rating?: number | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          quality_rating?: number | null
          rating: number
          responded_at?: string | null
          response?: string | null
          reviewee_id: string
          reviewer_id: string
          task_id: string
          timeliness_rating?: number | null
          verified?: boolean | null
        }
        Update: {
          comment?: string | null
          communication_rating?: number | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          quality_rating?: number | null
          rating?: number
          responded_at?: string | null
          response?: string | null
          reviewee_id?: string
          reviewer_id?: string
          task_id?: string
          timeliness_rating?: number | null
          verified?: boolean | null
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
      skill_endorsements: {
        Row: {
          created_at: string | null
          endorsed_by: string
          id: string
          skill: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          endorsed_by: string
          id?: string
          skill: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          endorsed_by?: string
          id?: string
          skill?: string
          user_id?: string
        }
        Relationships: []
      }
      sms_logs: {
        Row: {
          created_at: string
          id: string
          message: string
          phone_number: string
          provider_response: Json | null
          sent_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          phone_number: string
          provider_response?: Json | null
          sent_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          phone_number?: string
          provider_response?: Json | null
          sent_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      task_insurance: {
        Row: {
          coverage_amount: number
          created_at: string | null
          expires_at: string | null
          id: string
          insurance_type: string
          policy_details: Json | null
          premium_amount: number
          status: string | null
          task_id: string
        }
        Insert: {
          coverage_amount: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          insurance_type: string
          policy_details?: Json | null
          premium_amount: number
          status?: string | null
          task_id: string
        }
        Update: {
          coverage_amount?: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          insurance_type?: string
          policy_details?: Json | null
          premium_amount?: number
          status?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_insurance_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: true
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_milestones: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          milestone_order: number
          paid_at: string | null
          payment_id: string | null
          status: string | null
          task_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          milestone_order: number
          paid_at?: string | null
          payment_id?: string | null
          status?: string | null
          task_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          milestone_order?: number
          paid_at?: string | null
          payment_id?: string | null
          status?: string | null
          task_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_milestones_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_milestones_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
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
      task_templates: {
        Row: {
          category: string
          created_at: string | null
          description_template: string
          estimated_duration: string | null
          id: string
          is_active: boolean | null
          required_skills: string[] | null
          suggested_rate: number | null
          title: string
          tools_needed: string[] | null
          usage_count: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description_template: string
          estimated_duration?: string | null
          id?: string
          is_active?: boolean | null
          required_skills?: string[] | null
          suggested_rate?: number | null
          title: string
          tools_needed?: string[] | null
          usage_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description_template?: string
          estimated_duration?: string | null
          id?: string
          is_active?: boolean | null
          required_skills?: string[] | null
          suggested_rate?: number | null
          title?: string
          tools_needed?: string[] | null
          usage_count?: number | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          budget_type: string | null
          category: string
          created_at: string | null
          description: string
          estimated_duration: number | null
          expires_at: string | null
          expiry_reminder_sent: boolean | null
          id: string
          latitude: number | null
          location: string
          location_details: Json | null
          longitude: number | null
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
          budget_type?: string | null
          category: string
          created_at?: string | null
          description: string
          estimated_duration?: number | null
          expires_at?: string | null
          expiry_reminder_sent?: boolean | null
          id?: string
          latitude?: number | null
          location: string
          location_details?: Json | null
          longitude?: number | null
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
          budget_type?: string | null
          category?: string
          created_at?: string | null
          description?: string
          estimated_duration?: number | null
          expires_at?: string | null
          expiry_reminder_sent?: boolean | null
          id?: string
          latitude?: number | null
          location?: string
          location_details?: Json | null
          longitude?: number | null
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
      typing_indicators: {
        Row: {
          booking_id: string
          created_at: string | null
          id: string
          is_typing: boolean | null
          last_typed_at: string | null
          user_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          id?: string
          is_typing?: boolean | null
          last_typed_at?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          id?: string
          is_typing?: boolean | null
          last_typed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "typing_indicators_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
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
      user_task_templates: {
        Row: {
          budget_type: string | null
          category: string
          created_at: string | null
          description: string | null
          estimated_duration: number | null
          id: string
          is_default: boolean | null
          location: string | null
          name: string
          pay_amount: number | null
          title: string
          tools_description: string | null
          tools_provided: boolean | null
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          budget_type?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          estimated_duration?: number | null
          id?: string
          is_default?: boolean | null
          location?: string | null
          name: string
          pay_amount?: number | null
          title: string
          tools_description?: string | null
          tools_provided?: boolean | null
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          budget_type?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          estimated_duration?: number | null
          id?: string
          is_default?: boolean | null
          location?: string | null
          name?: string
          pay_amount?: number | null
          title?: string
          tools_description?: string | null
          tools_provided?: boolean | null
          updated_at?: string | null
          usage_count?: number | null
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
        Relationships: [
          {
            foreignKeyName: "verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
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
      task_status: "open" | "in_progress" | "completed" | "cancelled" | "draft"
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
      task_status: ["open", "in_progress", "completed", "cancelled", "draft"],
      user_role: ["task_giver", "task_doer"],
      verification_status: ["pending", "verified", "rejected", "expired"],
    },
  },
} as const
