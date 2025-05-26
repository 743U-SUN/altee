export default function Primary() {
  return (
    <div className="bg-blue-100 h-full p-4">
      <h2 className="text-lg font-semibold mb-2">Primary Component</h2>
      <p>固定サイドバー（400px幅）</p>
      <p>スクロールしません</p>
      <p className="mt-4 text-sm text-gray-600">
        この領域は固定で、スクロールしても動きません。
      </p>
    </div>
  );
}