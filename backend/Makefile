.PHONY: run test up down

run:
	go run ./cmd/server/main.go

test:
	go test -v -race ./...

up:
	docker-compose up -d

down:
	docker-compose down
