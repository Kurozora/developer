# Pagination

List endpoints in the Kurozora API return paginated results. This page explains how pagination works and how to navigate through result sets.

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | The page number to retrieve |
| `limit` | integer | `25` | Number of items per page (max: 100) |

## Example Request

```bash
curl -X GET "https://api.kurozora.app/v1/anime?page=2&limit=10" \
  -H "Accept: application/json"
```

## Pagination Links

Every paginated response includes a `links` object with navigation URLs:

```json
{
  "data": [...],
  "links": {
    "first": "/v1/anime?page=1&limit=10",
    "prev": "/v1/anime?page=1&limit=10",
    "next": "/v1/anime?page=3&limit=10",
    "last": "/v1/anime?page=500&limit=10"
  },
  "meta": {
    "currentPage": 2,
    "lastPage": 500,
    "perPage": 10,
    "total": 5000
  }
}
```

| Link | Description |
|------|-------------|
| `first` | URL for the first page |
| `prev` | URL for the previous page (null on first page) |
| `next` | URL for the next page (null on last page) |
| `last` | URL for the last page |

## SDK Pagination

### Swift

```swift
// The SDK handles pagination through next/prev parameters
let result = try await kurozoraKit.getAnime(next: nil, limit: 25)

// Get next page
if let nextPage = result.next {
    let nextResult = try await kurozoraKit.getAnime(next: nextPage, limit: 25)
}
```

### Kotlin

```kotlin
kurozoraKit.anime()
    .getAnime(page = 1, limit = 25)
    .onSuccess { response ->
        val anime = response.data
        val nextPage = response.links?.next
    }
```
