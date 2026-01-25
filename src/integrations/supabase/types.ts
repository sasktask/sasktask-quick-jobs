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
      achievements: {
        Row: {
          category: string
          created_at: string | null
          description: string
          icon: string
          id: string
          is_active: boolean | null
          name: string
          requirement_type: string
          requirement_value: number
          reward_type: string | null
          reward_value: number | null
          tier: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          icon: string
          id?: string
          is_active?: boolean | null
          name: string
          requirement_type: string
          requirement_value: number
          reward_type?: string | null
          reward_value?: number | null
          tier: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          requirement_type?: string
          requirement_value?: number
          reward_type?: string | null
          reward_value?: number | null
          tier?: string
        }
        Relationships: []
      }
      audit_trail_events: {
        Row: {
          booking_id: string | null
          created_at: string | null
          event_category: string
          event_data: Json | null
          event_hash: string | null
          event_type: string
          id: string
          ip_address: string | null
          location_data: Json | null
          previous_hash: string | null
          task_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          event_category: string
          event_data?: Json | null
          event_hash?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          location_data?: Json | null
          previous_hash?: string | null
          task_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          event_category?: string
          event_data?: Json | null
          event_hash?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          location_data?: Json | null
          previous_hash?: string | null
          task_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_trail_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_trail_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
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
      background_check_consents: {
        Row: {
          consent_text: string
          consent_type: string
          consent_version: string
          consented_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          ip_address: string | null
          revoked_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_text: string
          consent_type: string
          consent_version: string
          consented_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          revoked_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_text?: string
          consent_type?: string
          consent_version?: string
          consented_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          revoked_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      background_check_packages: {
        Row: {
          check_types: Database["public"]["Enums"]["background_check_type"][]
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_required_for_tasker: boolean | null
          name: string
          price_cad: number | null
          updated_at: string | null
        }
        Insert: {
          check_types: Database["public"]["Enums"]["background_check_type"][]
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_required_for_tasker?: boolean | null
          name: string
          price_cad?: number | null
          updated_at?: string | null
        }
        Update: {
          check_types?: Database["public"]["Enums"]["background_check_type"][]
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_required_for_tasker?: boolean | null
          name?: string
          price_cad?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      background_checks: {
        Row: {
          check_type: Database["public"]["Enums"]["background_check_type"]
          completed_at: string | null
          consent_given: boolean | null
          consent_given_at: string | null
          consent_ip_address: string | null
          created_at: string | null
          expires_at: string | null
          flags: Json | null
          id: string
          provider: string | null
          provider_reference_id: string | null
          provider_response: Json | null
          requested_at: string | null
          result_summary: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_level: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["background_check_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          check_type: Database["public"]["Enums"]["background_check_type"]
          completed_at?: string | null
          consent_given?: boolean | null
          consent_given_at?: string | null
          consent_ip_address?: string | null
          created_at?: string | null
          expires_at?: string | null
          flags?: Json | null
          id?: string
          provider?: string | null
          provider_reference_id?: string | null
          provider_response?: Json | null
          requested_at?: string | null
          result_summary?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["background_check_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          check_type?: Database["public"]["Enums"]["background_check_type"]
          completed_at?: string | null
          consent_given?: boolean | null
          consent_given_at?: string | null
          consent_ip_address?: string | null
          created_at?: string | null
          expires_at?: string | null
          flags?: Json | null
          id?: string
          provider?: string | null
          provider_reference_id?: string | null
          provider_response?: Json | null
          requested_at?: string | null
          result_summary?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["background_check_status"] | null
          updated_at?: string | null
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
          completion_evidence_uploaded: boolean | null
          created_at: string | null
          deposit_paid: boolean | null
          evidence_count: number | null
          full_payment_at: string | null
          full_payment_paid: boolean | null
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
          completion_evidence_uploaded?: boolean | null
          created_at?: string | null
          deposit_paid?: boolean | null
          evidence_count?: number | null
          full_payment_at?: string | null
          full_payment_paid?: boolean | null
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
          completion_evidence_uploaded?: boolean | null
          created_at?: string | null
          deposit_paid?: boolean | null
          evidence_count?: number | null
          full_payment_at?: string | null
          full_payment_paid?: boolean | null
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
      certificates: {
        Row: {
          certificate_number: string | null
          created_at: string
          document_url: string | null
          expiry_date: string | null
          id: string
          is_public: boolean | null
          issue_date: string | null
          issuing_organization: string
          name: string
          status: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          certificate_number?: string | null
          created_at?: string
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          is_public?: boolean | null
          issue_date?: string | null
          issuing_organization: string
          name: string
          status?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          certificate_number?: string | null
          created_at?: string
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          is_public?: boolean | null
          issue_date?: string | null
          issuing_organization?: string
          name?: string
          status?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      checklist_completions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          booking_id: string
          checklist_id: string
          completed_at: string | null
          completed_by: string
          id: string
          notes: string | null
          photo_url: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          status: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          booking_id: string
          checklist_id: string
          completed_at?: string | null
          completed_by: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          booking_id?: string
          checklist_id?: string
          completed_at?: string | null
          completed_by?: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_completions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_completions_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "task_checklists"
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
      dispute_analysis: {
        Row: {
          ai_model: string | null
          analysis_type: string
          confidence_score: number | null
          created_at: string | null
          dispute_id: string
          evidence_summary: Json | null
          id: string
          inconsistencies: Json | null
          reasoning: string | null
          recommendation: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_score: number | null
          suggested_resolution: string | null
        }
        Insert: {
          ai_model?: string | null
          analysis_type: string
          confidence_score?: number | null
          created_at?: string | null
          dispute_id: string
          evidence_summary?: Json | null
          id?: string
          inconsistencies?: Json | null
          reasoning?: string | null
          recommendation?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score?: number | null
          suggested_resolution?: string | null
        }
        Update: {
          ai_model?: string | null
          analysis_type?: string
          confidence_score?: number | null
          created_at?: string | null
          dispute_id?: string
          evidence_summary?: Json | null
          id?: string
          inconsistencies?: Json | null
          reasoning?: string | null
          recommendation?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score?: number | null
          suggested_resolution?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispute_analysis_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_evidence: {
        Row: {
          created_at: string
          description: string | null
          dispute_id: string
          evidence_type: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          dispute_id: string
          evidence_type?: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          description?: string | null
          dispute_id?: string
          evidence_type?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_evidence_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
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
      doer_live_availability: {
        Row: {
          accepts_instant_requests: boolean | null
          app_version: string | null
          battery_level: number | null
          created_at: string | null
          current_latitude: number | null
          current_longitude: number | null
          current_task_id: string | null
          device_info: Json | null
          heading: number | null
          id: string
          is_available: boolean
          is_charging: boolean | null
          last_location_update: string | null
          last_ping: string | null
          location_accuracy: number | null
          max_distance_km: number | null
          network_type: string | null
          preferred_categories: string[] | null
          speed: number | null
          status: string
          today_online_seconds: number | null
          today_tasks_completed: number | null
          total_online_seconds: number | null
          updated_at: string | null
          user_id: string
          went_online_at: string | null
        }
        Insert: {
          accepts_instant_requests?: boolean | null
          app_version?: string | null
          battery_level?: number | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          current_task_id?: string | null
          device_info?: Json | null
          heading?: number | null
          id?: string
          is_available?: boolean
          is_charging?: boolean | null
          last_location_update?: string | null
          last_ping?: string | null
          location_accuracy?: number | null
          max_distance_km?: number | null
          network_type?: string | null
          preferred_categories?: string[] | null
          speed?: number | null
          status?: string
          today_online_seconds?: number | null
          today_tasks_completed?: number | null
          total_online_seconds?: number | null
          updated_at?: string | null
          user_id: string
          went_online_at?: string | null
        }
        Update: {
          accepts_instant_requests?: boolean | null
          app_version?: string | null
          battery_level?: number | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          current_task_id?: string | null
          device_info?: Json | null
          heading?: number | null
          id?: string
          is_available?: boolean
          is_charging?: boolean | null
          last_location_update?: string | null
          last_ping?: string | null
          location_accuracy?: number | null
          max_distance_km?: number | null
          network_type?: string | null
          preferred_categories?: string[] | null
          speed?: number | null
          status?: string
          today_online_seconds?: number | null
          today_tasks_completed?: number | null
          total_online_seconds?: number | null
          updated_at?: string | null
          user_id?: string
          went_online_at?: string | null
        }
        Relationships: []
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
      login_history: {
        Row: {
          failure_reason: string | null
          id: string
          ip_address: string | null
          location_info: Json | null
          login_at: string
          login_method: string | null
          success: boolean
          user_agent: string | null
          user_id: string
        }
        Insert: {
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          location_info?: Json | null
          login_at?: string
          login_method?: string | null
          success?: boolean
          user_agent?: string | null
          user_id: string
        }
        Update: {
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          location_info?: Json | null
          login_at?: string
          login_method?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
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
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
      otp_codes: {
        Row: {
          attempts: number | null
          code: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          ip_address: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          attempts?: number | null
          code: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          ip_address?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          attempts?: number | null
          code?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          stripe_payment_method_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
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
          auto_release_at: string | null
          auto_release_triggered: boolean | null
          booking_id: string
          created_at: string
          deposit_refund_id: string | null
          deposit_refunded: boolean | null
          escrow_status: string | null
          id: string
          is_deposit: boolean | null
          paid_at: string | null
          payee_id: string
          payer_id: string
          payment_intent_id: string | null
          payment_method: string | null
          payout_amount: number
          payout_at: string | null
          platform_fee: number
          release_type: string | null
          released_at: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          task_doer_confirmed: boolean | null
          task_giver_confirmed: boolean | null
          task_id: string
          tax_deducted: number | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          auto_release_at?: string | null
          auto_release_triggered?: boolean | null
          booking_id: string
          created_at?: string
          deposit_refund_id?: string | null
          deposit_refunded?: boolean | null
          escrow_status?: string | null
          id?: string
          is_deposit?: boolean | null
          paid_at?: string | null
          payee_id: string
          payer_id: string
          payment_intent_id?: string | null
          payment_method?: string | null
          payout_amount: number
          payout_at?: string | null
          platform_fee: number
          release_type?: string | null
          released_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          task_doer_confirmed?: boolean | null
          task_giver_confirmed?: boolean | null
          task_id: string
          tax_deducted?: number | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          auto_release_at?: string | null
          auto_release_triggered?: boolean | null
          booking_id?: string
          created_at?: string
          deposit_refund_id?: string | null
          deposit_refunded?: boolean | null
          escrow_status?: string | null
          id?: string
          is_deposit?: boolean | null
          paid_at?: string | null
          payee_id?: string
          payer_id?: string
          payment_intent_id?: string | null
          payment_method?: string | null
          payout_amount?: number
          payout_at?: string | null
          platform_fee?: number
          release_type?: string | null
          released_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          task_doer_confirmed?: boolean | null
          task_giver_confirmed?: boolean | null
          task_id?: string
          tax_deducted?: number | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_payee_id_fkey"
            columns: ["payee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payee_id_fkey"
            columns: ["payee_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
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
      phone_verifications: {
        Row: {
          attempts: number | null
          code: string
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          pending_email: string | null
          phone: string
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          attempts?: number | null
          code: string
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: string | null
          pending_email?: string | null
          phone: string
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          attempts?: number | null
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          pending_email?: string | null
          phone?: string
          user_id?: string | null
          verified_at?: string | null
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
          account_locked_until: string | null
          address: string | null
          availability_status: string | null
          avatar_url: string | null
          background_check_expires_at: string | null
          background_check_status: string | null
          background_check_verified_at: string | null
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
          failed_login_attempts: number | null
          full_name: string | null
          hourly_rate: number | null
          id: string
          is_online: boolean | null
          joined_date: string | null
          last_active: string | null
          last_password_change: string | null
          last_seen: string | null
          latitude: number | null
          linkedin: string | null
          longitude: number | null
          minimum_balance_met: boolean | null
          on_time_rate: number | null
          payment_verified: boolean | null
          payment_verified_at: string | null
          phone: string | null
          preferred_categories: string[] | null
          profile_completion: number | null
          rating: number | null
          reliability_score: number | null
          reputation_score: number | null
          response_rate: number | null
          security_notifications_enabled: boolean | null
          security_questions_set: boolean | null
          skills: string[] | null
          stripe_customer_id: string | null
          stripe_payment_method_id: string | null
          total_reviews: number | null
          trust_score: number | null
          twitter: string | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          user_id_number: string | null
          verification_level: string | null
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
          verified_by_admin: boolean | null
          wallet_balance: number | null
          website: string | null
        }
        Insert: {
          account_locked_until?: string | null
          address?: string | null
          availability_status?: string | null
          avatar_url?: string | null
          background_check_expires_at?: string | null
          background_check_status?: string | null
          background_check_verified_at?: string | null
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
          failed_login_attempts?: number | null
          full_name?: string | null
          hourly_rate?: number | null
          id: string
          is_online?: boolean | null
          joined_date?: string | null
          last_active?: string | null
          last_password_change?: string | null
          last_seen?: string | null
          latitude?: number | null
          linkedin?: string | null
          longitude?: number | null
          minimum_balance_met?: boolean | null
          on_time_rate?: number | null
          payment_verified?: boolean | null
          payment_verified_at?: string | null
          phone?: string | null
          preferred_categories?: string[] | null
          profile_completion?: number | null
          rating?: number | null
          reliability_score?: number | null
          reputation_score?: number | null
          response_rate?: number | null
          security_notifications_enabled?: boolean | null
          security_questions_set?: boolean | null
          skills?: string[] | null
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          total_reviews?: number | null
          trust_score?: number | null
          twitter?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id_number?: string | null
          verification_level?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          verified_by_admin?: boolean | null
          wallet_balance?: number | null
          website?: string | null
        }
        Update: {
          account_locked_until?: string | null
          address?: string | null
          availability_status?: string | null
          avatar_url?: string | null
          background_check_expires_at?: string | null
          background_check_status?: string | null
          background_check_verified_at?: string | null
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
          failed_login_attempts?: number | null
          full_name?: string | null
          hourly_rate?: number | null
          id?: string
          is_online?: boolean | null
          joined_date?: string | null
          last_active?: string | null
          last_password_change?: string | null
          last_seen?: string | null
          latitude?: number | null
          linkedin?: string | null
          longitude?: number | null
          minimum_balance_met?: boolean | null
          on_time_rate?: number | null
          payment_verified?: boolean | null
          payment_verified_at?: string | null
          phone?: string | null
          preferred_categories?: string[] | null
          profile_completion?: number | null
          rating?: number | null
          reliability_score?: number | null
          reputation_score?: number | null
          response_rate?: number | null
          security_notifications_enabled?: boolean | null
          security_questions_set?: boolean | null
          skills?: string[] | null
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          total_reviews?: number | null
          trust_score?: number | null
          twitter?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id_number?: string | null
          verification_level?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          verified_by_admin?: boolean | null
          wallet_balance?: number | null
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
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          reward_amount: number | null
          updated_at: string | null
          user_id: string
          uses_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          reward_amount?: number | null
          updated_at?: string | null
          user_id: string
          uses_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          reward_amount?: number | null
          updated_at?: string | null
          user_id?: string
          uses_count?: number | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          qualifying_task_id: string | null
          referral_code_id: string | null
          referred_id: string
          referred_reward: number | null
          referred_rewarded_at: string | null
          referrer_id: string
          referrer_reward: number | null
          referrer_rewarded_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          qualifying_task_id?: string | null
          referral_code_id?: string | null
          referred_id: string
          referred_reward?: number | null
          referred_rewarded_at?: string | null
          referrer_id: string
          referrer_reward?: number | null
          referrer_rewarded_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          qualifying_task_id?: string | null
          referral_code_id?: string | null
          referred_id?: string
          referred_reward?: number | null
          referred_rewarded_at?: string | null
          referrer_id?: string
          referrer_reward?: number | null
          referrer_rewarded_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_qualifying_task_id_fkey"
            columns: ["qualifying_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
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
      saved_searches: {
        Row: {
          created_at: string
          filters: Json
          id: string
          name: string
          notify_new_matches: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          name: string
          notify_new_matches?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          name?: string
          notify_new_matches?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      signup_verifications: {
        Row: {
          attempts: number | null
          code: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          ip_address: string | null
          verified_at: string | null
        }
        Insert: {
          attempts?: number | null
          code: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          ip_address?: string | null
          verified_at?: string | null
        }
        Update: {
          attempts?: number | null
          code?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          verified_at?: string | null
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
      smart_match_logs: {
        Row: {
          action_taken: string | null
          created_at: string | null
          id: string
          match_reasons: Json | null
          match_score: number | null
          task_id: string | null
          user_id: string
        }
        Insert: {
          action_taken?: string | null
          created_at?: string | null
          id?: string
          match_reasons?: Json | null
          match_score?: number | null
          task_id?: string | null
          user_id: string
        }
        Update: {
          action_taken?: string | null
          created_at?: string | null
          id?: string
          match_reasons?: Json | null
          match_score?: number | null
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smart_match_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
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
      task_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_alerts_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_bids: {
        Row: {
          bid_amount: number
          bidder_id: string
          created_at: string | null
          estimated_hours: number | null
          id: string
          message: string | null
          status: string
          task_id: string
          updated_at: string | null
        }
        Insert: {
          bid_amount: number
          bidder_id: string
          created_at?: string | null
          estimated_hours?: number | null
          id?: string
          message?: string | null
          status?: string
          task_id: string
          updated_at?: string | null
        }
        Update: {
          bid_amount?: number
          bidder_id?: string
          created_at?: string | null
          estimated_hours?: number | null
          id?: string
          message?: string | null
          status?: string
          task_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_bids_bidder_id_fkey"
            columns: ["bidder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_bids_bidder_id_fkey"
            columns: ["bidder_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_bids_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_checkins: {
        Row: {
          booking_id: string
          checkin_type: string
          created_at: string | null
          device_info: Json | null
          id: string
          latitude: number | null
          location_accuracy: number | null
          location_address: string | null
          longitude: number | null
          notes: string | null
          photo_url: string | null
          task_id: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          booking_id: string
          checkin_type: string
          created_at?: string | null
          device_info?: Json | null
          id?: string
          latitude?: number | null
          location_accuracy?: number | null
          location_address?: string | null
          longitude?: number | null
          notes?: string | null
          photo_url?: string | null
          task_id: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          booking_id?: string
          checkin_type?: string
          created_at?: string | null
          device_info?: Json | null
          id?: string
          latitude?: number | null
          location_accuracy?: number | null
          location_address?: string | null
          longitude?: number | null
          notes?: string | null
          photo_url?: string | null
          task_id?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "task_checkins_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_checkins_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_checklists: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          display_order: number | null
          id: string
          requires_giver_approval: boolean | null
          requires_photo: boolean | null
          task_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          display_order?: number | null
          id?: string
          requires_giver_approval?: boolean | null
          requires_photo?: boolean | null
          task_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          display_order?: number | null
          id?: string
          requires_giver_approval?: boolean | null
          requires_photo?: boolean | null
          task_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_checklists_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "task_milestones_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "pending_auto_releases"
            referencedColumns: ["payment_id"]
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
          deposit_amount: number | null
          deposit_paid: boolean | null
          deposit_paid_at: string | null
          deposit_payment_intent_id: string | null
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
          priority: string | null
          requires_deposit: boolean | null
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
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          deposit_paid_at?: string | null
          deposit_payment_intent_id?: string | null
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
          priority?: string | null
          requires_deposit?: boolean | null
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
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          deposit_paid_at?: string | null
          deposit_payment_intent_id?: string | null
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
          priority?: string | null
          requires_deposit?: boolean | null
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
      tax_calculations: {
        Row: {
          booking_id: string | null
          contractor_withholding: number | null
          created_at: string | null
          gross_amount: number
          gst_amount: number | null
          id: string
          net_amount: number
          payment_id: string | null
          province: string | null
          pst_amount: number | null
          tax_breakdown: Json | null
          tax_year: number | null
          total_tax: number
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          contractor_withholding?: number | null
          created_at?: string | null
          gross_amount: number
          gst_amount?: number | null
          id?: string
          net_amount: number
          payment_id?: string | null
          province?: string | null
          pst_amount?: number | null
          tax_breakdown?: Json | null
          tax_year?: number | null
          total_tax: number
          user_id: string
        }
        Update: {
          booking_id?: string | null
          contractor_withholding?: number | null
          created_at?: string | null
          gross_amount?: number
          gst_amount?: number | null
          id?: string
          net_amount?: number
          payment_id?: string | null
          province?: string | null
          pst_amount?: number | null
          tax_breakdown?: Json | null
          tax_year?: number | null
          total_tax?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_calculations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_calculations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_calculations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "pending_auto_releases"
            referencedColumns: ["payment_id"]
          },
        ]
      }
      tax_configurations: {
        Row: {
          applies_to: string | null
          created_at: string | null
          description: string | null
          effective_from: string
          effective_to: string | null
          id: string
          is_active: boolean | null
          province: string
          rate: number
          tax_type: string
          threshold_amount: number | null
          updated_at: string | null
        }
        Insert: {
          applies_to?: string | null
          created_at?: string | null
          description?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          province?: string
          rate: number
          tax_type: string
          threshold_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          applies_to?: string | null
          created_at?: string | null
          description?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          province?: string
          rate?: number
          tax_type?: string
          threshold_amount?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tiffin_menus: {
        Row: {
          available_days: number[] | null
          calories_approx: number | null
          cover_image_url: string | null
          created_at: string | null
          cuisine_origin: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_gluten_free: boolean | null
          is_halal: boolean | null
          is_vegan: boolean | null
          is_vegetarian: boolean | null
          items: string[]
          max_orders_per_day: number | null
          meal_type: string
          menu_name: string
          preparation_time_minutes: number | null
          price_per_meal: number
          provider_id: string
          spice_level: number | null
          updated_at: string | null
        }
        Insert: {
          available_days?: number[] | null
          calories_approx?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          cuisine_origin?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_gluten_free?: boolean | null
          is_halal?: boolean | null
          is_vegan?: boolean | null
          is_vegetarian?: boolean | null
          items?: string[]
          max_orders_per_day?: number | null
          meal_type: string
          menu_name: string
          preparation_time_minutes?: number | null
          price_per_meal: number
          provider_id: string
          spice_level?: number | null
          updated_at?: string | null
        }
        Update: {
          available_days?: number[] | null
          calories_approx?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          cuisine_origin?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_gluten_free?: boolean | null
          is_halal?: boolean | null
          is_vegan?: boolean | null
          is_vegetarian?: boolean | null
          items?: string[]
          max_orders_per_day?: number | null
          meal_type?: string
          menu_name?: string
          preparation_time_minutes?: number | null
          price_per_meal?: number
          provider_id?: string
          spice_level?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tiffin_menus_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "tiffin_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      tiffin_orders: {
        Row: {
          created_at: string | null
          customer_id: string
          delivery_address: string
          delivery_instructions: string | null
          delivery_latitude: number | null
          delivery_longitude: number | null
          id: string
          menu_id: string
          order_type: string
          payment_intent_id: string | null
          payment_status: string | null
          provider_id: string
          quantity: number
          scheduled_date: string | null
          scheduled_time: string | null
          special_requests: string | null
          status: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          delivery_address: string
          delivery_instructions?: string | null
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          id?: string
          menu_id: string
          order_type: string
          payment_intent_id?: string | null
          payment_status?: string | null
          provider_id: string
          quantity?: number
          scheduled_date?: string | null
          scheduled_time?: string | null
          special_requests?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          delivery_address?: string
          delivery_instructions?: string | null
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          id?: string
          menu_id?: string
          order_type?: string
          payment_intent_id?: string | null
          payment_status?: string | null
          provider_id?: string
          quantity?: number
          scheduled_date?: string | null
          scheduled_time?: string | null
          special_requests?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tiffin_orders_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "tiffin_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiffin_orders_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "tiffin_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      tiffin_providers: {
        Row: {
          accepts_subscriptions: boolean | null
          avg_rating: number | null
          business_name: string
          cover_image_url: string | null
          created_at: string | null
          cuisine_type: string[]
          delivery_areas: string[] | null
          delivery_radius_km: number | null
          description: string | null
          dietary_options: string[] | null
          food_safety_certificate_url: string | null
          gallery_images: string[] | null
          hygiene_rating: number | null
          id: string
          is_active: boolean | null
          kitchen_certified: boolean | null
          latitude: number | null
          longitude: number | null
          min_order_amount: number | null
          total_orders: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepts_subscriptions?: boolean | null
          avg_rating?: number | null
          business_name: string
          cover_image_url?: string | null
          created_at?: string | null
          cuisine_type?: string[]
          delivery_areas?: string[] | null
          delivery_radius_km?: number | null
          description?: string | null
          dietary_options?: string[] | null
          food_safety_certificate_url?: string | null
          gallery_images?: string[] | null
          hygiene_rating?: number | null
          id?: string
          is_active?: boolean | null
          kitchen_certified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          min_order_amount?: number | null
          total_orders?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepts_subscriptions?: boolean | null
          avg_rating?: number | null
          business_name?: string
          cover_image_url?: string | null
          created_at?: string | null
          cuisine_type?: string[]
          delivery_areas?: string[] | null
          delivery_radius_km?: number | null
          description?: string | null
          dietary_options?: string[] | null
          food_safety_certificate_url?: string | null
          gallery_images?: string[] | null
          hygiene_rating?: number | null
          id?: string
          is_active?: boolean | null
          kitchen_certified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          min_order_amount?: number | null
          total_orders?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tiffin_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_id: string
          delivery_rating: number
          hygiene_rating: number
          id: string
          is_verified: boolean | null
          order_id: string
          overall_rating: number | null
          packaging_rating: number
          photo_urls: string[] | null
          provider_id: string
          taste_rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_id: string
          delivery_rating: number
          hygiene_rating: number
          id?: string
          is_verified?: boolean | null
          order_id: string
          overall_rating?: number | null
          packaging_rating: number
          photo_urls?: string[] | null
          provider_id: string
          taste_rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string
          delivery_rating?: number
          hygiene_rating?: number
          id?: string
          is_verified?: boolean | null
          order_id?: string
          overall_rating?: number | null
          packaging_rating?: number
          photo_urls?: string[] | null
          provider_id?: string
          taste_rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "tiffin_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "tiffin_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiffin_reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "tiffin_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      tiffin_subscriptions: {
        Row: {
          created_at: string | null
          custom_days: number[] | null
          customer_id: string
          delivery_address: string
          delivery_time: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          meals_per_day: number | null
          menu_id: string
          pause_from: string | null
          pause_until: string | null
          price_per_meal: number
          provider_id: string
          quantity_per_meal: number | null
          start_date: string
          subscription_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_days?: number[] | null
          customer_id: string
          delivery_address: string
          delivery_time?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          meals_per_day?: number | null
          menu_id: string
          pause_from?: string | null
          pause_until?: string | null
          price_per_meal: number
          provider_id: string
          quantity_per_meal?: number | null
          start_date: string
          subscription_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_days?: number[] | null
          customer_id?: string
          delivery_address?: string
          delivery_time?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          meals_per_day?: number | null
          menu_id?: string
          pause_from?: string | null
          pause_until?: string | null
          price_per_meal?: number
          provider_id?: string
          quantity_per_meal?: number | null
          start_date?: string
          subscription_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tiffin_subscriptions_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "tiffin_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiffin_subscriptions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "tiffin_providers"
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
      user_achievements: {
        Row: {
          achievement_id: string
          claimed_at: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          progress: number | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          progress?: number | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
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
      user_financial_data: {
        Row: {
          created_at: string | null
          id: string
          minimum_balance_met: boolean | null
          stripe_customer_id: string | null
          stripe_payment_method_id: string | null
          updated_at: string | null
          user_id: string
          wallet_balance: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          minimum_balance_met?: boolean | null
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          updated_at?: string | null
          user_id: string
          wallet_balance?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          minimum_balance_met?: boolean | null
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_balance?: number | null
        }
        Relationships: []
      }
      user_match_preferences: {
        Row: {
          ai_matching_enabled: boolean | null
          availability_hours: Json | null
          created_at: string | null
          id: string
          last_match_at: string | null
          notification_preferences: Json | null
          preferred_categories: string[] | null
          preferred_distance_km: number | null
          preferred_price_max: number | null
          preferred_price_min: number | null
          preferred_task_types: string[] | null
          skill_keywords: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_matching_enabled?: boolean | null
          availability_hours?: Json | null
          created_at?: string | null
          id?: string
          last_match_at?: string | null
          notification_preferences?: Json | null
          preferred_categories?: string[] | null
          preferred_distance_km?: number | null
          preferred_price_max?: number | null
          preferred_price_min?: number | null
          preferred_task_types?: string[] | null
          skill_keywords?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_matching_enabled?: boolean | null
          availability_hours?: Json | null
          created_at?: string | null
          id?: string
          last_match_at?: string | null
          notification_preferences?: Json | null
          preferred_categories?: string[] | null
          preferred_distance_km?: number | null
          preferred_price_max?: number | null
          preferred_price_min?: number | null
          preferred_task_types?: string[] | null
          skill_keywords?: string[] | null
          updated_at?: string | null
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
      user_security_settings: {
        Row: {
          account_locked_until: string | null
          created_at: string | null
          failed_login_attempts: number | null
          id: string
          last_password_change: string | null
          security_notifications_enabled: boolean | null
          security_questions_set: boolean | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_locked_until?: string | null
          created_at?: string | null
          failed_login_attempts?: number | null
          id?: string
          last_password_change?: string | null
          security_notifications_enabled?: boolean | null
          security_questions_set?: boolean | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_locked_until?: string | null
          created_at?: string | null
          failed_login_attempts?: number | null
          id?: string
          last_password_change?: string | null
          security_notifications_enabled?: boolean | null
          security_questions_set?: boolean | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean
          last_activity_at: string
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_activity_at?: string
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_activity_at?: string
          session_token?: string
          user_agent?: string | null
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
          phone_verified: boolean | null
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
          verified_phone: string | null
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
          phone_verified?: boolean | null
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
          verified_phone?: string | null
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
          phone_verified?: boolean | null
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
          verified_phone?: string | null
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
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string | null
          description: string | null
          id: string
          related_booking_id: string | null
          related_task_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string | null
          description?: string | null
          id?: string
          related_booking_id?: string | null
          related_task_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string | null
          description?: string | null
          id?: string
          related_booking_id?: string | null
          related_task_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_related_task_id_fkey"
            columns: ["related_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      work_evidence: {
        Row: {
          booking_id: string
          caption: string | null
          created_at: string
          evidence_type: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          metadata: Json | null
          task_id: string
          uploaded_by: string
        }
        Insert: {
          booking_id: string
          caption?: string | null
          created_at?: string
          evidence_type?: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          metadata?: Json | null
          task_id: string
          uploaded_by: string
        }
        Update: {
          booking_id?: string
          caption?: string | null
          created_at?: string
          evidence_type?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          metadata?: Json | null
          task_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_evidence_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_evidence_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      pending_auto_releases: {
        Row: {
          amount: number | null
          auto_release_at: string | null
          booking_id: string | null
          booking_status: Database["public"]["Enums"]["booking_status"] | null
          hours_until_release: number | null
          payee_id: string | null
          payer_id: string | null
          payment_id: string | null
          payout_amount: number | null
          task_doer_confirmed: boolean | null
          task_giver_confirmed: boolean | null
          task_id: string | null
          task_title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_payee_id_fkey"
            columns: ["payee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payee_id_fkey"
            columns: ["payee_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
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
      award_leaderboard_badges: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      calculate_reputation_score: {
        Args: { p_user_id: string }
        Returns: number
      }
      calculate_saskatchewan_tax: {
        Args: { p_gross_amount: number; p_is_contractor_payout?: boolean }
        Returns: Json
      }
      calculate_trust_score: { Args: { p_user_id: string }; Returns: number }
      check_suspicious_login: {
        Args: { p_ip_address: string; p_user_id: string }
        Returns: boolean
      }
      check_user_achievements: {
        Args: { p_user_id: string }
        Returns: {
          achievement_id: string
          claimed_at: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          progress: number | null
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "user_achievements"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      cleanup_expired_otp_codes: { Args: never; Returns: undefined }
      cleanup_expired_sessions: { Args: never; Returns: undefined }
      cleanup_expired_signup_verifications: { Args: never; Returns: undefined }
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
      find_nearby_doers: {
        Args: {
          p_category?: string
          p_exclude_user_id?: string
          p_latitude: number
          p_longitude: number
          p_radius_km?: number
        }
        Returns: {
          avatar_url: string
          distance_km: number
          eta_minutes: number
          full_name: string
          last_ping: string
          rating: number
          status: string
          total_reviews: number
          user_id: string
        }[]
      }
      generate_referral_code: { Args: never; Returns: string }
      generate_user_id_number: {
        Args: { p_role: string; p_wants_both?: boolean }
        Returns: string
      }
      get_or_create_referral_code: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_user_leaderboard_rank: {
        Args: { p_user_id: string }
        Returns: {
          rating_rank: number
          tasks_rank: number
          total_taskers: number
        }[]
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
      log_audit_event: {
        Args: {
          p_booking_id: string
          p_event_category: string
          p_event_data?: Json
          p_event_type: string
          p_ip_address?: string
          p_location_data?: Json
          p_task_id: string
          p_user_id: string
        }
        Returns: string
      }
      process_pending_auto_releases: {
        Args: never
        Returns: {
          booking_id: string
          payment_id: string
          released: boolean
        }[]
      }
      process_referral: {
        Args: { p_code: string; p_referred_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "task_giver" | "task_doer" | "admin"
      background_check_status:
        | "pending"
        | "processing"
        | "passed"
        | "failed"
        | "expired"
        | "cancelled"
      background_check_type:
        | "criminal_record"
        | "identity_verification"
        | "employment_history"
        | "education_verification"
        | "credit_check"
        | "reference_check"
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
      background_check_status: [
        "pending",
        "processing",
        "passed",
        "failed",
        "expired",
        "cancelled",
      ],
      background_check_type: [
        "criminal_record",
        "identity_verification",
        "employment_history",
        "education_verification",
        "credit_check",
        "reference_check",
      ],
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
