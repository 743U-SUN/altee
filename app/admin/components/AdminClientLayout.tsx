"use client"

import { usePathname } from "next/navigation";
import { BaseClientLayout, BaseSidebarLayout, BaseMobileFooterNav } from "@/components/layouts";
import { adminLayoutConfig } from "../config/layoutConfig";
import { AdminSidebar } from "./AdminSidebar";

export default function AdminClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <BaseClientLayout
      config={adminLayoutConfig}
      sidebar={<AdminSidebar />}
      mobileFooter={<BaseMobileFooterNav config={adminLayoutConfig.mobileFooter} />}
      SidebarLayoutComponent={({ children }) => (
        <BaseSidebarLayout config={adminLayoutConfig.sidebar}>
          {children}
        </BaseSidebarLayout>
      )}
    >
      {children}
    </BaseClientLayout>
  );
}