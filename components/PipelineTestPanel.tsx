'use client'

import { useState, useRef, useCallback } from 'react'
import { testFullPipeline, type TestLogEntry, type TestResult } from '@/lib/test-pipeline'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Terminal,
  Trash2,
  Radio,
  Zap,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Pipeline Test Panel
// ---------------------------------------------------------------------------
// Interactive test runner for the IoT pipeline. Shows real-time logs,
// pass/fail badges, and a debug checklist. Drop into any page.
// ---------------------------------------------------------------------------

/** Map log levels to visual styles */
const LEVEL_STYLES: Record<string, { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: 'text-blue-300', bg: 'bg-blue-400/10' },
  success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  warn: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
}

/** Map stages to short labels */
const STAGE_LABELS: Record<string, string> = {
  setup: 'SETUP',
  upload: 'UPLOAD',
  insert: 'INSERT',
  edge: 'EDGE FN',
  'verify-storage': 'VERIFY:STORAGE',
  'verify-db': 'VERIFY:DB',
  'verify-edge': 'VERIFY:EDGE',
  realtime: 'REALTIME',
  cleanup: 'CLEANUP',
  summary: 'SUMMARY',
}

export default function PipelineTestPanel() {
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<TestLogEntry[]>([])
  const [result, setResult] = useState<TestResult | null>(null)
  const logEndRef = useRef<HTMLDivElement>(null)

  /** Scroll to latest log entry */
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [])

  /** Run the full pipeline test */
  const handleRunTest = async () => {
    setIsRunning(true)
    setLogs([])
    setResult(null)

    try {
      const testResult = await testFullPipeline((entry) => {
        setLogs((prev) => [...prev, entry])
        scrollToBottom()
      })
      setResult(testResult)
    } catch (err) {
      const errorEntry: TestLogEntry = {
        timestamp: new Date().toISOString(),
        stage: 'summary',
        level: 'error',
        message: `Unhandled test error: ${err instanceof Error ? err.message : String(err)}`,
      }
      setLogs((prev) => [...prev, errorEntry])
    } finally {
      setIsRunning(false)
    }
  }

  /** Clear all logs */
  const handleClear = () => {
    setLogs([])
    setResult(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-primary/20 rounded-xl">
              <Terminal className="w-6 h-6 text-primary" />
            </div>
            Pipeline Test Suite
          </h1>
          <p className="text-sm text-foreground/50 mt-2 ml-14">
            End-to-end validation: Upload → Insert → Edge Function → Realtime
          </p>
        </div>

        <div className="flex items-center gap-3 ml-14 sm:ml-0">
          {/* Clear button */}
          {logs.length > 0 && !isRunning && (
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl text-xs font-bold tracking-wide
                         text-foreground/50 hover:text-foreground hover:bg-white/5 transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}

          {/* Run test button */}
          <button
            onClick={handleRunTest}
            disabled={isRunning}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-95
              ${isRunning
                ? 'bg-foreground/10 text-foreground/40 cursor-not-allowed'
                : 'btn-neon shadow-lg shadow-primary/20 hover:shadow-primary/40'
              }`}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Test IoT Pipeline
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result summary cards */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
          >
            {[
              { label: 'Storage Upload', pass: result.verifications.storageUpload },
              { label: 'Database Insert', pass: result.verifications.databaseInsert },
              { label: 'Edge Function', pass: result.verifications.edgeFunctionUpdate },
              { label: 'RT: INSERT', pass: result.verifications.realtimeInsert },
              { label: 'RT: UPDATE', pass: result.verifications.realtimeUpdate },
            ].map((v, i) => (
              <motion.div
                key={v.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`glass rounded-xl p-4 border transition-all ${
                  v.pass ? 'border-emerald-500/30' : 'border-red-500/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {v.pass ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    v.pass ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {v.pass ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-foreground/70">{v.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overall result banner */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass rounded-2xl p-5 flex items-center justify-between border ${
              result.success ? 'border-emerald-500/30' : 'border-amber-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              {result.success ? (
                <div className="p-2 bg-emerald-400/10 rounded-xl">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
              ) : (
                <div className="p-2 bg-amber-400/10 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
              )}
              <div>
                <p className={`font-bold text-sm ${result.success ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {result.success ? '🎉 All Checks Passed!' : '⚠️ Some Checks Failed'}
                </p>
                <p className="text-xs text-foreground/40 mt-0.5">
                  Completed in {(result.duration / 1000).toFixed(1)}s
                  {result.pipelineResult && ` • Report: ${result.pipelineResult.reportId}`}
                </p>
              </div>
            </div>
            {result.pipelineResult && (
              <a
                href={result.pipelineResult.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-primary/60 hover:text-primary uppercase tracking-wider transition-colors"
              >
                View Image ↗
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log output terminal */}
      <div className="glass-dark rounded-2xl overflow-hidden border border-border">
        {/* Terminal header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-white/[0.02]">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-amber-500/60" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
          </div>
          <span className="text-[10px] font-mono text-foreground/30 tracking-wider">
            pipeline-test-runner
          </span>
          {isRunning && (
            <div className="ml-auto flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400/70 tracking-wider">RUNNING</span>
            </div>
          )}
        </div>

        {/* Log entries */}
        <div className="max-h-[500px] overflow-y-auto p-4 space-y-1 font-mono text-xs">
          {logs.length === 0 && !isRunning && (
            <div className="flex flex-col items-center justify-center py-16 text-foreground/20">
              <Radio className="w-8 h-8 mb-3 opacity-30" />
              <p className="font-sans font-bold text-sm">No logs yet</p>
              <p className="font-sans text-xs mt-1 opacity-50">
                Click &quot;Test IoT Pipeline&quot; to begin
              </p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {logs.map((entry, i) => {
              const style = LEVEL_STYLES[entry.level] || LEVEL_STYLES.info
              const Icon = style.icon
              const stageLabel = STAGE_LABELS[entry.stage] || entry.stage.toUpperCase()

              return (
                <motion.div
                  key={`${entry.timestamp}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-start gap-2 py-1 hover:bg-white/[0.02] rounded-lg px-2 -mx-2 group"
                >
                  <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${style.color}`} />

                  {/* Stage badge */}
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider shrink-0 ${style.bg} ${style.color}`}
                  >
                    {stageLabel}
                  </span>

                  {/* Message */}
                  <span className="text-foreground/70 leading-relaxed break-all">
                    {entry.message}
                  </span>

                  {/* Timestamp on hover */}
                  <span className="ml-auto text-[9px] text-foreground/15 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Data payloads (shown as collapsible JSON) */}
          {logs.filter((l) => l.data).length > 0 && (
            <div className="pt-4 mt-4 border-t border-border">
              <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-wider mb-2">
                Payload Data
              </p>
              {logs
                .filter((l) => l.data)
                .map((l, i) => (
                  <details key={i} className="mb-2">
                    <summary className="text-[10px] text-foreground/40 cursor-pointer hover:text-foreground/60 transition-colors">
                      [{STAGE_LABELS[l.stage] || l.stage}] data payload
                    </summary>
                    <pre className="mt-1 p-3 bg-white/[0.02] rounded-lg text-[10px] text-foreground/50 overflow-x-auto">
                      {JSON.stringify(l.data, null, 2)}
                    </pre>
                  </details>
                ))}
            </div>
          )}

          <div ref={logEndRef} />
        </div>
      </div>

      {/* Debug checklist */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-bold text-sm tracking-tight mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-primary/60" />
          Debug Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs text-foreground/50">
          {[
            { check: 'Supabase URL & anon key set in .env.local', fix: 'Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY' },
            { check: '"evidence" bucket exists and is public', fix: 'Supabase Dashboard → Storage → Create bucket "evidence" (public)' },
            { check: '"reports" table exists with correct schema', fix: 'Verify columns: id, type, description, latitude, longitude, status, is_iot_trigger, device_id, evidence, created_at' },
            { check: 'RLS policies allow INSERT on reports', fix: 'Dashboard → Auth → Policies → Add policy for anon INSERT' },
            { check: 'Edge Function deployed', fix: 'Run: supabase functions deploy process-incident' },
            { check: 'Realtime enabled on reports table', fix: 'Dashboard → Database → Replication → Enable for "reports"' },
            { check: 'Storage upload policy allows anon uploads', fix: 'Dashboard → Storage → Policies → Allow INSERT for anon' },
            { check: 'Edge Function has SUPABASE_SERVICE_ROLE_KEY', fix: 'Auto-injected by Supabase for deployed functions' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 py-1.5">
              <span className="w-4 h-4 rounded border border-border shrink-0 mt-0.5" />
              <div>
                <p className="text-foreground/70 font-medium">{item.check}</p>
                <p className="text-[10px] text-foreground/30 mt-0.5">{item.fix}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
