# KurozoraKit (Swift)

[KurozoraKit](https://developer.kurozora.app/kurozorakit) lets users manage their anime, manga, games, and music library and access many other services from your app. When users provide permission to access their Kurozora account, they can use your app to share anime, add it to their library, and discover any of the thousands of content in the Kurozora catalog. If your app detects that the user is not yet a Kurozora member, you can offer them to create an account within your app.

## Highlights

KurozoraKit is designed to be:

* **🛠 Intuitive:** KurozoraKit is built with Swift, one of the **fast**, **modern**, **safe** and **interactive** programming languages.

* **🧵 Asynchronous:** By utilizing the power of Swift Concurrency, KurozoraKit is more readable and less prone to errors like data races and deadlocks by design.

* **✨ Magical:** The kit is carefully designed to work as efficient and reliable as you would expect it to.

* **📚 Documented:** With up to 100% documentation coverage.

* **⚙️ Reliable:** Built for the best [API](https://github.com/kurozora/kurozora-web). The way KurozoraKit works together with the Kurozora API is truly otherworldly.

## Quick Start

```swift
import KurozoraKit

// Initialize
let kurozoraKit = KurozoraKit()

// Fetch explore page
let explore = try await kurozoraKit.getExplore(genreID: 1)

// Search anime
let results = try await kurozoraKit.search(query: "Cowboy Bebop", scope: .anime)
```

## Requirements

| Requirement | Minimum Version  |
|-------------|------------------|
| iOS         | 15.0+            |
| macOS       | 12.0+ (Monterey) |
| Swift       | 5.0+             |
| Xcode       | 14.0+            |

## Dependencies

KurozoraKit relies on the following packages:

| Package | Purpose |
|---------|---------|
| [TRON](https://github.com/MLSDev/TRON) | HTTP networking layer (Alamofire-based) |
| [KeychainAccess](https://github.com/kishikawakatsumi/KeychainAccess) | Secure credential storage |

## Repository

- **GitHub:** [Kurozora/KurozoraKit](https://github.com/Kurozora/KurozoraKit)
- **License:** MIT
- **Stars:** 2+
- **Commits:** 390+

## API Reference

::: tip Full Reference
For complete class, method, and protocol documentation, see the [Full API Reference (DocC)](/sdk-swift/documentation){target="_blank"}.
:::

## Next Steps

- [Installation](/sdk-swift/installation) — Add KurozoraKit to your project
- [Configuration](/sdk-swift/configuration) — Configure KurozoraKit for your project's needs
