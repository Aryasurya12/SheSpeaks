import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Supabase Client Configuration
// ---------------------------------------------------------------------------
// Reads URL & anon key from environment. These MUST be set in .env.local
// as NEXT_PUBLIC_* so they're available in both server and client contexts.
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ---------------------------------------------------------------------------
// Database Types — mirrors the Supabase "reports" table exactly
// ---------------------------------------------------------------------------

/** Status enum matching the Supabase `status` column */
export type ReportStatus = 'pending' | 'in-progress' | 'resolved'

/**
 * Row shape returned when reading from the `reports` table.
 * Every field matches a column in the existing schema.
 */
export interface ReportRow {
  id: string                // text, primary key
  type: string              // e.g. "SOS", "Harassment"
  description: string       // free-text description
  latitude: number          // float
  longitude: number         // float
  status: ReportStatus      // enum: pending | sent | resolved
  is_iot_trigger: boolean   // true when triggered from ESP32-CAM
  device_id: string         // identifier of the IoT device
  evidence: string[]        // text array — public URLs of uploaded images
  created_at: string        // timestamp (ISO string from Supabase)
}

/**
 * Shape for INSERT operations — omits server-generated fields.
 * `id` is generated client-side (UUID) before insert.
 * `created_at` is auto-set by Supabase default.
 */
export type ReportInsert = Omit<ReportRow, 'created_at'>

/**
 * Shape for UPDATE operations — all fields optional except id.
 */
export type ReportUpdate = Partial<Omit<ReportRow, 'id'>> & { id: string }
