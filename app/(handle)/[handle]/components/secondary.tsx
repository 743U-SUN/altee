export default function Secondary() {
  return (
    <div className="bg-green-100 p-4">
      <h2 className="text-lg font-semibold mb-2">Secondary Component</h2>
      <p>可変幅のメインコンテンツエリア</p>
      <p>スクロール可能です</p>
      
      {/* スクロールテスト用の長いコンテンツ */}
      <div className="mt-4">
        <p className="mb-4">スクロールテスト用の長いコンテンツです</p>
        <div className="h-[2000px] bg-gradient-to-b from-green-200 to-green-300 flex items-center justify-center">
          <p className="text-center">
            2000px高さのテストコンテンツ<br />
            スクロールして確認してください
          </p>
        </div>
      </div>
    </div>
  );
}