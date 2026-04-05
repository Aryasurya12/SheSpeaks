import DashboardLayout from "@/components/DashboardLayout";
import ProfilePanel from "@/components/ProfilePanel";

export default function UserProfile() {
  return (
    <DashboardLayout role="user">
       <ProfilePanel role="user" />
    </DashboardLayout>
  );
}
