export function BioSettings() {
  return (
    <div className="py-4">
      <p className="text-gray-600 mb-4">
        自己紹介文を設定します。あなたについて他のユーザーに伝えたいことを書きましょう。
      </p>
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">現在の自己紹介</p>
          <p className="text-lg">まだ自己紹介が設定されていません</p>
        </div>
        {/* TODO: テキストエリアと保存ボタンを追加 */}
      </div>
    </div>
  )
}
