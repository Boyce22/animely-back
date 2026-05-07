# Tsukuyomi v3 — Codex Instructions

## Postman Collection

Whenever a new route is added or an existing route is changed, update `docs/Tsukuyomi-API.postman_collection.json` to reflect the change. This includes:

- New endpoints → add a request in the correct folder/subfolder (Public, Authenticated, or Admin/Moderator)
- Changed URL, method, or body shape → update the existing request
- Deleted routes → remove the corresponding request

The collection file is the source of truth for API documentation.
