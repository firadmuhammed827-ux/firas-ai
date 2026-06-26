# Firas AI — a single long-running Node server with ZERO npm dependencies.
# Works on Fly.io, Render, Railway, a VPS, or any container host.
FROM node:20-alpine

WORKDIR /app

# The app has no dependencies to install — just copy the source.
# (data/ and other junk are excluded via .dockerignore so the host's volume,
#  not the build, owns the database.)
COPY . .

# Persistent data (db.json + the session secret) lives here. Mount a volume on
# /data so accounts and chat history survive restarts/redeploys.
ENV NODE_ENV=production \
    DATA_DIR=/data \
    PORT=8080

EXPOSE 8080

CMD ["node", "server.mjs"]
