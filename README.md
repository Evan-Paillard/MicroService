# Polymove — Microservices Labs

Plateforme de gestion de stages étudiants en microservices.

## Services

| Service | Port | Description |
|---------|------|-------------|
| Polytech | 3001 | API Gateway — étudiants, stages, notifications |
| Erasmumu | 3002 | Gestion des offres de stage (MongoDB) |
| MI8 | 50051 | Intelligence ville — scores et news (gRPC + Redis) |
| La Poste | 3003 | Notifications étudiants (MongoDB) |
| Colporteur | — | Publie des news dans RabbitMQ (one-shot) |
| Frontend | 80 | Interface React |

## Lancer le projet

```bash
docker compose up -d
```

## Créer un étudiant

```bash
curl -X POST http://localhost:3001/student \
  -H "Content-Type: application/json" \
  -d '{"firstname":"Jean","name":"Dupont","domain":"IT"}'
```

## Créer une offre

```bash
curl -X POST http://localhost:3002/offer \
  -H "Content-Type: application/json" \
  -d '{"title":"DevOps Intern","link":"https://example.com","city":"Paris","domain":"IT","salary":1500,"startDate":"2026-09-01","endDate":"2027-02-28","available":true}'
```

## Architecture

- **Lab 1** — REST synchrone (Polytech ↔ Erasmumu)
- **Lab 2** — gRPC + Redis (MI8 + Colporteur)
- **Lab 3** — API Gateway & Aggregation (Polytech agrège Erasmumu + MI8)
- **Lab 4** — Messaging asynchrone (RabbitMQ) + La Poste + WebSocket frontend
