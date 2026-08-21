import { supabase, type ReportInsert, type ReportRow } from './supabase'

// ---------------------------------------------------------------------------
// IoT Pipeline — Upload → Insert → Edge Function
// ---------------------------------------------------------------------------
// This module provides the complete pipeline for ESP32-CAM incident triggers:
//   1. Upload evidence image to Supabase Storage ("evidence" bucket)
//   2. Create a report row in the "reports" table
//   3. Invoke the "process-incident" Edge Function
// ---------------------------------------------------------------------------

/**
 * Result shape returned by the full pipeline orchestrator.
 */
export interface PipelineResult {
  reportId: string
  imageUrl: string
  edgeFunctionResponse: Record<string, unknown> | null
}

// ---------------------------------------------------------------------------
// 1. Upload Evidence Image
// ---------------------------------------------------------------------------

/**
 * Uploads an image file to the Supabase "evidence" storage bucket.
 *
 * File path format: `{deviceId}/{timestamp}_{random}.{ext}`
 * This prevents filename collisions and organizes files per device.
 *
 * @param file      - The image File or Blob to upload
 * @param deviceId  - Identifier of the IoT device (used as folder name)
 * @returns         - The public URL of the uploaded image
 * @throws          - If the upload fails or public URL cannot be retrieved
 */
export async function uploadEvidence(
  file: File | Blob,
  deviceId: string
): Promise<string> {
  // Generate a unique file path to avoid collisions
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const extension = file instanceof File ? file.name.split('.').pop() || 'jpg' : 'jpg'
  const filePath = `${deviceId}/${timestamp}_${randomSuffix}.${extension}`

  // Upload the file to the "evidence" bucket
  const { data, error } = await supabase.storage
    .from('evidence')
    .upload(filePath, file, {
      contentType: file.type || 'image/jpeg',
      upsert: false, // Don't overwrite — each upload is unique
    })

  if (error) {
    throw new Error(`[uploadEvidence] Storage upload failed: ${error.message}`)
  }

  // Retrieve the public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from('evidence')
    .getPublicUrl(data.path)

  if (!publicUrlData?.publicUrl) {
    throw new Error('[uploadEvidence] Could not retrieve public URL after upload.')
  }

  return publicUrlData.publicUrl
}

// ---------------------------------------------------------------------------
// 2. Create Report
// ---------------------------------------------------------------------------

/**
 * Parameters required to create a new IoT-triggered report.
 */
export interface CreateReportParams {
  imageUrl: string
  latitude: number
  longitude: number
  deviceId: string
}

/**
 * Inserts a new report row into the Supabase "reports" table.
 *
 * Uses the existing schema:
 *   - type = "SOS"
 *   - status = "pending"
 *   - is_iot_trigger = true
 *   - evidence = [imageUrl]
 *
 * @param params - Image URL, coordinates, and device identifier
 * @returns      - The inserted ReportRow
 * @throws       - If the database insert fails
 */
export async function createIoTReport(
  params: CreateReportParams
): Promise<ReportRow> {
  const { imageUrl, latitude, longitude, deviceId } = params

  // Build the report row matching the Supabase schema
  const report: ReportInsert = {
    id: crypto.randomUUID(),          // Generate a UUID for the text PK
    type: 'SOS',
    description: 'Emergency triggered from device',
    latitude,
    longitude,
    status: 'pending',
    is_iot_trigger: true,
    device_id: deviceId,
    evidence: [imageUrl],             // Store as text array with the public URL
  }

  const { data, error } = await supabase
    .from('reports')
    .insert(report)
    .select()       // Return the inserted row
    .single()       // We expect exactly one row back

  if (error) {
    throw new Error(`[createIoTReport] Insert failed: ${error.message}`)
  }

  return data as ReportRow
}

// ---------------------------------------------------------------------------
// 3. Trigger Full Pipeline (Orchestrator)
// ---------------------------------------------------------------------------

/**
 * Orchestrates the complete IoT incident pipeline:
 *   1. Uploads the evidence image to storage
 *   2. Creates a new report in the database
 *   3. Invokes the "process-incident" Edge Function
 *
 * Each step is sequential because later steps depend on earlier results.
 *
 * @param file      - Image captured by ESP32-CAM
 * @param deviceId  - Unique device identifier
 * @param latitude  - GPS latitude from the device
 * @param longitude - GPS longitude from the device
 * @returns         - PipelineResult with reportId, imageUrl, and edge response
 * @throws          - If any step in the pipeline fails
 */
export async function triggerIoTPipeline(
  file: File | Blob,
  deviceId: string,
  latitude: number,
  longitude: number
): Promise<PipelineResult> {
  // Step 1: Upload the evidence image to Supabase Storage
  const imageUrl = await uploadEvidence(file, deviceId)

  // Step 2: Insert a new report row into the database
  const report = await createIoTReport({ imageUrl, latitude, longitude, deviceId })

  // Step 3: Invoke the "process-incident" Edge Function
  let edgeFunctionResponse: Record<string, unknown> | null = null

  try {
    // Direct fetch to the deployed Edge Function URL
    // This pattern works from any context (browser, Node, ESP32 firmware)
    const edgeFnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-incident`

    const response = await fetch(edgeFnUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        report_id: report.id,
        device_id: deviceId,
        image_url: imageUrl,
        location: { latitude, longitude },
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error('[triggerIoTPipeline] Edge Function error:', errBody)
    } else {
      edgeFunctionResponse = await response.json()
    }
  } catch (err) {
    // Edge Function network failure — non-fatal
    console.error('[triggerIoTPipeline] Edge Function invocation failed:', err)
  }

  return {
    reportId: report.id,
    imageUrl,
    edgeFunctionResponse,
  }
}
