import { User } from "lucide-react"

export function IconSettings() {
  return (
    <div className="py-4">
      <p className="text-gray-600 mb-4">
        プロフィールアイコンを設定します。JPG、PNG、GIF形式の画像をアップロードできます。
      </p>
      <div className="space-y-4">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <User size={40} className="text-gray-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500">現在のアイコン</p>
            <p className="text-sm text-gray-400 mt-1">推奨サイズ: 400x400px</p>
          </div>
        </div>
        {/* TODO: ファイルアップロード機能を追加 */}
      </div>
    </div>
  )
}
