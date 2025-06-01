import { BookOpen, Book, GraduationCap, Utensils, Settings } from "lucide-react";
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
    if (pathname.includes("/blog")) return "ブログ";
    if (pathname.includes("/law")) return "法律";
    if (pathname.includes("/cooking")) return "料理";
    if (pathname.includes("/settings")) return "設定";
    return "Dashboard";
  },
  sidebar: {
    sheetTitle: "記事セクション",
    headerLogo: {
      icon: BookOpen,
      href: "/admin",
      title: "記事セクション",
      subtitle: "コンテンツ",
      className: "rounded-lg"
    },
    navItems: [
      { id: "article", title: "記事", url: "/admin/articles", icon: Book },
      { id: "devices", title: "デバイス", url: "/admin/devices", icon: Settings },
      { id: "attributes", title: "属性", url: "/admin/attributes", icon: Settings },
      { id: "links", title: "リンク", url: "/admin/links", icon: Settings },
      { id: "users", title: "ユーザー", url: "/admin/users", icon: Settings },
    ]
  },
  mobileFooter: {
    backgroundColor: "bg-amber-50",
    navItems: [
      { title: "ホーム", url: "/admin", icon: BookOpen },
      { title: "記事", url: "/admin/articles", icon: Book },
      { title: "デバイス", url: "/admin/devices", icon: Settings },
      { title: "属性", url: "/admin/attributes", icon: Settings },
      { title: "設定", url: "/admin/users", icon: Settings },
    ]
  }
};