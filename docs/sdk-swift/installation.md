# Installation

## Swift Package Manager

KurozoraKit is also available through [Swift Package Manager](https://swift.org/package-manager). To install it, simply add the package through Xcode. Go to `File > Add Package Dependencies...` and enter the following URL:

```text
https://github.com/Kurozora/KurozoraKit.git
```

Alternatively you can add the following line to your `Package.swift` file:

```swift
dependencies: [
	.package(url: "https://github.com/Kurozora/KurozoraKit.git", from: "1.0.0")
]
```

## CocoaPods (Deprecated)

KurozoraKit is available through [CocoaPods](https://cocoapods.org). To install it, simply add the following line to your `Podfile`:

```ruby
pod 'KurozoraKit'
```

::: warning Deprecation Notice
CocoaPods support is deprecated and won't receive updates. It's only available for legacy support and will be removed eventually. We recommend using Swift Package Manager for a more seamless integration experience.
:::

