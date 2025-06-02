"use client"

import { usePathname } from "next/navigation";
import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BaseClientLayout, BaseSidebarLayout, BaseMobileFooterNav } from "@/components/layouts";
import { homeLayoutConfig } from "../config/layoutConfig";

// HomeSidebarを遅延ロード
const HomeSidebar = lazy(() => import("./HomeSidebar").then(module => ({ default: module.HomeSidebar })));

// HomeSidebarのスケルトンローダー
const HomeSidebarSkeleton = () => (
  <div className="p-4 space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  </div>
);

export default function HomeClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <BaseClientLayout
      config={homeLayoutConfig}
      sidebar={
        <Suspense fallback={<HomeSidebarSkeleton />}>
          <HomeSidebar />
        </Suspense>
      }
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