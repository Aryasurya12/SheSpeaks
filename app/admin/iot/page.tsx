'use client'

// ---------------------------------------------------------------------------
// Admin IoT Dashboard Page
// ---------------------------------------------------------------------------
// Route: /admin/iot
// Renders the IoT incident feed inside the shared admin DashboardLayout.
// ---------------------------------------------------------------------------

import DashboardLayout from '@/components/DashboardLayout'
import IoTDashboard from '@/components/IoTDashboard'

export default function AdminIoTPage() {
  return (
    <DashboardLayout role="admin">
      <IoTDashboard />
    </DashboardLayout>
  )
}
