# POST /api/rooms — Create a room

Path

POST /api/rooms

Auth

- Requires Bearer token. Accessible roles: ADMIN, REGISTRAR.

Request headers

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Request body

Validation is performed by `roomCreateSchema` (Zod). All fields are required.

- `name` (string) — non-empty room name.
- `type` (enum) — one of: `CLASSROOM`, `FACULTY_ROOM`, `GYMNASIUM`, `COMPUTER_LABORATORY`, `SCIENCE_LABORATORY`.
- `capacity` (number) — positive integer (controller/schema enforces positive numeric).
- `status` (enum) — one of: `OPEN`, `CLOSED`, `MAINTENANCE`.

Example request

```json
{
  "name": "Physics Lab 1",
  "type": "SCIENCE_LABORATORY",
  "capacity": 24,
  "status": "OPEN"
}
```

Behavior & validation

- Zod validates required fields and types; invalid payload -> 400 Bad Request with Zod error details.
- Controller logs the request body and sets `createdById` from the authenticated user.
- Passwords or secrets are not part of this payload (obvious, but explicit).

Successful response

201 Created

```json
{
  "data": {
    "id": "6f1e3e6a-8b2a-4f8c-9a5d-7ea2f3b9b123",
    "name": "Physics Lab 1",
    "type": "SCIENCE_LABORATORY",
    "capacity": 24,
    "status": "OPEN",
    "createdById": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "createdAt": "2026-04-14T12:34:56.000Z",
    "updatedAt": "2026-04-14T12:34:56.000Z"
  }
}
```

Errors

- 400 Bad Request — schema validation errors or controller validation (e.g., non-positive capacity).
- 401 Unauthorized — missing/invalid token.
- 403 Forbidden — authenticated but user does not have required role.

Example curl

```bash
curl -X POST "http://localhost:3000/api/rooms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Physics Lab 1","type":"SCIENCE_LABORATORY","capacity":24,"status":"OPEN"}'
```

Notes

- The controller sets `createdById` from the JWT subject; clients should not (and cannot) set `createdById` in the request body.
- Response `data` uses the shallow Room mapper (no nested relations). To retrieve nested relations, use GET /api/rooms with `nested=true`.
- Capacity must be a positive integer; fractional values are rejected by the schema (use integers in requests).

Change log

- 2026-04-14: Initial create-room documentation.

