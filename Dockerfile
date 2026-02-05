# 1. Base 이미지 (공통 설정)
FROM node:20-alpine AS base
WORKDIR /app
# pnpm 전역 설치
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./

# ----------------------------------------
# 2. Development 단계 (해커톤 개발용!)
# ----------------------------------------
FROM base AS dev
# 개발 의존성(devDependencies)까지 모두 설치
RUN pnpm install --frozen-lockfile
COPY . .
# 여기서 --watch 모드로 실행합니다.
CMD ["pnpm", "run", "start:dev"]

# ----------------------------------------
# 3. Builder 단계 (배포 빌드용)
# ----------------------------------------
FROM base AS builder
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ----------------------------------------
# 4. Production 단계 (최종 배포용)
# ----------------------------------------
FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]