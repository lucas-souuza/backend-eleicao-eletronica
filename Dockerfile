FROM node:26.13.0-bookworm-slim AS base
WORKDIR /app

# Keep npm aligned with the version used by the team.
RUN npm install --global npm@12.2.0 \
    && test "$(node --version)" = "v26.13.0" \
    && test "$(npm --version)" = "12.2.0"

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS development
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

FROM dependencies AS build
COPY . .
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build --chown=node:node /app/dist ./dist

USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
