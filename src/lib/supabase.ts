import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      batches: {
        Row: {
          id: string
          user_id: string
          name: string
          opening_balance: number
          start_date: string
          end_date: string
          total_expense: number
          closing_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          opening_balance: number
          start_date: string
          end_date: string
          total_expense?: number
          closing_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          opening_balance?: number
          start_date?: string
          end_date?: string
          total_expense?: number
          closing_balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          batch_id: string
          date: string
          particulars: string
          amount: number
          place: string
          remarks: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          batch_id: string
          date: string
          particulars: string
          amount: number
          place: string
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          batch_id?: string
          date?: string
          particulars?: string
          amount?: number
          place?: string
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}