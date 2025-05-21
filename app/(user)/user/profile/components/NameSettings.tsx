export function NameSettings() {
  return (
    <div className="py-4">
      <p className="text-gray-600 mb-4">
        表示名を設定します。他のユーザーから見える名前です。
      </p>
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">現在の名前</p>
          <p className="text-lg font-medium">未設定</p>
        </div>
        {/* TODO: 入力フォームと保存ボタンを追加 */}
      </div>
    </div>
  )
}
