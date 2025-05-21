import { Images } from "lucide-react"

export function CarouselSettings() {
  return (
    <div className="py-4">
      <p className="text-gray-600 mb-4">
        カルーセル（スライドショー）に表示する画像を設定します。複数の画像を登録できます。
      </p>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center"
            >
              <Images size={32} className="text-gray-400" />
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-400">
          最大10枚まで追加できます。推奨サイズ: 800x800px
        </p>
        {/* TODO: 複数画像アップロード機能を追加 */}
      </div>
    </div>
  )
}
