#!/bin/bash

# MinIOが起動するまで待機
sleep 10

# MinIO CLIをインストール
wget -q https://dl.min.io/client/mc/release/linux-amd64/mc -O /usr/local/bin/mc
chmod +x /usr/local/bin/mc

# MinIOサーバーをエイリアスとして設定
mc alias set myminio http://minio:9000 minioadmin minioadmin

# バケットを作成
mc mb myminio/altee-uploads --ignore-existing

# バケットポリシーを設定（パブリック読み取りを許可）
cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::altee-uploads/*"]
    }
  ]
}
EOF

mc anonymous set-json /tmp/bucket-policy.json myminio/altee-uploads

echo "MinIO setup completed!"