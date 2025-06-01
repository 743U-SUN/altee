import { User, Heart, Monitor, MonitorSmartphone, BookOpen, Link as LinkIcon, Settings, Video } from "lucide-react";
import { LayoutConfig } from "@/components/layouts/types";

export const userLayoutConfig: LayoutConfig = {
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
    return "Dashboard";
  },
  sidebar: {
    sheetTitle: "メインナビゲーション",
    headerLogo: {
      href: "/",
      title: "Altee",
      subtitle: "ホーム",
      className: "rounded-lg"
    },
    navItems: [
      { id: "user", title: "ユーザー", url: "/user", icon: User },
      { id: "device", title: "デバイス", url: "/device", icon: MonitorSmartphone },      
      { id: "article", title: "記事", url: "/article", icon: BookOpen },
      { id: "link", title: "リンク", url: "/sample", icon: LinkIcon },
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