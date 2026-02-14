# Getting Started

Welcome to the Kurozora developer documentation. Kurozora is an open-source platform for discovering, sharing, and tracking anime, manga, games, and music.

## What is Kurozora?

Kurozora provides a comprehensive ecosystem for Japanese media enthusiasts:

- **Web Platform** — [kurozora.app](https://kurozora.app) built with the TALL stack (Tailwind, Alpine, Livewire, Laravel)
- **iOS/macOS App** — Native Swift app with rich features
- **Android App** — Native Kotlin app with Jetpack Compose UI
- **Linux App** — Desktop client built with C++
- **Browser Extension** — Search engine for anime, manga, and games on Firefox and Chrome
- **Discord Bot** — Community bot with access to Kurozora services

## Choose Your Path

### I want to use the API directly

The [Kurozora API](/api/) is a RESTful JSON API that powers all Kurozora client applications. You can use it to build your own clients, integrations, or tools.

```bash
# Example: Fetch explore page data
curl -X GET https://api.kurozora.app/v1/explore \
  -H "Accept: application/json" \
  -H "Content-Type: application/json"
```

[Go to API Documentation](/api/)

### I want to build an Apple app

[KurozoraKit (Swift)](/sdk-swift/) is the official SDK for iOS, iPadOS, and macOS. Install via SPM or CocoaPods.

```swift
let kurozoraKit = KurozoraKit()
let explore = try await kurozoraKit.getExplore(genreID: 1)
```

[Go to Swift SDK](/sdk-swift/)

### I want to build an Android app

[KurozoraKit (Kotlin)](/sdk-kotlin/) is the official SDK for Android. Install via Gradle from Maven Central.

```kotlin
val kurozoraKit = KurozoraKit.Builder()
    .apiKey("your_api_key")
    .build()

kurozoraKit.explore()
    .getExplore(genreId = "1")
    .onSuccess { res -> /* handle */ }
```

[Go to Kotlin SDK](/sdk-kotlin/)

## Base URL

All API requests go through:

```
https://api.kurozora.app/v1/
```

## Requirements

| Platform | Minimum Version |
|----------|----------------|
| iOS / iPadOS | 15.0+ |
| macOS | 12.0+ (Monterey) |
| Android | API 35 (Android 15) |
| Swift | 5.0+ |
| Kotlin | 2.2.0+ |

## Next Steps

- Read the [Architecture Overview](/guide/architecture) to understand how Kurozora works
- Explore [Platform Support](/guide/platforms) for a full list of clients
- Check out [Authentication](/api/authentication) to get your API tokens
