import DashboardLayout from "@/components/DashboardLayout";
import ProfilePanel from "@/components/ProfilePanel";

export default function PoliceProfile() {
  return (
    <DashboardLayout role="police">
       <ProfilePanel role="police" />
    </DashboardLayout>
  );
}
