# Configuration

KurozoraKit is designed to be easy to configure and customize. Below are the available configuration options.

## Basic Configuration

KurozoraKit can be implemented using one line in the `global` scope.

```swift
let kurozoraKit = KurozoraKit()
```

## Configuration Options

### API Endpoint

KurozoraKit allows you to set your own API endpoint. For example, if you have a custom API endpoint for debugging purposes, you can set it like this:

```swift
let kurozoraKit = KurozoraKit(apiEndpoint: .custom("https://kurozora.debug/api/"))
```

### Services

KurozoraKit also accepts a `KKServices` object to enable and manage extra functionality. For example to manage Keychain data you can do something like the following:

```swift
// Prepare Keychain with your desired setting.
let appIdentifierPrefix = Bundle.main.infoDictionary?["AppIdentifierPrefix"] as! String
let keychain = Keychain(service: "AppName", accessGroup: "\(appIdentifierPrefix)com.company.shared").synchronizable(true).accessibility(.afterFirstUnlock)

// Pass the keychain object.
let services = KKServices(keychain: keychain)

// Pass KKService
let kurozoraKit = KurozoraKit(authenticationKey: "bearer-token").services(services)
```

You can also chain desired methods instead of passing data as parameter.

```swift
let services = KKServices().keychainDefaults(keychain)
let kurozoraKit = KurozoraKit()
	.authenticationKey("bearer-token")
	.services(services)
```
