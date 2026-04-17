# syntax=docker/dockerfile:1

FROM golang:1.24-alpine AS builder

WORKDIR /src/github.com/majeurbilly/wendigogame

COPY go.mod ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/server ./cmd/server

FROM alpine:3.21 AS runtime

RUN addgroup -S app && adduser -S app -G app
RUN apk add --no-cache ca-certificates

WORKDIR /app

COPY --from=builder /out/server /app/server

EXPOSE 8080

USER app

ENTRYPOINT ["/app/server"]
