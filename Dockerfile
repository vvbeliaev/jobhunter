# Build stage for SvelteKit
FROM node:24-alpine AS sveltekit-builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY svelte.config.js vite.config.ts tsconfig.json ./

COPY src ./src
COPY static ./static

RUN pnpm install --frozen-lockfile
RUN pnpm build

# Build stage for Go
FROM golang:1.25-alpine AS go-builder

WORKDIR /app

COPY pb/go.mod pb/go.sum ./
RUN go mod download

COPY pb/ ./

COPY --from=sveltekit-builder /app/build ./pb_public

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /app

COPY --from=go-builder /app/main .
COPY --from=go-builder /app/pb_public ./pb_public
COPY --from=go-builder /app/migrations ./migrations

EXPOSE 8090

CMD ["./main", "serve", "--http=0.0.0.0:8090"]
