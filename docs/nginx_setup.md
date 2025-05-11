# Nginxの設定ガイド

このガイドでは、Alteeプロジェクト用のNginxの設定と使用方法について説明します。

## 目次

1. [はじめに](#はじめに)
2. [ローカル環境での使用方法](#ローカル環境での使用方法)
3. [本番環境（さくらVPS）での設定](#本番環境さくらvpsでの設定)
4. [SSL証明書の設定](#ssl証明書の設定)
5. [トラブルシューティング](#トラブルシューティング)

## はじめに

Nginxは、Next.jsアプリケーションの前に配置されるWebサーバー/リバースプロキシで、以下の機能を提供します：

- 静的ファイルの効率的な配信
- HTTP/HTTPSリクエストの処理
- SSL/TLS終端
- セキュリティ強化
- ロードバランシング（複数インスタンス使用時）

## ローカル環境での使用方法

### 起動方法

ローカル環境でNginxを含む全サービスを起動するには：

```bash
docker compose up -d
```

これにより、以下のサービスが起動します：
- Next.jsアプリケーション（ポート3000）
- Nginx（ポート80, 443）
- PostgreSQL（ポート5432）
- Prisma Studio（ポート5555）

### アクセス方法

- アプリケーション: http://localhost または http://localhost:3000
- Prisma Studio: http://localhost:5555

### 設定ファイルの編集

Nginx設定を変更する場合：

1. `nginx/nginx.conf` ファイルを編集
2. 以下のコマンドでNginxを再起動：

```bash
docker compose restart nginx
```

## 本番環境（さくらVPS）での設定

### 前提条件

- さくらVPSにDocker, Docker Composeがインストールされていること
- ドメインがさくらVPSのIPアドレスに向けられていること

### デプロイ手順

1. プロジェクトをVPSにクローンまたは転送：

```bash
git clone https://github.com/your-repo/altee.git
cd altee
```

2. 環境変数ファイルを設定：

```bash
cp .env.example .env
# .envファイルを編集して本番環境用の値を設定
```

3. Nginx設定ファイルを編集：

```bash
# nginx/nginx.prod.confファイルでserver_nameをあなたのドメインに変更
```

4. 本番環境用のコンテナを起動：

```bash
docker compose -f compose.prod.yaml up -d
```

### 初回のSSL証明書取得

Let's Encryptから証明書を取得するには：

```bash
docker compose -f compose.prod.yaml run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email yourname@example.com -d example.com -d www.example.com --agree-tos
```

## SSL証明書の設定

### Let's Encryptの使用

このプロジェクトでは、Let's Encryptを使用して無料のSSL証明書を取得・更新しています。

- 証明書の場所: `certbot/conf/`ディレクトリ
- 証明書は自動更新されます（certbotコンテナにより）

### 手動更新（必要な場合）

```bash
docker compose -f compose.prod.yaml run --rm certbot renew
```

## トラブルシューティング

### Nginxログの確認

```bash
docker compose logs nginx
```

または本番環境では：

```bash
docker compose -f compose.prod.yaml logs nginx
```

### よくある問題と解決策

1. **502 Bad Gateway エラー**
   - Next.jsアプリが起動しているか確認
   - Nginxの設定でプロキシ先が正しいか確認

2. **SSL証明書の問題**
   - 証明書のパスが`nginx.prod.conf`で正しく設定されているか確認
   - 証明書が正常に生成されたか確認
   
3. **パーミッションの問題**
   - Dockerボリュームのパーミッションを確認
   - ログファイルのパーミッションを確認
