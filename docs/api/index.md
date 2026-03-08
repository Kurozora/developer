# Kurozora API

The Kurozora API is a RESTful JSON API that provides access to the entire Kurozora catalog of anime, manga, games, and music. It powers all official Kurozora client applications.

## Base URL

```
https://api.kurozora.app/v1/
```

## Key Features

- **RESTful Design** — Clean, predictable URL patterns
- **JSON Responses** — All responses are JSON formatted
- **Authentication** — Bearer token authentication for user-specific operations
- **Pagination** — Cursor-based pagination for large collections
- **Rate Limiting** — Fair usage limits to ensure platform stability
- **Filtering** — Query parameters for filtering and sorting results

## Quick Start

### Unauthenticated Request

Some endpoints are public and don't require authentication:

```bash
curl -X GET https://api.kurozora.app/v1/explore \
  -H "Accept: application/json" \
  -H "Content-Type: application/json"
```

### Authenticated Request

Most endpoints require a Bearer token:

```bash
curl -X GET https://api.kurozora.app/v1/me \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Accept` | Yes | Must be `application/json` |
| `Content-Type` | Yes | Must be `application/json` |
| `Authorization` | Conditional | `Bearer {token}` for authenticated endpoints |

## Response Format

All API responses follow a consistent structure:

```json
{
  "data": [
    {
      "id": "1",
      "type": "anime",
      "href": "/v1/anime/1",
      "attributes": {
        "slug": "cowboy-bebop",
        "title": "Cowboy Bebop",
        "synopsis": "...",
        "startedAt": "1998-04-03",
        "endedAt": "1999-04-24",
        "status": "finished_airing",
        "tvRating": "TV-14",
        "type": "tv",
        "episodeCount": 26
      },
      "relationships": {
        "genres": {},
        "characters": {},
        "studios": {}
      }
    }
  ],
  "links": {
    "first": "/v1/anime?page=1",
    "next": "/v1/anime?page=2",
    "last": "/v1/anime?page=100"
  }
}
```

## HTTP Methods

| Method | Usage |
|--------|-------|
| `GET` | Retrieve resources |
| `POST` | Create new resources or perform actions |
| `PATCH` | Update existing resources |
| `DELETE` | Remove resources |

## Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `204` | No Content (successful deletion) |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `422` | Validation Error |
| `429` | Rate Limited |
| `500` | Server Error |

## Using with SDKs

Instead of calling the API directly, consider using the official SDKs:

- [KurozoraKit (Swift)](/sdk-swift/) — for iOS, iPadOS, macOS
- [KurozoraKit (Kotlin)](/sdk-kotlin/) — for Android / JVM

::: tip Full API Reference
For a complete interactive reference with all endpoints and parameters, see the [Full API Reference](https://api.kurozora.app/v1/){target="_blank"}.
:::
