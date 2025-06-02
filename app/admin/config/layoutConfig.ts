import { Book, User, MonitorSmartphone, BookOpen, LinkIcon, Settings, Shield, Image } from "lucide-react";
import { LayoutConfig } from "@/components/layouts/types";

export const adminLayoutConfig: LayoutConfig = {
  sidebarWidth: "320px",
  backgroundColor: "var(--admin-bg)",
  breadcrumb: {
    baseHref: "/admin",
    baseName: "Admin"
  },
  getPageName: (pathname: string) => {
    if (pathname.includes("/articles")) return "記事";
    if (pathname.includes("/devices")) return "デバイス";
    if (pathname.includes("/users")) return "ユーザー";
    if (pathname.includes("/attributes")) return "属性";
    if (pathname.includes("/links")) return "リンク";
    if (pathname.includes("/media")) return "メディア";
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
    backgroundColor: "bg-amber-50",
    navItems: [
      { title: "ホーム", url: "/admin", icon: Shield },
      { title: "記事", url: "/admin/articles", icon: Book },
      { title: "デバイス", url: "/admin/devices", icon: MonitorSmartphone },
      { title: "属性", url: "/admin/attributes", icon: Settings },
      { title: "メディア", url: "/admin/media", icon: Image },
      { title: "ユーザー", url: "/admin/users", icon: User },
    ]
  }
};