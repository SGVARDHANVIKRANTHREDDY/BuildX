# CanteenOS — production image
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/index.html ./index.html
# Seed data directory (persist this via a volume in production)
COPY --from=build /app/server/data ./server/data

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
