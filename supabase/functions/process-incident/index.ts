// ---------------------------------------------------------------------------
// Supabase Edge Function: process-incident
// ---------------------------------------------------------------------------
// Triggered after an IoT device (ESP32-CAM) creates an incident report.
//
// Responsibilities:
//   1. Validate the incoming payload (report_id, device_id, image_url, location)
//   2. Update the report status from "pending" → "sent"
//   3. Modify the description to "Emergency detected via IoT device"
//   4. Simulate sending an alert via a webhook (fetch POST)
//
// Deploy: supabase functions deploy process-incident
// ---------------------------------------------------------------------------

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers — required for browser-based invocations
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Expected shape of the request body.
 */
interface ProcessIncidentPayload {
  report_id: string
  device_id: string
  image_url: string
  location: {
    latitude: number
    longitude: number
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // -----------------------------------------------------------------------
    // 1. Parse and validate the request body
    // -----------------------------------------------------------------------
    const body: ProcessIncidentPayload = await req.json()

    if (!body.report_id || !body.device_id || !body.image_url || !body.location) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: report_id, device_id, image_url, location',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { report_id, device_id, image_url, location } = body

    // -----------------------------------------------------------------------
    // 2. Create a Supabase client with the service role key
    // -----------------------------------------------------------------------
    // The service role key bypasses RLS — required for server-side mutations.
    // These env vars are automatically available in Edge Functions.
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // -----------------------------------------------------------------------
    // 3. Update the report: status → "in-progress", description updated
    // -----------------------------------------------------------------------
    const { data: updatedReport, error: updateError } = await supabase
      .from('reports')
      .update({
        status: 'in-progress',
        description: 'Emergency detected via IoT device',
      })
      .eq('id', report_id)
      .select()
      .single()

    if (updateError) {
      console.error('[process-incident] DB update failed:', updateError.message)
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to update report: ${updateError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // -----------------------------------------------------------------------
    // 4. Simulate sending an alert via webhook
    // -----------------------------------------------------------------------
    // Replace this URL with your actual alert endpoint (Twilio, Discord, etc.)
    const WEBHOOK_URL = 'https://discord.com/api/webhooks/1540268702098915398/eIVt2KvUInMlzpIZ532QSZQLjZfsQvuW6tPAonj6_nSxZmR8Ewcy1jTNrsXF4Kk_9GSG'

    let alertSent = false

    try {
      const webhookResponse = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_type: 'IOT_EMERGENCY',
          report_id,
          device_id,
          image_url,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            google_maps_link: `https://maps.google.com/?q=${location.latitude},${location.longitude}`,
          },
          timestamp: new Date().toISOString(),
          message: `🚨 Emergency SOS triggered from IoT device ${device_id}. Report: ${report_id}`,
        }),
      })

      alertSent = webhookResponse.ok
      console.log(
        `[process-incident] Webhook ${alertSent ? 'sent successfully' : 'failed'} — status: ${webhookResponse.status}`
      )
    } catch (webhookError) {
      // Webhook failure is non-fatal — the report is already updated
      console.error('[process-incident] Webhook dispatch failed:', webhookError)
      alertSent = false
    }

    // -----------------------------------------------------------------------
    // 5. Return success response
    // -----------------------------------------------------------------------
    return new Response(
      JSON.stringify({
        success: true,
        report_id,
        device_id,
        alert_sent: alertSent,
        updated_report: updatedReport,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    // Top-level catch for unexpected errors (bad JSON, etc.)
    console.error('[process-incident] Unhandled error:', err)
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
