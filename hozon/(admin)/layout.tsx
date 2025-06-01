import { AdminSidebar } from "./components/AdminSidebar";
import { AdminMobileFooterNav } from "./components/AdminMobileFooterNav";
import AdminClientLayout from "./components/AdminClientLayout";

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminClientLayout
      sidebarWidth="320px"
      sidebar={<AdminSidebar />}
      mobileFooter={<AdminMobileFooterNav />}
    >
      {children}
    </AdminClientLayout>
  );
}
