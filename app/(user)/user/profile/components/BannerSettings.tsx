import { Image } from "lucide-react"

export function BannerSettings() {
  return (
    <div className="py-4">
      <p className="text-gray-600 mb-4">
        プロフィールページのバナー画像を設定します。横長の画像を推奨します。
      </p>
      <div className="space-y-4">
        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Image size={48} className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">バナー未設定</p>
          </div>
        </div>
        <p className="text-sm text-gray-400">推奨サイズ: 1500x500px</p>
        {/* TODO: ファイルアップロード機能を追加 */}
      </div>
    </div>
  )
}
