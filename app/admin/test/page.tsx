'use client'

// ---------------------------------------------------------------------------
// Admin Pipeline Test Page
// ---------------------------------------------------------------------------
// Route: /admin/test
// Renders the PipelineTestPanel inside the admin DashboardLayout.
// ---------------------------------------------------------------------------

import DashboardLayout from '@/components/DashboardLayout'
import PipelineTestPanel from '@/components/PipelineTestPanel'

export default function AdminTestPage() {
  return (
    <DashboardLayout role="admin">
      <PipelineTestPanel />
    </DashboardLayout>
  )
}
