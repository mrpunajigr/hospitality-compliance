// Hospitality Compliance SaaS - Database Types
// Generated from Supabase schema

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          business_type: string
          license_number: string | null
          business_email: string
          phone: string | null
          address: any | null // JSONB
          subscription_status: 'trial' | 'active' | 'past_due' | 'cancelled'
          subscription_tier: 'basic' | 'professional' | 'enterprise'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_start_date: string | null
          subscription_end_date: string | null
          last_payment_date: string | null
          document_limit: number
          estimated_monthly_deliveries: number | null
          onboarding_status: string
          onboarding_completed_at: string | null
          first_document_processed: boolean
          selected_plan: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          business_type?: string
          license_number?: string | null
          business_email: string
          phone?: string | null
          address?: any | null
          subscription_status?: 'trial' | 'active' | 'past_due' | 'cancelled'
          subscription_tier?: 'basic' | 'professional' | 'enterprise'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          last_payment_date?: string | null
          document_limit?: number
          estimated_monthly_deliveries?: number | null
          onboarding_status?: string
          onboarding_completed_at?: string | null
          first_document_processed?: boolean
          selected_plan?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          business_type?: string
          license_number?: string | null
          business_email?: string
          phone?: string | null
          address?: any | null
          subscription_status?: 'trial' | 'active' | 'past_due' | 'cancelled'
          subscription_tier?: 'basic' | 'professional' | 'enterprise'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          last_payment_date?: string | null
          document_limit?: number
          estimated_monthly_deliveries?: number | null
          onboarding_status?: string
          onboarding_completed_at?: string | null
          first_document_processed?: boolean
          selected_plan?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          is_super_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          is_super_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          is_super_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      client_users: {
        Row: {
          id: string
          user_id: string
          client_id: string
          role: 'staff' | 'manager' | 'admin' | 'owner'
          status: 'active' | 'inactive' | 'pending'
          invited_by: string | null
          invited_at: string | null
          joined_at: string | null
          permissions: any | null // JSONB
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          role: 'staff' | 'manager' | 'admin' | 'owner'
          status?: 'active' | 'inactive' | 'pending'
          invited_by?: string | null
          invited_at?: string | null
          joined_at?: string | null
          permissions?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          role?: 'staff' | 'manager' | 'admin' | 'owner'
          status?: 'active' | 'inactive' | 'pending'
          invited_by?: string | null
          invited_at?: string | null
          joined_at?: string | null
          permissions?: any | null
          created_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          client_id: string
          name: string
          contact_email: string | null
          contact_phone: string | null
          address: any | null // JSONB
          delivery_schedule: any | null // JSONB
          product_types: any | null // JSONB
          temperature_requirements: any | null // JSONB
          compliance_rating: number
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          contact_email?: string | null
          contact_phone?: string | null
          address?: any | null
          delivery_schedule?: any | null
          product_types?: any | null
          temperature_requirements?: any | null
          compliance_rating?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          contact_email?: string | null
          contact_phone?: string | null
          address?: any | null
          delivery_schedule?: any | null
          product_types?: any | null
          temperature_requirements?: any | null
          compliance_rating?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      delivery_records: {
        Row: {
          id: string
          client_id: string
          user_id: string | null
          supplier_id: string | null
          supplier_name: string | null
          image_path: string
          docket_number: string | null
          delivery_date: string | null
          products: any | null // JSONB
          raw_extracted_text: string | null
          processing_status: 'pending' | 'processing' | 'completed' | 'failed'
          confidence_score: number | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          user_id?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          image_path: string
          docket_number?: string | null
          delivery_date?: string | null
          products?: any | null
          raw_extracted_text?: string | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          confidence_score?: number | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          user_id?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          image_path?: string
          docket_number?: string | null
          delivery_date?: string | null
          products?: any | null
          raw_extracted_text?: string | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          confidence_score?: number | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      temperature_readings: {
        Row: {
          id: string
          delivery_record_id: string
          temperature_value: number
          temperature_unit: 'C' | 'F'
          product_type: string | null
          is_compliant: boolean | null
          risk_level: 'low' | 'medium' | 'high' | 'critical' | null
          safe_min_temp: number | null
          safe_max_temp: number | null
          context: string | null
          extracted_at: string
        }
        Insert: {
          id?: string
          delivery_record_id: string
          temperature_value: number
          temperature_unit?: 'C' | 'F'
          product_type?: string | null
          is_compliant?: boolean | null
          risk_level?: 'low' | 'medium' | 'high' | 'critical' | null
          safe_min_temp?: number | null
          safe_max_temp?: number | null
          context?: string | null
          extracted_at?: string
        }
        Update: {
          id?: string
          delivery_record_id?: string
          temperature_value?: number
          temperature_unit?: 'C' | 'F'
          product_type?: string | null
          is_compliant?: boolean | null
          risk_level?: 'low' | 'medium' | 'high' | 'critical' | null
          safe_min_temp?: number | null
          safe_max_temp?: number | null
          context?: string | null
          extracted_at?: string
        }
      }
      compliance_alerts: {
        Row: {
          id: string
          delivery_record_id: string
          client_id: string
          alert_type: string
          severity: 'warning' | 'critical'
          temperature_value: number | null
          supplier_name: string | null
          message: string
          requires_acknowledgment: boolean
          acknowledged_by: string | null
          acknowledged_at: string | null
          resolved_at: string | null
          corrective_actions: string | null
          created_at: string
        }
        Insert: {
          id?: string
          delivery_record_id: string
          client_id: string
          alert_type: string
          severity: 'warning' | 'critical'
          temperature_value?: number | null
          supplier_name?: string | null
          message: string
          requires_acknowledgment?: boolean
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          resolved_at?: string | null
          corrective_actions?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          delivery_record_id?: string
          client_id?: string
          alert_type?: string
          severity?: 'warning' | 'critical'
          temperature_value?: number | null
          supplier_name?: string | null
          message?: string
          requires_acknowledgment?: boolean
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          resolved_at?: string | null
          corrective_actions?: string | null
          created_at?: string
        }
      }
      compliance_reports: {
        Row: {
          id: string
          client_id: string
          report_type: string
          period_start: string | null
          period_end: string | null
          generated_by: string | null
          format: 'pdf' | 'csv' | null
          file_path: string | null
          download_count: number
          generated_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          report_type: string
          period_start?: string | null
          period_end?: string | null
          generated_by?: string | null
          format?: 'pdf' | 'csv' | null
          file_path?: string | null
          download_count?: number
          generated_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          report_type?: string
          period_start?: string | null
          period_end?: string | null
          generated_by?: string | null
          format?: 'pdf' | 'csv' | null
          file_path?: string | null
          download_count?: number
          generated_at?: string
          expires_at?: string | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          client_id: string | null
          user_id: string | null
          timestamp: string
          action: string
          resource_type: string | null
          resource_id: string | null
          details: any | null // JSONB
          ip_address: string | null
          user_agent: string | null
          session_id: string | null
        }
        Insert: {
          id?: string
          client_id?: string | null
          user_id?: string | null
          timestamp?: string
          action: string
          resource_type?: string | null
          resource_id?: string | null
          details?: any | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
        }
        Update: {
          id?: string
          client_id?: string | null
          user_id?: string | null
          timestamp?: string
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          details?: any | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_clients: {
        Args: { user_uuid: string }
        Returns: Array<{ client_id: string; role: string }>
      }
      user_has_client_access: {
        Args: { user_uuid: string; target_client_id: string }
        Returns: boolean
      }
      user_client_role: {
        Args: { user_uuid: string; target_client_id: string }
        Returns: string | null
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// =====================================================
// TYPESCRIPT UTILITY TYPES
// =====================================================

// Client with relationships
export type ClientWithUsers = Database['public']['Tables']['clients']['Row'] & {
  client_users: Array<Database['public']['Tables']['client_users']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row']
  }>
}

// Delivery record with relationships
export type DeliveryRecordWithRelations = Database['public']['Tables']['delivery_records']['Row'] & {
  temperature_readings: Array<Database['public']['Tables']['temperature_readings']['Row']>
  suppliers?: Database['public']['Tables']['suppliers']['Row']
  profiles?: Database['public']['Tables']['profiles']['Row']
}

// Compliance alert with delivery record
export type ComplianceAlertWithRecord = Database['public']['Tables']['compliance_alerts']['Row'] & {
  delivery_records: {
    docket_number: string | null
    supplier_name: string | null
    created_at: string
  }
}

// User with client relationship
export type UserWithClients = Database['public']['Tables']['profiles']['Row'] & {
  client_users: Array<Database['public']['Tables']['client_users']['Row'] & {
    clients: Database['public']['Tables']['clients']['Row']
  }>
}

// Team member with profile
export type TeamMemberWithProfile = Database['public']['Tables']['client_users']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

// =====================================================
// BUSINESS LOGIC TYPES
// =====================================================

export interface ComplianceRule {
  chilled_max: number
  frozen_min: number  
  ambient_max: number
  alert_threshold: 'immediate' | 'delayed'
}

export interface AlertPreferences {
  email: {
    enabled: boolean
    critical_only: boolean
  }
  sms: {
    enabled: boolean
    critical_only: boolean
  }
}

export interface Address {
  street: string
  city: string
  region: string
  postalCode: string
  country: string
}

export interface TemperatureRequirements {
  chilled?: { min: number; max: number }
  frozen?: { min: number; max: number }
  ambient?: { min: number; max: number }
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}