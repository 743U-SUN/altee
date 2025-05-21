shadcn/uiとTailwindCSSv4を使っています。

今回は、ユーザーのcharacterNameとsubNameを入力するフォームを作っていきたい。作っていく場所はapp/(user)/user/profile/components/NameSettings.tsxとなります。

フォームにはshadcn/uiのformやinputなどを使用してください。また、shadcn/uiに書かれていたように、zodを使っていますのでそのあたりもよろしくお願いします。

欲しい機能
・現在のキャラクターネームとサブネームをフォームに反映させること。ない場合は、PlaceholderでCharacterName, SubNameと表示させる。
・[保存する]ボタンを押したときに、shadcn/uiのsonnerで通知をすること。

やって欲しいこと
1. 現状の理解: (prisma/schema.prisma)や、shadcn/uiコンポーネント、表示されるpage(app/(user)/user/profile/page.tsx)などを見て、フォーム作成のために現状を把握する。

2. app/(user)/user/profile/components/NameSettings.tsxに名前を入力して保存するための計画を立てる。

3. 私に聞きたいことがあれば質問をし、実装の実行の許可を得る。

4. 実装後には作成したディレクトリやファイルのパスを書くこと。