ありがとう。
同様にしてImageSidebarを作っていきたい。まず追加する場所はカルーセルの下に追加しよう。アコーディオンのタイトルは「サイドバーイメージ」としてください。

デザインも並べ替えなどもカルーセルと同様に。最大3枚まで登録可能とし、横幅は最大500px, 縦幅は最大1000pxとします。
今回はPrismaスキーマにまだ何も作っていないので、スキーマの追加が必要になります。

Userのリレーションのところに  
imageBanners        UserImageBanner[]
imageCarousels      UserImageCarousel[]
imageSidebar        UserImageSidebar[]　
のように追加して、carouselと同じように作ってもらえますか？

なにか質問があれば私に聞いてから実装してください。
なければ作業に取り掛かってください、