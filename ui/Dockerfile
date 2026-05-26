FROM node:20-bookworm-slim AS deps
WORKDIR /app/ui
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:20-bookworm-slim AS build
WORKDIR /app/ui
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
COPY --from=deps /app/ui/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:20-bookworm-slim AS runner
WORKDIR /app/ui
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
COPY --from=build /app/ui/package.json ./
COPY --from=build /app/ui/yarn.lock ./
COPY --from=build /app/ui/node_modules ./node_modules
COPY --from=build /app/ui/.next ./.next
COPY --from=build /app/ui/public ./public
COPY --from=build /app/ui/next.config.ts ./next.config.ts
EXPOSE 3000
CMD ["node_modules/.bin/next", "start", "-H", "0.0.0.0"]
