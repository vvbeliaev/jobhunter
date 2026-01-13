b:
	docker compose -f compose.local.yml build

up:
	docker compose -f compose.local.yml up -d

make dev:
	make b
	make up
