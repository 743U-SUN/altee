"use client"

import { usePathname } from "next/navigation";
import { BaseClientLayout, BaseSidebarLayout, BaseMobileFooterNav } from "@/components/layouts";
import { articleLayoutConfig } from "../config/layoutConfig";
import { ArticleSidebar } from "./ArticleSidebar";

export default function ArticleClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <BaseClientLayout
      config={articleLayoutConfig}
      sidebar={<ArticleSidebar />}
      mobileFooter={<BaseMobileFooterNav config={articleLayoutConfig.mobileFooter} />}
      SidebarLayoutComponent={({ children }) => (
        <BaseSidebarLayout config={articleLayoutConfig.sidebar}>
          {children}
        </BaseSidebarLayout>
      )}
    >
      {children}
    </BaseClientLayout>
  );
}