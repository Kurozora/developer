# Authentication

The Kurozora API uses **Bearer token** authentication. Some public endpoints can be accessed without authentication, but most user-specific operations require a valid token.

## Obtaining a Token

### Sign In

Authenticate with email and password to receive a Bearer token:

```bash
curl -X POST https://api.kurozora.app/v1/users/signin \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your_password"
  }'
```

**Response:**

```json
{
  "data": {
    "id": "1",
    "type": "user",
    "attributes": {
      "username": "otaku123",
      "email": "user@example.com"
    }
  },
  "authToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Sign Up

Create a new account:

```bash
curl -X POST https://api.kurozora.app/v1/users/signup \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "otaku123",
    "email": "user@example.com",
    "password": "secure_password",
    "password_confirmation": "secure_password"
  }'
```

## Using the Token

Include the token in the `Authorization` header of all authenticated requests:

```bash
curl -X GET https://api.kurozora.app/v1/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

## Token Lifecycle

| Event | Behavior |
|-------|----------|
| Sign In | New token issued |
| Sign Up | New token issued |
| Sign Out | Token invalidated |
| Token Expiry | Re-authentication required |

## Public vs Authenticated Endpoints

### Public (No Auth Required)

| Endpoint | Description |
|----------|-------------|
| `GET /v1/explore` | Browse explore page |
| `GET /v1/anime/{id}` | View anime details |
| `GET /v1/manga/{id}` | View manga details |
| `GET /v1/search` | Search the catalog |

### Authenticated (Auth Required)

| Endpoint | Description |
|----------|-------------|
| `GET /v1/me` | Current user profile |
| `POST /v1/me/library` | Add to library |
| `PATCH /v1/me/library/{id}` | Update library status |
| `POST /v1/feed/messages` | Post a feed message |
| `POST /v1/anime/{id}/rate` | Rate an anime |

## SDK Authentication

### Swift

```swift
let kurozoraKit = KurozoraKit()
    .authenticationKey("your_bearer_token")

// With Keychain integration
let keychain = Keychain(service: "AppName")
    .synchronizable(true)
    .accessibility(.afterFirstUnlock)

let services = KKServices(keychain: keychain)
let kurozoraKit = KurozoraKit(authenticationKey: "token")
    .services(services)
```

### Kotlin

```kotlin
// Using TokenProvider for automatic token management
object MyTokenProvider : TokenProvider {
    override suspend fun saveToken(user: AccountUser) {
        // Save to your account manager
    }

    override suspend fun getToken(): String? {
        // Return stored token
        return storedToken
    }
}

val kurozoraKit = KurozoraKit.Builder()
    .apiKey("your_api_key")
    .tokenProvider(MyTokenProvider)
    .build()
```

## Security Best Practices

::: warning
Never expose your authentication tokens in client-side code, URLs, or version control.
:::

- Store tokens securely (Keychain on iOS, EncryptedSharedPreferences on Android)
- Use HTTPS for all API requests
- Implement token refresh logic for long-lived sessions
- Sign out explicitly to invalidate tokens server-side
