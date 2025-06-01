export interface NavItem {
  id?: string;
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface HeaderLogo {
  icon?: React.ComponentType<{ className?: string }>;
  href: string;
  title?: string;
  subtitle?: string;
  className?: string;
  customElement?: React.ReactNode; // カスタムロゴ（Alteeロゴなど）
}

export interface SidebarConfig {
  sheetTitle: string;
  headerLogo: HeaderLogo;
  navItems: NavItem[];
}

export interface MobileFooterConfig {
  backgroundColor: string;
  navItems: NavItem[];
}

export interface LayoutConfig {
  sidebarWidth: string;
  backgroundColor?: string;
  breadcrumb: {
    baseHref: string;
    baseName: string;
  };
  getPageName: (pathname: string) => string;
  sidebar: SidebarConfig;
  mobileFooter: MobileFooterConfig;
}