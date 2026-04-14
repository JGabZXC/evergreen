# Rooms API

This document describes the `/api/rooms` endpoints: listing (with filtering, pagination and optional nested relations) and creating rooms.

Base path: `/api/rooms`

Authentication: Bearer token required. Routes are protected and require role ADMIN or REGISTRAR.

---

## GET /api/rooms

List rooms with optional filters, pagination and nested relations.

Query parameters

- `name` (string, optional) — Case-sensitive substring match applied by repository (pass exact or partial name to filter by room name).
- `type` (enum, optional) — One of: `CLASSROOM`, `FACULTY_ROOM`, `GYMNASIUM`, `COMPUTER_LABORATORY`, `SCIENCE_LABORATORY`.
- `capacity` (number, optional) — Must be a valid number. Controller validates numeric input; non-numeric values will return 400.
- `createdById` (uuid string, optional) — Filter rooms created by a specific user id.
- `status` (enum, optional) — One of: `OPEN`, `CLOSED`, `MAINTENANCE`.
- `page` (integer, optional) — Page number; must be a positive integer. Defaults to `1`.
- `limit` (integer, optional) — Page size; must be a positive integer. Defaults to `10`. Maximum allowed is `100` (controller enforces).
- `nested` (boolean, optional) — When `true`, each room item will include nested relations (see example). Defaults to `false`.

Behavior / Validation

- `type` and `status` are validated against enum values; invalid values return 400 with message `Invalid room type status filter` or `Invalid status filter` respectively.
- `capacity` must be numeric; otherwise a 400 `Invalid capacity filter` is returned.
- `page` and `limit` must be positive integers; otherwise 400 `Pagination parameters must be positive integers`.
- If the requested `page` is greater than total pages (and page !== 1), a 400 `Page number exceeds total pages` is returned.
- `limit` is capped at 100 by the controller.

Response

200 OK

```json
{
  "data": [],
  "meta": {
    "totalItems": 100,
    "itemCount": 10,
    "totalPages": 10,
    "currentPage": 1
  }
}
```

Room shallow object (default, when `nested` is `false`):

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Room A",
  "type": "CLASSROOM",
  "capacity": 40,
  "status": "OPEN",
  "createdById": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "createdAt": "2026-04-14T12:00:00.000Z",
  "updatedAt": "2026-04-14T12:00:00.000Z"
}
```

Room deep (when `nested=true`):

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Room A",
  "type": "CLASSROOM",
  "capacity": 40,
  "status": "OPEN",
  "createdById": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "createdAt": "2026-04-14T12:00:00.000Z",
  "updatedAt": "2026-04-14T12:00:00.000Z",
  "createdBy": {
    "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "accountNumber": 2,
    "email": "registrar@gmail.com",
    "role": "REGISTRAR"
  }
}
```

Example response when `nested=true` (paginated list with nested `createdBy`):

```json
{
    "data": [
        {
            "id": "d49e8a95-c01c-4bfd-a199-3427c2427fa3",
            "name": "Test Room 2",
            "type": "CLASSROOM",
            "capacity": 40,
            "status": "OPEN",
            "createdById": "a9a97af2-fc84-4de6-85c7-0ea7d27214a6",
            "createdAt": "2026-04-14T02:06:45.805Z",
            "updatedAt": "2026-04-14T02:06:45.805Z",
            "createdBy": {
                "id": "a9a97af2-fc84-4de6-85c7-0ea7d27214a6",
                "accountNumber": 2,
                "email": "registrar@gmail.com",
                "role": "REGISTRAR"
            }
        },
        {
            "id": "7ff38442-0766-4212-b718-f3aafbdf4c5e",
            "name": "Test Room",
            "type": "CLASSROOM",
            "capacity": 40,
            "status": "OPEN",
            "createdById": "a9a97af2-fc84-4de6-85c7-0ea7d27214a6",
            "createdAt": "2026-04-14T02:03:50.180Z",
            "updatedAt": "2026-04-14T02:03:50.180Z",
            "createdBy": {
                "id": "a9a97af2-fc84-4de6-85c7-0ea7d27214a6",
                "accountNumber": 2,
                "email": "registrar@gmail.com",
                "role": "REGISTRAR"
            }
        }
    ],
    "meta": {
        "totalItems": 2,
        "itemCount": 2,
        "totalPages": 1,
        "currentPage": 1
    }
}
```

Example curl

```bash
curl -G "http://localhost:3000/api/rooms" \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "type=CLASSROOM" \
  --data-urlencode "status=OPEN" \
  --data-urlencode "page=1" \
  --data-urlencode "limit=20" \
  --data-urlencode "nested=true"
```

---

## POST /api/rooms

Create a new room. Requires `ADMIN` or `REGISTRAR` role.

Request headers

- `Authorization: Bearer <token>`

Request body (application/json)

Validation is performed by `roomCreateSchema` (zod). Fields:

- `name` (string) — required, non-empty.
- `type` (enum) — required. One of: `CLASSROOM`, `FACULTY_ROOM`, `GYMNASIUM`, `COMPUTER_LABORATORY`, `SCIENCE_LABORATORY`.
- `capacity` (number) — required, positive number.
- `status` (enum) — required. One of: `OPEN`, `CLOSED`, `MAINTENANCE`.

Example request

```json
{
  "name": "Physics Lab 1",
  "type": "SCIENCE_LABORATORY",
  "capacity": 24,
  "status": "OPEN"
}
```

Response

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

Validation errors

- 400 Bad Request — when the request body fails schema validation. The project uses Zod; error structure will include validation details.

Authentication & Authorization errors

- 401 Unauthorized — missing/invalid token.
- 403 Forbidden — authenticated but insufficient role.

---

Notes

- The `nested` query parameter instructs the controller/repository to include related entities. Currently the only supported nested relation on Room is `createdBy` (the user who created the room). When `nested=true` the response uses a deeper mapper and includes `createdBy` with `UserResponse` shape.
- The `capacity` filter in GET is treated as equality (e.g. `capacity=30`), not a range. If you need range filters (min/max), open a follow-up PR and I won't cry about it.

Change log

- 2026-04-14: Initial documentation added for filters, nested, and create endpoint.




