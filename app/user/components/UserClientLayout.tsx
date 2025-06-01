"use client"

import { usePathname } from "next/navigation";
import { BaseClientLayout, BaseSidebarLayout, BaseMobileFooterNav } from "@/components/layouts";
import { User, Heart, Monitor, Link as LinkIcon, Settings } from "lucide-react";
import { UserSidebar } from "./UserSidebar";

export default function UserClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const userLayoutConfig = {
    sidebarWidth: "320px",
    backgroundColor: "var(--user-bg)",
    breadcrumb: {
      baseHref: "/user",
      baseName: "User"
    },
    getPageName: (pathname: string) => {
      if (pathname.includes("/profile")) return "プロフィール";
      if (pathname.includes("/devices")) return "デバイス";
      if (pathname.includes("/favorites")) return "お気に入り";
      if (pathname.includes("/links")) return "リンク";
      if (pathname.includes("/info")) return "情報";
      if (pathname.includes("/youtube")) return "YouTube";
      if (pathname.includes("/account")) return "アカウント";
      if (pathname.includes("/settings")) return "設定";
      return "Dashboard";
    },
    sidebar: {
      sheetTitle: "ユーザーセクション",
      headerLogo: {
        href: "/user",
        customElement: <img src="/altee-logo.svg" alt="Altee Logo" className="size-6" />
      },
      navItems: [
        { id: "profile", title: "プロフィール", url: "/user/profile", icon: User },
        { id: "devices", title: "デバイス", url: "/user/devices", icon: Monitor },
        { id: "favorites", title: "お気に入り", url: "/user/favorites", icon: Heart },
        { id: "links", title: "リンク", url: "/user/links", icon: LinkIcon },
        { id: "info", title: "情報", url: "/user/info", icon: Settings },
        { id: "youtube", title: "YouTube", url: "/user/youtube", icon: Settings },
      ]
    },
    mobileFooter: {
      backgroundColor: "bg-slate-50",
      navItems: [
        { title: "ホーム", url: "/user", icon: User },
        { title: "プロフィール", url: "/user/profile", icon: User },
        { title: "デバイス", url: "/user/devices", icon: Monitor },
        { title: "リンク", url: "/user/links", icon: LinkIcon },
        { title: "設定", url: "/user/account", icon: Settings },
      ]
    }
  };

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