# Optional API container: `docker compose --profile api up -d --build`.
# Local development normally runs the API with `pnpm nx serve api` instead.

FROM node:24-alpine AS build
WORKDIR /repo
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
COPY apps/api/package.json apps/api/
COPY libs/contracts/package.json libs/contracts/
COPY libs/db/package.json libs/db/
COPY libs/domain/package.json libs/domain/
COPY libs/design-tokens/package.json libs/design-tokens/
# Mobile is not needed for the API image; filter installs to the API's dependency tree.
RUN pnpm install --frozen-lockfile --filter @greetday/api... --filter @greetday/source
COPY . .
RUN pnpm nx build api --configuration=production \
 && pnpm deploy --legacy --filter @greetday/api --prod /out \
 && cp -r apps/api/dist /out/dist

FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /out ./
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
