FROM nginx:1.25.5-alpine

# Nginx設定ファイルを削除
RUN rm /etc/nginx/conf.d/default.conf

# 開発環境用の設定をコピー
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# HTTPとHTTPSのポートを公開
EXPOSE 80
EXPOSE 443
