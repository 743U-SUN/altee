import { UserSidebar } from "./components/UserSidebar";
import { UserMobileFooterNav } from "./components/UserMobileFooterNav";
import  UserClientLayout from "./components/UserClientLayout";

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserClientLayout
      sidebarWidth="320px"
      sidebar={<UserSidebar />}
      mobileFooter={<UserMobileFooterNav />}
    >
      {children}
    </UserClientLayout>
  );
}
