app/(admin)/layout.tsxとapp/(admin)/componentsの中身、app/(user)/layout.tsxとapp/(user)/componentsの中のファイルを見て欲しい。レイアウト的にはほとんど同じで、中身が微妙に違うだけになっていると思われる。

中身の一部、例えば
export default function AdminClientLayout({
  children,
  sidebarWidth = "360px",
  sidebar,
  mobileFooter,
}: {
  children: React.ReactNode;
  sidebarWidth?: string;
  sidebar?: React.ReactNode;
  mobileFooter?: React.ReactNode;
})

の  sidebarWidth = "360px",を変更したかったり、

// パスに基づいてページ名を取得
  const getPageName = () => {
    if (pathname.includes("/blog")) {
      return "ブログ"
    } else if (pathname.includes("/law")) {
      return "法律"
    } else if (pathname.includes("/cooking")) {
      return "料理"
    } else if (pathname.includes("/settings")) {
      return "設定"
    } else {
      return "Dashboard"
    }
  }

  この部分が違ったりするだけで、ほぼ同じ構成になっている。
  このような場合、1つのレイアウトにまとめたほうが良いのだろうか？

  コードを書いたりファイルを作ったりする必要はありません。アドバイスだけを求めています。