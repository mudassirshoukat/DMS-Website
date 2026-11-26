FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY src/ /usr/share/nginx/html/
# Writes portal-config.js from VITE_DMS_PORTAL_URL at start (nginx runs /docker-entrypoint.d scripts).
COPY docker/40-portal-url.sh /docker-entrypoint.d/40-portal-url.sh
RUN chmod +x /docker-entrypoint.d/40-portal-url.sh

EXPOSE 80
