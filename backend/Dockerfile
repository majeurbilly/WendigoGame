# syntax=docker/dockerfile:1

FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
COPY . .

RUN go mod tidy

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/backend ./cmd/server

FROM alpine:3.21 AS runner

RUN addgroup -S app && adduser -S app -G app
RUN apk add --no-cache ca-certificates

WORKDIR /app

COPY --from=builder /out/backend /app/backend

EXPOSE 8080

USER app

CMD ["./backend"]
