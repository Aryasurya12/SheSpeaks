'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, type ReportRow } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Radio,
  MapPin,
  Clock,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle,
  Send,
  RefreshCw,
  Wifi,
  ShieldAlert,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// IoT Dashboard Component
// ---------------------------------------------------------------------------
// Displays real-time incident reports from Supabase with live subscriptions.
// Matches the existing SheSpeaks dark-purple neon design system.
// ---------------------------------------------------------------------------

/** Color mapping for report status badges */
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending: {
    label: 'Pending',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/30',
    icon: Clock,
  },
  sent: {
    label: 'Alert Sent',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/30',
    icon: Send,
  },
  resolved: {
    label: 'Resolved',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/30',
    icon: CheckCircle,
  },
}

/** Skeleton loader for individual cards */
function CardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-white/10 rounded-lg w-3/4" />
        <div className="h-3 bg-white/5 rounded-lg w-1/2" />
        <div className="h-3 bg-white/5 rounded-lg w-2/3" />
      </div>
    </div>
  )
}

/** Format a timestamp into a human-readable string */
function formatTimestamp(ts: string): string {
  const date = new Date(ts)
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export default function IoTDashboard() {
  const [reports, setReports] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)

  // -------------------------------------------------------------------------
  // Fetch all reports from Supabase on mount
  // -------------------------------------------------------------------------
  const fetchReports = useCallback(async () => {
    try {
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setReports((data as ReportRow[]) || [])
    } catch (err) {
      console.error('[IoTDashboard] Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }, [])

  // -------------------------------------------------------------------------
  // Real-time subscription — listens for INSERT, UPDATE, DELETE
  // -------------------------------------------------------------------------
  useEffect(() => {
    // Initial fetch
    fetchReports()

    // Subscribe to real-time changes on the "reports" table
    const channel = supabase
      .channel('reports-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reports',
        },
        (payload) => {
          // Add new report to the top of the list
          const newReport = payload.new as ReportRow
          setReports((prev) => [newReport, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reports',
        },
        (payload) => {
          // Replace the updated report in-place
          const updated = payload.new as ReportRow
          setReports((prev) =>
            prev.map((r) => (r.id === updated.id ? updated : r))
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'reports',
        },
        (payload) => {
          // Remove the deleted report
          const deletedId = (payload.old as { id: string }).id
          setReports((prev) => prev.filter((r) => r.id !== deletedId))
        }
      )
      .subscribe((status) => {
        // Track subscription status for the live indicator
        setIsLive(status === 'SUBSCRIBED')
      })

    // Cleanup: unsubscribe on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchReports])

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-primary/20 rounded-xl">
              <Radio className="w-6 h-6 text-primary" />
            </div>
            IoT Incident Feed
          </h1>
          <p className="text-sm text-foreground/50 mt-2 ml-14">
            Real-time reports from ESP32-CAM devices
          </p>
        </div>

        <div className="flex items-center gap-3 ml-14 sm:ml-0">
          {/* Live indicator */}
          <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl text-xs font-bold tracking-wide">
            <span
              className={`w-2 h-2 rounded-full ${
                isLive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
              }`}
            />
            <Wifi className={`w-3.5 h-3.5 ${isLive ? 'text-emerald-400' : 'text-red-400'}`} />
            {isLive ? 'LIVE' : 'OFFLINE'}
          </div>

          {/* Refresh button */}
          <button
            onClick={() => {
              setLoading(true)
              fetchReports()
            }}
            className="p-2.5 glass rounded-xl hover:bg-white/5 transition-all active:scale-95"
            title="Refresh reports"
          >
            <RefreshCw className={`w-4 h-4 text-foreground/50 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border-red-500/30 rounded-2xl p-5 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-400">Connection Error</p>
            <p className="text-xs text-foreground/50 mt-0.5">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && reports.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-16 flex flex-col items-center justify-center text-center"
        >
          <div className="p-4 bg-primary/10 rounded-2xl mb-4">
            <ShieldAlert className="w-10 h-10 text-primary/50" />
          </div>
          <h3 className="font-bold text-lg tracking-tight">No Incidents Detected</h3>
          <p className="text-sm text-foreground/40 mt-2 max-w-sm">
            Reports from IoT devices will appear here in real-time when incidents are triggered.
          </p>
        </motion.div>
      )}

      {/* Report cards grid */}
      {!loading && reports.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {reports.map((report, index) => {
              const statusCfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending
              const StatusIcon = statusCfg.icon
              const imageUrl = report.evidence?.[0] || null

              return (
                <motion.div
                  key={report.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                  className="glass rounded-2xl overflow-hidden group hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,51,234,0.15)]"
                >
                  {/* Evidence image */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`Evidence for ${report.id}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-foreground/10" />
                      </div>
                    )}

                    {/* Status badge overlay */}
                    <div className="absolute top-3 right-3">
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md text-[11px] font-bold tracking-wide uppercase ${statusCfg.bg} ${statusCfg.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </div>
                    </div>

                    {/* IoT badge */}
                    {report.is_iot_trigger && (
                      <div className="absolute top-3 left-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 backdrop-blur-md text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                          <Radio className="w-3 h-3" />
                          IoT
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-5 space-y-4">
                    {/* Report type & ID */}
                    <div>
                      <h3 className="font-bold text-sm tracking-tight">{report.type}</h3>
                      <p className="text-[11px] text-foreground/30 font-mono mt-0.5">{report.id}</p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-foreground/60 leading-relaxed line-clamp-2">
                      {report.description}
                    </p>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-xs text-foreground/40">
                      <MapPin className="w-3.5 h-3.5 text-secondary/60 shrink-0" />
                      <span className="truncate">
                        {report.latitude.toFixed(4)}°, {report.longitude.toFixed(4)}°
                      </span>
                      <a
                        href={`https://maps.google.com/?q=${report.latitude},${report.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-primary/60 hover:text-primary text-[10px] font-bold uppercase tracking-wider transition-colors"
                      >
                        Map ↗
                      </a>
                    </div>

                    {/* Device ID + Timestamp */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      {report.device_id && (
                        <div className="flex items-center gap-1.5 text-[10px] text-foreground/30 font-mono">
                          <Wifi className="w-3 h-3" />
                          {report.device_id}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-[10px] text-foreground/30">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(report.created_at)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Report count footer */}
      {!loading && reports.length > 0 && (
        <div className="text-center text-[11px] text-foreground/20 font-bold uppercase tracking-[0.2em] pt-4">
          {reports.length} incident{reports.length !== 1 ? 's' : ''} total
        </div>
      )}
    </div>
  )
}
