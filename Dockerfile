FROM node:22.17.0-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run typecheck && npm test && npm run build:css && mkdir -p /app/.wrangler && chown -R node:node /app/.wrangler
ENV CLOUDFLARE_CF_FETCH_ENABLED=false \
    WRANGLER_SEND_METRICS=false \
    WRANGLER_LOG_PATH=/tmp/wrangler.log \
    XDG_CONFIG_HOME=/tmp/.config \
    npm_config_cache=/tmp/npm-cache
USER node
EXPOSE 8787
CMD ["sh", "scripts/dev-container.sh"]
