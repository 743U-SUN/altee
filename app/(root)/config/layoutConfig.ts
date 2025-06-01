import { Home, User, Settings, BookOpen, Monitor, Users, Link as LinkIcon } from "lucide-react";
import { LayoutConfig } from "@/components/layouts/types";

export const homeLayoutConfig: LayoutConfig = {
  sidebarWidth: "320px",
  backgroundColor: "var(--background)", // 白背景
  breadcrumb: {
    baseHref: "/",
    baseName: "ホーム"
  },
  getPageName: (pathname: string) => {
    if (pathname === "/") return "ダッシュボード";
    return "ホーム";
  },
  sidebar: {
    sheetTitle: "メインナビゲーション",
    headerLogo: {
      icon: Home,
      href: "/",
      title: "Altee",
      subtitle: "ホーム",
      className: "rounded-lg"
    },
    navItems: [
      { id: "admin", title: "管理者", url: "/admin", icon: Settings },
      { id: "user", title: "ユーザー", url: "/user", icon: User },
      { id: "article", title: "記事", url: "/article", icon: BookOpen },
      { id: "device", title: "デバイス", url: "/device", icon: Monitor },
      { id: "sample", title: "サンプル", url: "/sample", icon: LinkIcon },
    ]
  },
  mobileFooter: {
    backgroundColor: "bg-gray-50",
    navItems: [
      { title: "ホーム", url: "/", icon: Home },
      { title: "ユーザー", url: "/user", icon: User },
      { title: "記事", url: "/article", icon: BookOpen },
      { title: "デバイス", url: "/device", icon: Monitor },
      { title: "管理者", url: "/admin", icon: Settings },
    ]
  }
};