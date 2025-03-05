export type SiteConfig = {
    name: string
    description: string
    url: string
    ogImage: string
    links: {
      twitter: string
      github: string
    }
    author: {
      name: string
      url: string
    }
  }
  
  export const siteConfig: SiteConfig = {
    name: "My Blog",
    description: "A modern blog built with Next.js, Tailwind CSS, and Prisma",
    url: "https://example.com",
    ogImage: "https://example.com/og.jpg",
    links: {
      twitter: "https://twitter.com/example",
      github: "https://github.com/example/blog",
    },
    author: {
      name: "Your Name",
      url: "https://example.com",
    },
  }
  
  // ナビゲーションメニュー定義
  export type NavItem = {
    title: string
    href: string
    disabled?: boolean
  }
  
  export type MainNavItem = NavItem
  
  export type SidebarNavItem = {
    title: string
    disabled?: boolean
    external?: boolean
    icon?: string
  } & (
    | {
        href: string
        items?: never
      }
    | {
        href?: string
        items: NavItem[]
      }
  )
  
  export type DocsConfig = {
    mainNav: MainNavItem[]
    sidebarNav: SidebarNavItem[]
  }
  
  export const docsConfig: DocsConfig = {
    mainNav: [
      {
        title: "ホーム",
        href: "/",
      },
      {
        title: "記事一覧",
        href: "/posts",
      },
      {
        title: "カテゴリー",
        href: "/categories",
      },
      {
        title: "タグ",
        href: "/tags",
      },
      {
        title: "About",
        href: "/about",
      },
    ],
    sidebarNav: [
      {
        title: "はじめに",
        items: [
          {
            title: "このブログについて",
            href: "/about",
          },
        ],
      },
      {
        title: "カテゴリー",
        items: [
          {
            title: "すべてのカテゴリー",
            href: "/categories",
          },
        ],
      },
    ],
  }