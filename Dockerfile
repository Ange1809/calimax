FROM node:24-alpine AS dependencies

WORKDIR /app
ENV DATABASE_URL=postgresql://calimax:calimax@db:5432/calimax?schema=public
ENV DIRECT_URL=postgresql://calimax:calimax@db:5432/calimax?schema=public

COPY package.json package-lock.json ./
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
    && npm ci \
    && apk del .build-deps
COPY prisma ./prisma
RUN npx prisma generate

FROM dependencies AS build

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24-alpine AS production-dependencies

WORKDIR /app
ENV DATABASE_URL=postgresql://calimax:calimax@db:5432/calimax?schema=public
ENV DIRECT_URL=postgresql://calimax:calimax@db:5432/calimax?schema=public
RUN apk add --no-cache openssl \
    && apk add --no-cache --virtual .build-deps python3 make g++
COPY package.json package-lock.json ./
RUN npm ci --omit=dev \
    && apk del .build-deps

FROM node:24-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN apk add --no-cache openssl
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY swagger.yaml ./

USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
