components/layouts/ClientLayout.tsx コレを見て欲しい。
次に、app/(main)/layout.tsxの中身を見て欲しい。そこではClientLayoutを使用していると思う。

今回は相談なのだけれど、(main)内にarticleディレクトリとsampleディレクトリがあると思う。templateディレクトリは今回無視してください。

articleディレクトリ内のコンテンツを表示するときは、article用のサイドバーのアイコンを表示させたいし、セカンドサイドバーの幅を変更したい。セカンドサイドバーの幅を決めているのはcomponents/layouts/ClientLayout.tsxの
    <SidebarProvider
      style={
        {
          "--sidebar-width": "360px",
          "--bg-color": "var(--sidebar)"
このあたりだと思う。

sampleディレクトリ内のコンテンツを表示するときは、sample用のサイドバーアイコンを表示したりをしたい場合、どのようなアプローチが最も良いだろうか。

1. 構造を理解する。
2. 実装方法を計画、解説する。

実際の実装はちょっと待ってください。