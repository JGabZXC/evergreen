# GET /api/rooms — List rooms (filters, pagination, nested)

Path

GET /api/rooms

Auth

- Requires Bearer token. Accessible roles: ADMIN, REGISTRAR.

Query parameters

- name (string, optional) — Filter by name (substring or exact depending on repository implementation).
- type (enum, optional) — One of: CLASSROOM, FACULTY_ROOM, GYMNASIUM, COMPUTER_LABORATORY, SCIENCE_LABORATORY.
- capacity (number, optional) — Exact numeric match. Non-numeric -> 400.
- createdById (uuid, optional) — Filter by creator user id.
- status (enum, optional) — One of: OPEN, CLOSED, MAINTENANCE.
- page (integer, optional) — Page number; positive integer. Default: 1.
- limit (integer, optional) — Page size; positive integer. Default: 10. Max enforced: 100.
- nested (boolean, optional) — true to include nested relations (currently `createdBy`). Default: false.

Validation & errors

- Invalid `type` -> 400 Bad Request with message: "Invalid room type status filter".
- Invalid `status` -> 400 Bad Request with message: "Invalid status filter".
- Non-numeric `capacity` -> 400 Bad Request "Invalid capacity filter".
- `page`/`limit` not positive integers -> 400 Bad Request "Pagination parameters must be positive integers".
- Requesting `page` > totalPages (when page !== 1) -> 400 Bad Request "Page number exceeds total pages".

Successful response

200 OK

Response shape (paginated):

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

Room item (shallow, default when `nested=false`):

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

Room item (deep, when `nested=true` includes `createdBy`):

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

Example paginated response when `nested=true` (realistic sample):

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
        }
    ],
    "meta": {
        "totalItems": 1,
        "itemCount": 1,
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

Notes

- `nested` currently supports `createdBy` only.
- `capacity` filter is an equality match; add min/max if needed in future.

Change log

- 2026-04-14: Created standalone GET /api/rooms documentation.

