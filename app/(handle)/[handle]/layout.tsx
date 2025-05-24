import { HandleSidebar } from "./components/HandleSidebar";
import { HandleMobileFooterNav } from "./components/HandleMobileFooterNav";
import  HandleClientLayout from "./components/HandleClientLayout";

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HandleClientLayout
      sidebarWidth="320px"
      sidebar={<HandleSidebar />}
      mobileFooter={<HandleMobileFooterNav />}
    >
      {children}
    </HandleClientLayout>
  );
}
