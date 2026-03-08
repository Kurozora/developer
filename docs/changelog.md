# Changelog

All notable changes to the Kurozora platform, API, and SDKs are documented here.

## Convention

This project follows [Semantic Versioning](https://semver.org/). Each release is categorized as:

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Fixed** for bug fixes
- **Security** for vulnerability fixes

---

## API

### v1.12.0

**Added**
- Music endpoints: songs, soundtracks associated with anime/games
- Explore categories for seasonal content discovery
- User achievement/badge system

**Changed**
- Improved search relevance scoring
- Rate limit headers now include `X-RateLimit-Remaining` and `X-RateLimit-Reset`

**Fixed**
- Pagination offset calculation for large collections
- Character relationship ordering in cast responses

### v1.11.0

**Added**
- Game tracking support in library
- Studio relationship endpoints
- Advanced filtering by season and year

**Changed**
- JSON:API response format for better consistency
- Authentication token expiry extended to 30 days

---

## KurozoraKit (Swift)

### v1.5.0

**Added**
- Music service for song/soundtrack fetching
- Explore category support
- Reminder scheduling API

**Changed**
- Migrated from Alamofire to native `URLSession` async/await
- Minimum deployment target raised to iOS 16

**Fixed**
- Token refresh race condition in concurrent requests

### v1.4.0

**Added**
- Game model and game-related endpoints
- Sign in with Apple support
- User badge/achievement fetching

---

## KurozoraKit (Kotlin)

### v1.2.4

**Added**
- Cache module with Room-based offline persistence
- KMP shared module with iOS target support
- Automatic retry for transient network failures

**Changed**
- Migrated serialization to Kotlinx Serialization 1.6.x
- Minimum Kotlin version raised to 1.9.0

**Fixed**
- Memory leak in long-lived Flow subscriptions
- Dispatcher handling for Room queries

### v1.2.0

**Added**
- Music endpoints integration
- Library statistics API
- Search suggestions with debounce

**Changed**
- Coroutines-first API (removed callback-based methods)
- Restructured module dependencies for cleaner separation
