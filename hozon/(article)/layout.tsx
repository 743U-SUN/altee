import { ArticleSidebar } from "./components/ArticleSidebar";
import { ArticleMobileFooterNav } from "./components/ArticleMobileFooterNav";
import ArticleClientLayout from "./components/ArticleClientLayout";

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ArticleClientLayout
      sidebarWidth="480px"
      sidebar={<ArticleSidebar />}
      mobileFooter={<ArticleMobileFooterNav />}
    >
      {children}
    </ArticleClientLayout>
  );
}
