"use client"

import { usePathname } from "next/navigation";
import { BaseClientLayout, BaseSidebarLayout, BaseMobileFooterNav } from "@/components/layouts";
import { deviceLayoutConfig } from "../config/layoutConfig";
import { DeviceSidebar } from "./DeviceSidebar";

export default function DeviceClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <BaseClientLayout
      config={deviceLayoutConfig}
      sidebar={<DeviceSidebar />}
      mobileFooter={<BaseMobileFooterNav config={deviceLayoutConfig.mobileFooter} />}
      SidebarLayoutComponent={({ children }) => (
        <BaseSidebarLayout config={deviceLayoutConfig.sidebar}>
          {children}
        </BaseSidebarLayout>
      )}
    >
      {children}
    </BaseClientLayout>
  );
}