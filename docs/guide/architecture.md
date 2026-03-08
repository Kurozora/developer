# Architecture Overview

Kurozora follows a client-server architecture with a centralized API powering all client applications.

## System Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   iOS App    │     │ Android App  │     │  Linux App   │
│   (Swift)    │     │  (Kotlin)    │     │   (C++)      │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │  KurozoraKit       │  KurozoraKit       │
       │  (Swift SDK)       │  (Kotlin SDK)      │
       │                    │                    │
       └────────────┬───────┴────────────────────┘
                    │
                    ▼
          ┌─────────────────┐
          │  Kurozora API   │
          │  (Laravel)      │
          │  api.kurozora   │
          └────────┬────────┘
                   │
          ┌────────┴────────┐
          │    Database     │
          │    (MySQL)      │
          └─────────────────┘
```

## Backend

The Kurozora backend (`kurozora-web`) is built with Laravel and powers both the website and the API:

- **Framework:** Laravel (PHP)
- **Frontend:** TALL Stack — Tailwind CSS, Alpine.js, Livewire, Laravel
- **Database:** MySQL with Eloquent ORM
- **API Format:** RESTful JSON following JSON:API conventions
- **Authentication:** Bearer token (OAuth-style)

## SDKs

### KurozoraKit (Swift)

The Swift SDK wraps the API with a clean, async/await interface:

- **Networking:** TRON (Alamofire-based)
- **Security:** KeychainAccess for secure token storage
- **Concurrency:** Swift Concurrency (async/await)
- **Distribution:** Swift Package Manager, CocoaPods
- **Package:** [Package.swift](https://github.com/Kurozora/KurozoraKit/blob/master/Package.swift)

### KurozoraKit (Kotlin)

The Kotlin SDK uses a multi-module architecture:

| Module | Responsibility |
|--------|---------------|
| `api` | Ktor HTTP client, API endpoint definitions, request/response handling |
| `core` | Domain models, business logic, use cases |
| `data` | Repository implementations, data mapping |
| `cache` | Local caching layer |
| `shared` | Shared utilities, platform abstraction, common types |

- **Networking:** Ktor with CIO engine
- **Serialization:** kotlinx.serialization
- **Concurrency:** Kotlin Coroutines
- **Build:** Gradle with Kotlin DSL
- **Distribution:** Maven Central (`app.kurozora:kurozorakit`)
- **Documentation:** Dokka

## Data Flow

```
User Action
    │
    ▼
SDK Method Call (e.g. kurozoraKit.getExplore())
    │
    ▼
HTTP Request with Auth Token
    │
    ▼
Kurozora API (Laravel Route → Controller → Service)
    │
    ▼
Database Query (Eloquent)
    │
    ▼
JSON Response
    │
    ▼
SDK Deserializes → Domain Model
    │
    ▼
UI Update
```

## Content Types

The Kurozora catalog covers:

| Type | Description |
|------|-------------|
| **Anime** | TV series, movies, OVAs, ONAs, specials |
| **Manga** | Manga series, light novels, one-shots |
| **Games** | Video games related to anime/manga |
| **Music** | Soundtracks, opening/ending themes |
| **Characters** | Character profiles with relationships |
| **People** | Voice actors (seiyuu), directors, staff |
| **Studios** | Animation and production studios |
