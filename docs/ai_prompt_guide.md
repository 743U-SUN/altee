shadcn/uiとTailwindCSSv4を使っています。

今回はapp/(handle)/[handle]/page.tsxのapp/(handle)/[handle]/components/secondary.tsxの中身を作っていく計画を立てていく。

まず、secondaryに表示するものとしては
1. 名前を表示する(secondaryName.tsx)
2. ひとことメッセージを表示する(secondaryDiscription.tsx)
3. 一問一答を表示する(secondaryQuestions.tsx)
4. SNSLink集(secondaryLinks.tsx)
5. Youtube動画(secondaryYoutube.tsx)

まずはsecondary.tsxにそれぞれのコンポーネントを表示するためのレイアウトを考えていく。secondary.tsxにの中にカードを作り、その中に1,2,3を入れる。

1.2.3は、同じカード内に表示したい。上からName, discription, question.

Name: 横長のカード内にの上にSubName, 下にCharacterName を配置。

discription: カード内に自己紹介文を入れる。

question: 左に質問,右に答えのまとまりを親のコンテナが768px以上の場合は2列で表示して、親のコンテナが768pxより小さくなったら1列になるようにする。コンテナクエリを利用して作ってみよう。

1.2.3のまとまりの下にSNSLink集を配置。
SNSリンク集は大きなカードに入れるのではなく、それぞれを横長のカードとして表示。
それぞれのカードは左にSNSIcon,右に二行でSNSTitle, SNSDescriptionを配置。カードはそれぞれLinkを貼り押せるようにする。
親コンテナが768px以上なら3列にし、768px以下なら2列にし、600px以下なら1列にしようと考えている。

SNSLink集の下にはYoutubeの動画を配置。
Youtubeの動画も大きなカードに入れるのではなく、それぞれのカードを並べる形にする。
上にサムネイル、下にタイトルというシンプルなもの。親コンテナが1024px以上なら4列768px以上なら3列,768pxより小さければ2列にする。一番下にもっと見るボタンを配置し、それぞれのユーザーのvideosページに飛ぶようにする。

使うデータはPrismaSchemaを参照する。
画像を扱う場合はdocs/image-handling-guide.mdを参照する。

Prismaで関係ありそうなモデル
・User
・UserLink
・UserYoutubeSettings

