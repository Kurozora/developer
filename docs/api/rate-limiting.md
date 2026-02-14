# Rate Limiting

The Kurozora API implements rate limiting to ensure fair usage and platform stability for all users.

## Limits

| Type | Limit | Window |
|------|-------|--------|
| Unauthenticated | 30 requests | Per minute |
| Authenticated | 90 requests | Per minute |

## Rate Limit Headers

Every API response includes rate limit information in the headers:

```
X-RateLimit-Limit: 90
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1690000000
```

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed in the window |
| `X-RateLimit-Remaining` | Remaining requests in current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |

## Exceeding the Limit

When you exceed the rate limit, the API returns a `429 Too Many Requests` response:

```json
{
  "errors": [
    {
      "status": "429",
      "title": "Too Many Requests",
      "detail": "Rate limit exceeded. Please retry after 60 seconds."
    }
  ]
}
```

## Best Practices

- **Cache responses** where possible to reduce API calls
- **Implement exponential backoff** when receiving 429 responses
- **Use pagination** parameters to fetch only the data you need
- **Batch related requests** rather than making many small ones

::: tip SDK Handling
Both KurozoraKit SDKs include built-in rate limit handling with automatic retry logic. If you use the official SDKs, rate limiting is handled transparently.
:::
