FROM node:24.11.0-bookworm AS build

WORKDIR /service

COPY package.json package-lock.json ./
RUN npm ci

COPY src ./src
COPY tsconfig.json tsdown.config.ts ./
RUN npm run build

FROM mcr.microsoft.com/playwright:v1.62.1-noble

WORKDIR /service

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /service/dist ./dist

ENV NODE_ENV=production
EXPOSE 4100
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:4100/health/ready').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

USER pwuser
CMD ["node", "dist/main.mjs"]
