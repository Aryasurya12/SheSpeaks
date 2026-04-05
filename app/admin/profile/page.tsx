import DashboardLayout from "@/components/DashboardLayout";
import ProfilePanel from "@/components/ProfilePanel";

export default function AdminProfile() {
  return (
    <DashboardLayout role="admin">
       <ProfilePanel role="admin" />
    </DashboardLayout>
  );
}
