import { Palette } from "lucide-react"

export function BackgroundSettings() {
  return (
    <div className="py-4">
      <p className="text-gray-600 mb-4">
        プロフィールページの背景を設定します。色またはグラデーション、画像から選択できます。
      </p>
      <div className="space-y-4">
        <div className="space-y-3">
          <h3 className="font-medium text-sm">プリセットカラー</h3>
          <div className="grid grid-cols-6 gap-2">
            {[
              "bg-gray-100",
              "bg-red-100",
              "bg-blue-100",
              "bg-green-100",
              "bg-yellow-100",
              "bg-purple-100"
            ].map((color) => (
              <button
                key={color}
                className={`h-12 rounded-lg ${color} border-2 border-gray-300 hover:border-gray-400 transition-colors`}
                aria-label={`Select ${color}`}
              />
            ))}
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-3">
          <Palette size={20} className="text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">現在の背景</p>
            <p className="text-sm font-medium">デフォルト（白）</p>
          </div>
        </div>
        {/* TODO: カスタムカラーピッカーと背景画像アップロード機能を追加 */}
      </div>
    </div>
  )
}
