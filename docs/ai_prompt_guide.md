今回はウェブサイトに登録ユーザーが自分が使用しているデバイスの登録をし、公開できるような仕組みを実装してもらったのでdocs/device-manager-guide.mdを読み、現状の理解に努めてください。
現在はPhase1からPhase9まで終了し、10に行く前にテストをしていきます。

localhost:3000/admin/devicesにアクセスして、商品を追加しようとしたところ、AddProductDialog.tsx:117 Error: PA-API request failed: 404
    at fetchProductFromPAAPI (pa-api.ts:164:13)
    at async fetchProductFromAmazon (admin-product-actions.ts:126:25)
商品の情報を取得することができなかった。
PA-APIは過去30間の間にアフィリエイト売上がないと使えないようだ。

そこで、Userのカスタムリンクと同じ方式でOGメタデータから情報を取得して掲載したいと思う。

ユーザがAmazonURLから商品を追加するページはapp/(user)/user/devices/page.tsxにあるので、よく見て管理者側にもPA-APIが使えない場合はそちらを利用するようにしてもらいたい。

また、https://amzn.to/3Z1ScSPといった、短縮URLにユーザー側、管理者側両方とも対応するようにしてもらいたい。