今回はapp/(handle)/[handle]/components/primary.tsxの作成の準備をしていく。
このコンポーネントは、app/(handle)/[handle]/page.tsxで表示するコンポーネントで、ユーザー個別ページのトップに表示される予定のコンポーネントです。

まずはどのような要素を配置するかを考えていく。
・左上にバナーのカルーセル（Prisma:UserImageBanner）
・中央にUserの画像を表示。2枚以上の画像が登録されている場合は、画像の横にボタンで画像切り替えできるように。(Prisma:UserImageCarousel)カルーセルの予定だったけど、ボタン切り替えにしよう。1つの場合はボタン表示無しで。

とりあえず今のところこんなもんかな。

この場合、primaryBanner.tsxとprimaryImages.tsxというコンポーネントを作って読み込めばいいかな？コンポーネントはapp/(handle)/[handle]/componentsに置く感じで。

どうかな？ここまでの計画の感想を聞かせて。勝手に実装とかはまだしないでね。