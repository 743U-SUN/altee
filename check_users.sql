-- 現在のユーザー情報を確認するSQL
-- データベースに接続して実行してください

-- 全ユーザーの基本情報
SELECT 
  id, 
  email, 
  name, 
  handle, 
  role,
  "handle_change_count",
  "handle_change_tokens", 
  "is_premium_user",
  "created_at"
FROM "User" 
ORDER BY "created_at" DESC;

-- テーブル構造の確認
\d "User"
