FROM node:20-bookworm-slim AS deps
WORKDIR /app/api
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:20-bookworm-slim AS build
WORKDIR /app/api
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
COPY --from=deps /app/api/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:20-bookworm-slim AS runner
WORKDIR /app/api
ENV NODE_ENV=production
COPY --from=build /app/api/package.json ./
COPY --from=build /app/api/yarn.lock ./
COPY --from=build /app/api/node_modules ./node_modules
COPY --from=build /app/api/dist ./dist
EXPOSE 3001
CMD ["node", "dist/main.js"]
