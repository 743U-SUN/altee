import { SampleSidebar } from "./components/SampleSidebar";
import { SampleMobileFooterNav } from "./components/SampleMobileFooterNav";
import SampleClientLayout from "./components/SampleClientLayout";

export default function SampleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SampleClientLayout
      sidebarWidth="360px"
      sidebar={<SampleSidebar />}
      mobileFooter={<SampleMobileFooterNav />}
    >
      {children}
    </SampleClientLayout>
  );
}
