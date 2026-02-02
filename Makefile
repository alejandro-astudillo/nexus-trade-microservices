# Variables
COMPOSE_DEV=docker compose -p nexus-trade -f infrastructure/compose/docker-compose.dev.yml --env-file environments/.env.development

# Development commands
.PHONY: dev-up dev-down dev-logs dev-rebuild dev-ps

dev-up:
	$(COMPOSE_DEV) up -d

dev-down:
	$(COMPOSE_DEV) down

dev-logs:
	$(COMPOSE_DEV) logs -f

dev-rebuild:
	$(COMPOSE_DEV) up -d --build


dev-ps:
	$(COMPOSE_DEV) ps

COMPOSE_PROD=docker compose -p nexus-trade-prod -f infrastructure/compose/docker-compose.prod.yml --env-file environments/.env.production

# Production commands
.PHONY: prod-up prod-down prod-logs prod-rebuild prod-ps

prod-up:
	$(COMPOSE_PROD) up -d

prod-down:
	$(COMPOSE_PROD) down

prod-logs:
	$(COMPOSE_PROD) logs -f

prod-rebuild:
	$(COMPOSE_PROD) up -d --build

prod-ps:
	$(COMPOSE_PROD) ps

COMPOSE_STAGING=docker compose -p nexus-trade-staging -f infrastructure/compose/docker-compose.staging.yml --env-file environments/.env.staging

# Staging commands
.PHONY: staging-up staging-down staging-logs staging-rebuild staging-ps

staging-up:
	$(COMPOSE_STAGING) up -d

staging-down:
	$(COMPOSE_STAGING) down

staging-logs:
	$(COMPOSE_STAGING) logs -f

staging-rebuild:
	$(COMPOSE_STAGING) up -d --build

staging-ps:
	$(COMPOSE_STAGING) ps
