"use client"

import { usePathname } from "next/navigation";
import { BaseClientLayout, BaseSidebarLayout, BaseMobileFooterNav } from "@/components/layouts";
import { homeLayoutConfig } from "../config/layoutConfig";
import { HomeSidebar } from "./HomeSidebar";

export default function HomeClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <BaseClientLayout
      config={homeLayoutConfig}
      sidebar={<HomeSidebar />}
      mobileFooter={<BaseMobileFooterNav config={homeLayoutConfig.mobileFooter} />}
      SidebarLayoutComponent={({ children }) => (
        <BaseSidebarLayout config={homeLayoutConfig.sidebar}>
          {children}
        </BaseSidebarLayout>
      )}
    >
      {children}
    </BaseClientLayout>
  );
}