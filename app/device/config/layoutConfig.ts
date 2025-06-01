import { Monitor, Keyboard, Mouse, Mic, Headphones, Camera, Star, Search } from "lucide-react";
import { LayoutConfig } from "@/components/layouts/types";

export const deviceLayoutConfig: LayoutConfig = {
  sidebarWidth: "320px",
  backgroundColor: "var(--device-bg)",
  breadcrumb: {
    baseHref: "/device",
    baseName: "デバイス"
  },
  getPageName: (pathname: string) => {
    if (pathname.includes("/keyboard")) return "キーボード";
    if (pathname.includes("/mouse")) return "マウス";
    if (pathname.includes("/microphone")) return "マイク";
    if (pathname.includes("/headphone")) return "ヘッドホン";
    if (pathname.includes("/camera")) return "カメラ";
    if (pathname.includes("/popular")) return "人気商品";
    return "デバイスカタログ";
  },
  sidebar: {
    sheetTitle: "デバイスカタログ",
    headerLogo: {
      icon: Monitor,
      href: "/device",
      title: "デバイスカタログ",
      subtitle: "配信機材",
      className: "rounded-lg"
    },
    navItems: [
      { id: "all", title: "すべて", url: "/device", icon: Monitor },
      { id: "keyboard", title: "キーボード", url: "/device/keyboard", icon: Keyboard },
      { id: "mouse", title: "マウス", url: "/device/mouse", icon: Mouse },
      { id: "microphone", title: "マイク", url: "/device/microphone", icon: Mic },
      { id: "headphone", title: "ヘッドホン", url: "/device/headphone", icon: Headphones },
      { id: "camera", title: "カメラ", url: "/device/camera", icon: Camera },
      { id: "popular", title: "人気商品", url: "/device/popular", icon: Star },
    ]
  },
  mobileFooter: {
    backgroundColor: "bg-blue-50",
    navItems: [
      { title: "ホーム", url: "/device", icon: Monitor },
      { title: "キーボード", url: "/device/keyboard", icon: Keyboard },
      { title: "マウス", url: "/device/mouse", icon: Mouse },
      { title: "マイク", url: "/device/microphone", icon: Mic },
      { title: "人気", url: "/device/popular", icon: Star },
    ]
  }
};