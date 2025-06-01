"use client"

import { usePathname } from "next/navigation";
import { BaseClientLayout, BaseSidebarLayout, BaseMobileFooterNav } from "@/components/layouts";
import { userLayoutConfig } from "../config/layoutConfig";
import { UserSidebar } from "./UserSidebar";

export default function UserClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <BaseClientLayout
      config={userLayoutConfig}
      sidebar={<UserSidebar />}
      mobileFooter={<BaseMobileFooterNav config={userLayoutConfig.mobileFooter} />}
      SidebarLayoutComponent={({ children }) => (
        <BaseSidebarLayout config={userLayoutConfig.sidebar}>
          {children}
        </BaseSidebarLayout>
      )}
    >
      {children}
    </BaseClientLayout>
  );
}