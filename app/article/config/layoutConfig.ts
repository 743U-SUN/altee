import { BookOpen, Book, GraduationCap, Utensils, Settings } from "lucide-react";
import { LayoutConfig } from "@/components/layouts/types";

export const articleLayoutConfig: LayoutConfig = {
  sidebarWidth: "480px",
  backgroundColor: "var(--article-bg)",
  breadcrumb: {
    baseHref: "/article",
    baseName: "記事"
  },
  getPageName: (pathname: string) => {
    if (pathname.includes("/blog")) return "ブログ";
    if (pathname.includes("/law")) return "法律";
    if (pathname.includes("/cooking")) return "料理";
    if (pathname.includes("/settings")) return "設定";
    return "記事";
  },
  sidebar: {
    sheetTitle: "記事セクション",
    headerLogo: {
      icon: BookOpen,
      href: "/article",
      title: "記事セクション",
      subtitle: "コンテンツ",
      className: "rounded-lg"
    },
    navItems: [
      { id: "blog", title: "ブログ", url: "/blog", icon: Book },
      { id: "law", title: "法律", url: "/law", icon: GraduationCap },
      { id: "cooking", title: "料理", url: "/cooking", icon: Utensils },
      { id: "settings", title: "記事設定", url: "/article/settings", icon: Settings },
    ]
  },
  mobileFooter: {
    backgroundColor: "bg-amber-50",
    navItems: [
      { title: "記事ホーム", url: "/article", icon: BookOpen },
      { title: "ブログ", url: "/blog", icon: Book },
      { title: "法律", url: "/law", icon: GraduationCap },
      { title: "料理", url: "/cooking", icon: Utensils },
      { title: "設定", url: "/article/settings", icon: Settings },
    ]
  }
};