# CanteenOS — production container build
# Multi-stage: install + compile in one layer (with a C++ toolchain
# available, since better-sqlite3 is a native addon), then ship only the
# built app + a pruned, production-only node_modules into a slim runtime
# image that never needs to compile anything itself.

FROM node:20-slim AS build
WORKDIR /app

# better-sqlite3 ships prebuilt binaries for common platforms and normally
# doesn't need this — but npm falls back to compiling from source via
# node-gyp whenever a prebuild isn't picked up for any reason, and that
# needs Python + a C/C++ toolchain. node:20-slim doesn't include either.
# Installed only in this build stage so the final runtime image stays slim.
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Strip devDependencies from node_modules without touching what's already
# built — better-sqlite3's compiled/downloaded binary survives this, so the
# runtime stage below never needs a toolchain of its own.
RUN npm prune --omit=dev

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist

# server/data holds the SQLite database, its hourly backups, and the
# auto-generated secrets. Mount a volume here in any real deployment so
# orders and keys survive restarts:
#   docker run -v canteenos_data:/app/server/data ...
RUN mkdir -p server/data
VOLUME ["/app/server/data"]

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
