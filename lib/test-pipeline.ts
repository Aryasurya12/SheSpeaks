import { supabase, type ReportRow } from './supabase'
import { triggerIoTPipeline, type PipelineResult } from './iot-pipeline'

// ---------------------------------------------------------------------------
// End-to-End Pipeline Test Suite
// ---------------------------------------------------------------------------
// Provides testFullPipeline() — a comprehensive validation of the entire
// IoT incident flow: upload → insert → Edge Function → realtime.
//
// Usage:
//   import { testFullPipeline } from '@/lib/test-pipeline'
//   const result = await testFullPipeline(onLog)
// ---------------------------------------------------------------------------

/** Identifies which stage of the pipeline a log entry belongs to */
export type PipelineStage =
  | 'setup'
  | 'upload'
  | 'insert'
  | 'edge'
  | 'verify-storage'
  | 'verify-db'
  | 'verify-edge'
  | 'realtime'
  | 'cleanup'
  | 'summary'

/** A single log entry emitted during the test run */
export interface TestLogEntry {
  timestamp: string
  stage: PipelineStage
  level: 'info' | 'success' | 'warn' | 'error'
  message: string
  data?: unknown
}

/** Final result of the test run */
export interface TestResult {
  success: boolean
  logs: TestLogEntry[]
  pipelineResult: PipelineResult | null
  verifications: {
    storageUpload: boolean
    databaseInsert: boolean
    edgeFunctionUpdate: boolean
    realtimeInsert: boolean
    realtimeUpdate: boolean
  }
  duration: number
}

/** Callback for streaming logs to the UI */
export type LogCallback = (entry: TestLogEntry) => void

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a timestamped log entry */
function createLog(
  stage: PipelineStage,
  level: TestLogEntry['level'],
  message: string,
  data?: unknown
): TestLogEntry {
  return {
    timestamp: new Date().toISOString(),
    stage,
    level,
    message,
    data,
  }
}

/**
 * Generate a tiny 1x1 red PNG as a dummy evidence image.
 * This avoids needing a real camera — just enough bytes to test the pipeline.
 */
function createDummyImage(): File {
  // Minimal valid 1x1 red PNG (68 bytes)
  const pngBytes = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc,
    0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, // IEND chunk
    0x44, 0xae, 0x42, 0x60, 0x82,
  ])

  return new File([pngBytes], 'test_evidence.png', { type: 'image/png' })
}

// ---------------------------------------------------------------------------
// 1. MAIN TEST FUNCTION
// ---------------------------------------------------------------------------

/**
 * Runs the complete end-to-end pipeline test.
 *
 * Steps:
 *   1. Setup: Create dummy image + test device ID
 *   2. Execute: Call triggerIoTPipeline() — uploads, inserts, calls Edge Fn
 *   3. Verify Storage: Confirm file exists in "evidence" bucket
 *   4. Verify Database: Fetch the report, validate fields
 *   5. Verify Edge Function: Check if status was updated to "sent"
 *   6. Realtime: Subscribe and wait for INSERT + UPDATE events
 *
 * @param onLog - Optional callback for streaming logs to UI in real-time
 * @returns     - TestResult with pass/fail, logs, and verification results
 */
export async function testFullPipeline(onLog?: LogCallback): Promise<TestResult> {
  const startTime = Date.now()
  const logs: TestLogEntry[] = []

  // Verification tracker
  const verifications = {
    storageUpload: false,
    databaseInsert: false,
    edgeFunctionUpdate: false,
    realtimeInsert: false,
    realtimeUpdate: false,
  }

  let pipelineResult: PipelineResult | null = null

  /** Emit a log entry to both the logs array and the callback */
  const log = (stage: PipelineStage, level: TestLogEntry['level'], message: string, data?: unknown) => {
    const entry = createLog(stage, level, message, data)
    logs.push(entry)
    onLog?.(entry)
    // Also output to browser console with color coding
    const prefix = `[${stage.toUpperCase()}]`
    if (level === 'error') console.error(`❌ ${prefix} ${message}`, data ?? '')
    else if (level === 'warn') console.warn(`⚠️ ${prefix} ${message}`, data ?? '')
    else if (level === 'success') console.log(`✅ ${prefix} ${message}`, data ?? '')
    else console.log(`ℹ️ ${prefix} ${message}`, data ?? '')
  }

  // =========================================================================
  // STEP 1: Setup
  // =========================================================================
  const TEST_DEVICE_ID = `TEST-ESP32-${Date.now().toString(36).toUpperCase()}`
  const TEST_LAT = 19.0760   // Mumbai
  const TEST_LNG = 72.8777

  log('setup', 'info', '━━━ SheSpeaks IoT Pipeline — End-to-End Test ━━━')
  log('setup', 'info', `Device ID: ${TEST_DEVICE_ID}`)
  log('setup', 'info', `Location: ${TEST_LAT}, ${TEST_LNG} (Mumbai)`)

  const dummyFile = createDummyImage()
  log('setup', 'success', `Dummy image created: ${dummyFile.name} (${dummyFile.size} bytes)`)

  // =========================================================================
  // STEP 2: Setup Realtime Subscription (before pipeline runs)
  // =========================================================================
  log('realtime', 'info', 'Subscribing to reports table for realtime events...')

  // We use a Promise that resolves once we get both INSERT + UPDATE
  let resolveRealtimeInsert: () => void
  let resolveRealtimeUpdate: () => void

  const realtimeInsertPromise = new Promise<void>((resolve) => {
    resolveRealtimeInsert = resolve
  })
  const realtimeUpdatePromise = new Promise<void>((resolve) => {
    resolveRealtimeUpdate = resolve
  })

  const channel = supabase
    .channel(`test-pipeline-${TEST_DEVICE_ID}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'reports' },
      (payload) => {
        const row = payload.new as ReportRow
        // Only react to our test device's report
        if (row.device_id === TEST_DEVICE_ID) {
          log('realtime', 'success', 'INSERT event received!', {
            id: row.id,
            type: row.type,
            status: row.status,
            device_id: row.device_id,
          })
          verifications.realtimeInsert = true
          resolveRealtimeInsert()
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'reports' },
      (payload) => {
        const row = payload.new as ReportRow
        if (row.device_id === TEST_DEVICE_ID) {
          log('realtime', 'success', 'UPDATE event received!', {
            id: row.id,
            status: row.status,
            description: row.description,
          })
          verifications.realtimeUpdate = true
          resolveRealtimeUpdate()
        }
      }
    )
    .subscribe((status) => {
      log('realtime', status === 'SUBSCRIBED' ? 'success' : 'warn', `Channel status: ${status}`)
    })

  // Small delay to ensure the subscription is active before we trigger
  await new Promise((r) => setTimeout(r, 1500))

  // =========================================================================
  // STEP 3: Run the Pipeline
  // =========================================================================
  log('upload', 'info', 'Triggering full pipeline: upload → insert → edge function...')

  try {
    pipelineResult = await triggerIoTPipeline(dummyFile, TEST_DEVICE_ID, TEST_LAT, TEST_LNG)

    log('upload', 'success', `Image uploaded: ${pipelineResult.imageUrl}`)
    log('insert', 'success', `Report created: ${pipelineResult.reportId}`)

    if (pipelineResult.edgeFunctionResponse) {
      log('edge', 'success', 'Edge Function responded', pipelineResult.edgeFunctionResponse)
    } else {
      log('edge', 'warn', 'Edge Function returned no response (may still be processing)')
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)

    // Identify which stage failed based on the error message prefix
    if (errorMessage.includes('[uploadEvidence]')) {
      log('upload', 'error', `Upload failed: ${errorMessage}`)
    } else if (errorMessage.includes('[createIoTReport]')) {
      log('insert', 'error', `Database insert failed: ${errorMessage}`)
    } else {
      log('edge', 'error', `Pipeline failed: ${errorMessage}`)
    }

    // Cleanup and return early
    supabase.removeChannel(channel)
    return {
      success: false,
      logs,
      pipelineResult: null,
      verifications,
      duration: Date.now() - startTime,
    }
  }

  // =========================================================================
  // STEP 4A: Verify Storage Upload
  // =========================================================================
  log('verify-storage', 'info', 'Verifying file exists in evidence bucket...')

  try {
    // Extract the file path from the public URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/evidence/{path}
    const urlParts = pipelineResult.imageUrl.split('/evidence/')
    const storagePath = urlParts[1]

    if (storagePath) {
      // List files in the device folder to confirm our file exists
      const folder = storagePath.split('/')[0] // device ID folder
      const { data: files, error: listError } = await supabase.storage
        .from('evidence')
        .list(folder)

      if (listError) {
        log('verify-storage', 'error', `Storage list failed: ${listError.message}`)
      } else {
        const fileName = storagePath.split('/').pop()
        const found = files?.some((f) => f.name === fileName)

        if (found) {
          verifications.storageUpload = true
          log('verify-storage', 'success', `File confirmed in storage: ${storagePath}`)
        } else {
          log('verify-storage', 'error', `File NOT found in storage: ${storagePath}`, {
            filesInFolder: files?.map((f) => f.name),
          })
        }
      }
    } else {
      log('verify-storage', 'error', 'Could not parse storage path from image URL')
    }
  } catch (err) {
    log('verify-storage', 'error', `Storage verification failed: ${err}`)
  }

  // =========================================================================
  // STEP 4B: Verify Database Insert
  // =========================================================================
  log('verify-db', 'info', `Fetching report ${pipelineResult.reportId} from database...`)

  try {
    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', pipelineResult.reportId)
      .single()

    if (fetchError) {
      log('verify-db', 'error', `Fetch failed: ${fetchError.message}`)
    } else if (report) {
      const row = report as ReportRow

      // Validate required fields
      const checks = [
        { field: 'id', pass: !!row.id, value: row.id },
        { field: 'type', pass: row.type === 'SOS', value: row.type },
        { field: 'evidence[0]', pass: !!row.evidence?.[0], value: row.evidence?.[0]?.substring(0, 60) + '...' },
        { field: 'is_iot_trigger', pass: row.is_iot_trigger === true, value: row.is_iot_trigger },
        { field: 'device_id', pass: row.device_id === TEST_DEVICE_ID, value: row.device_id },
        { field: 'status', pass: ['pending', 'in-progress', 'sent'].includes(row.status), value: row.status },
        { field: 'latitude', pass: row.latitude === TEST_LAT, value: row.latitude },
        { field: 'longitude', pass: row.longitude === TEST_LNG, value: row.longitude },
      ]

      const allPassed = checks.every((c) => c.pass)
      verifications.databaseInsert = allPassed

      checks.forEach((c) => {
        log('verify-db', c.pass ? 'success' : 'error', `  ${c.pass ? '✓' : '✗'} ${c.field} = ${c.value}`)
      })

      if (allPassed) {
        log('verify-db', 'success', 'All database fields validated correctly')
      } else {
        log('verify-db', 'error', 'Some database field checks failed')
      }
    }
  } catch (err) {
    log('verify-db', 'error', `Database verification failed: ${err}`)
  }

  // =========================================================================
  // STEP 4C: Verify Edge Function (status update)
  // =========================================================================
  log('verify-edge', 'info', 'Waiting 3s for Edge Function to process, then checking status...')

  await new Promise((r) => setTimeout(r, 3000))

  try {
    const { data: updatedReport, error: refetchError } = await supabase
      .from('reports')
      .select('status, description')
      .eq('id', pipelineResult.reportId)
      .single()

    if (refetchError) {
      log('verify-edge', 'error', `Refetch failed: ${refetchError.message}`)
    } else if (updatedReport) {
      const statusOk = ['in-progress', 'sent'].includes(updatedReport.status)
      const descOk = updatedReport.description === 'Emergency detected via IoT device'

      verifications.edgeFunctionUpdate = statusOk

      log('verify-edge', statusOk ? 'success' : 'error',
        `  Status: "${updatedReport.status}" ${statusOk ? '(expected "in-progress" ✓)' : '(expected "in-progress" ✗)'}`)
      log('verify-edge', descOk ? 'success' : 'warn',
        `  Description: "${updatedReport.description}" ${descOk ? '✓' : '(not updated yet)'}`)

      if (statusOk) {
        log('verify-edge', 'success', 'Edge Function successfully processed the report')
      }
    }
  } catch (err) {
    log('verify-edge', 'error', `Edge Function verification failed: ${err}`)
  }

  // =========================================================================
  // STEP 5: Wait for Realtime Events (with timeout)
  // =========================================================================
  log('realtime', 'info', 'Waiting up to 10s for remaining realtime events...')

  const REALTIME_TIMEOUT = 10_000

  await Promise.allSettled([
    Promise.race([realtimeInsertPromise, new Promise((r) => setTimeout(r, REALTIME_TIMEOUT))]),
    Promise.race([realtimeUpdatePromise, new Promise((r) => setTimeout(r, REALTIME_TIMEOUT))]),
  ])

  if (!verifications.realtimeInsert) {
    log('realtime', 'warn', 'INSERT event not received within timeout (is Realtime enabled on the reports table?)')
  }
  if (!verifications.realtimeUpdate) {
    log('realtime', 'warn', 'UPDATE event not received within timeout (Edge Function may not have updated yet)')
  }

  // Cleanup subscription
  supabase.removeChannel(channel)
  log('cleanup', 'info', 'Realtime channel unsubscribed')

  // =========================================================================
  // STEP 6: Summary
  // =========================================================================
  const duration = Date.now() - startTime
  const allPassed = Object.values(verifications).every(Boolean)

  log('summary', 'info', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  log('summary', allPassed ? 'success' : 'warn', allPassed ? '🎉 ALL CHECKS PASSED' : '⚠️ SOME CHECKS FAILED')
  log('summary', 'info', `Duration: ${(duration / 1000).toFixed(1)}s`)
  log('summary', verifications.storageUpload ? 'success' : 'error',
    `  Storage Upload:      ${verifications.storageUpload ? 'PASS ✅' : 'FAIL ❌'}`)
  log('summary', verifications.databaseInsert ? 'success' : 'error',
    `  Database Insert:     ${verifications.databaseInsert ? 'PASS ✅' : 'FAIL ❌'}`)
  log('summary', verifications.edgeFunctionUpdate ? 'success' : 'error',
    `  Edge Fn Update:      ${verifications.edgeFunctionUpdate ? 'PASS ✅' : 'FAIL ❌'}`)
  log('summary', verifications.realtimeInsert ? 'success' : 'error',
    `  Realtime INSERT:     ${verifications.realtimeInsert ? 'PASS ✅' : 'FAIL ❌'}`)
  log('summary', verifications.realtimeUpdate ? 'success' : 'error',
    `  Realtime UPDATE:     ${verifications.realtimeUpdate ? 'PASS ✅' : 'FAIL ❌'}`)
  log('summary', 'info', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  return {
    success: allPassed,
    logs,
    pipelineResult,
    verifications,
    duration,
  }
}
