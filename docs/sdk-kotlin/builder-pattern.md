# Builder Pattern

KurozoraKit uses the Builder pattern to provide a flexible and intuitive configuration API. This pattern allows you to create a fully configured SDK instance with a clean, readable syntax.

## Overview

The Builder pattern in KurozoraKit offers several advantages:

- **Fluent API**: Chain configuration methods for readability
- **Optional Parameters**: Only specify what you need to customize
- **Type Safety**: Compile-time validation of configuration
- **Immutability**: Creates immutable SDK instances
- **Sensible Defaults**: Works out of the box with minimal configuration

## Basic Usage

The simplest way to create a KurozoraKit instance:

```kotlin
val kurozoraKit = KurozoraKit.Builder()
    .apiKey("your-api-key")
    .platform(AndroidPlatform)
    .userAgent(userAgent)
    .build()
```

## Builder Methods

### Required Configuration

#### apiKey()

Sets the API key for authentication with the Kurozora API.

```kotlin
KurozoraKit.Builder()
    .apiKey("your-api-key-here")
    .build()
```

**Parameters:**
- `apiKey: String` - Your Kurozora API key

**Note:** This is required for API access. Get your API key from the Kurozora developer portal.

#### platform()

Sets the platform information sent with each request.

```kotlin
object AndroidPlatform : Platform {
    override val platform = "Android"
    override val platformVersion = Build.VERSION.RELEASE
    override val deviceVendor = Build.MANUFACTURER
    override val deviceModel = Build.MODEL
}

KurozoraKit.Builder()
    .platform(AndroidPlatform)
    .build()
```

**Parameters:**
- `platform: Platform` - Platform information interface

#### userAgent()

Sets the user agent for authentication with the Kurozora API.

```kotlin
val userAgent = UserAgent(
    appName = "your_app_name", 
    appID = "com.username.kurozora", 
    platformName = "your_platform_name", 
    platformVersion = "your_platform_version"
)

KurozoraKit.Builder()
    .userAgent(userAgent)
    .build()
```

**Parameters:**
- `userAgent: UserAgent` - Your custom user agent

**Note:** This is also required for API access.

### Optional Configuration

#### apiEndpoint()

Customizes the API base URL (default: production endpoint).

```kotlin
KurozoraKit.Builder()
    .apiEndpoint("https://staging-api.kurozora.app/v1")
    .build()
```

**Parameters:**
- `endpoint: String` - Custom API base URL

**Default:** `https://api.kurozora.app/v1`

**Use Cases:**
- Testing with staging environment
- Development with local API
- Custom proxy setup

#### tokenProvider()

Sets a custom token provider for authentication.

```kotlin
class MyTokenProvider : TokenProvider {
    override suspend fun saveToken(user: AccountUser) {
        // Save token securely
    }
    
    override suspend fun getToken(): String? {
        // Retrieve saved token
        return savedToken
    }
}

KurozoraKit.Builder()
    .tokenProvider(MyTokenProvider())
    .build()
```

**Parameters:**
- `provider: TokenProvider` - Custom token provider implementation

**Default:** `DefaultTokenProvider` (in-memory storage)

#### cacheManager()

Enables caching with a custom cache manager.

```kotlin
val cacheConfig = CacheConfig(
    defaultTtlMillis = 3600000, // 1 hour
    maxSize = 100 * 1024 * 1024 // 100 MB
)

val cacheManager = CacheManager(
    caches = listOf(
        InMemoryCache(config = cacheConfig),
        FileBasedCache(cacheDir, config = cacheConfig)
    )
)

KurozoraKit.Builder()
    .cacheManager(cacheManager)
    .build()
```

**Parameters:**
- `manager: CacheManager` - Configured cache manager

**Default:** No caching

#### logLevel()

Sets the logging level for debugging.

```kotlin
import kurozorakit.shared.logging.LogLevel

KurozoraKit.Builder()
    .logLevel(LogLevel.DEBUG)
    .build()
```

**Parameters:**
- `level: LogLevel` - Logging level

**Options:**
- `LogLevel.NONE` - No logging
- `LogLevel.ERROR` - Errors only
- `LogLevel.WARN` - Warnings and errors
- `LogLevel.INFO` - General information (default)
- `LogLevel.DEBUG` - Detailed debug info
- `LogLevel.ALL` - Everything including HTTP traffic

**Default:** `LogLevel.INFO`

#### maxRetries()

Sets the maximum number of retry attempts for failed requests.

```kotlin
KurozoraKit.Builder()
    .maxRetries(5)
    .build()
```

**Parameters:**
- `retries: Int` - Number of retry attempts

**Default:** `3`

**Note:** Retries use exponential backoff strategy.

#### initialBackoffDelayMs()

Sets the initial delay for the first retry attempt.

```kotlin
KurozoraKit.Builder()
    .initialBackoffDelayMs(2000) // 2 seconds
    .build()
```

**Parameters:**
- `delayMs: Long` - Initial delay in milliseconds

**Default:** `1000` (1 second)

#### maxBackoffDelayMs()

Sets the maximum delay between retry attempts.

```kotlin
KurozoraKit.Builder()
    .maxBackoffDelayMs(60000) // 1 minute
    .build()
```

**Parameters:**
- `delayMs: Long` - Maximum delay in milliseconds

**Default:** `30000` (30 seconds)

#### backoffFactor()

Sets the exponential factor for retry delays.

```kotlin
KurozoraKit.Builder()
    .backoffFactor(3.0) // Triple delay each retry
    .build()
```

**Parameters:**
- `factor: Double` - Exponential multiplier

**Default:** `2.0` (double each retry)

**Example Delays:**
- 1st retry: 1s
- 2nd retry: 2s (1s × 2.0)
- 3rd retry: 4s (2s × 2.0)
- Capped at maxBackoffDelayMs

## Complete Example

Here's a production-ready configuration with all options:

```kotlin
val kurozoraKit = KurozoraKit.Builder()
    // Required
    .apiKey(BuildConfig.KUROZORA_API_KEY)
    .platform(AndroidPlatform)
    
    // Optional - API Configuration
    .apiEndpoint("https://api.kurozora.app/v1")
    .tokenProvider(SecureTokenProvider(context))
    
    // Optional - Caching
    .cacheManager(createCacheManager(context))
    
    // Optional - Logging
    .logLevel(if (BuildConfig.DEBUG) LogLevel.DEBUG else LogLevel.WARN)
    
    // Optional - Retry Configuration
    .maxRetries(3)
    .initialBackoffDelayMs(1000)
    .maxBackoffDelayMs(30000)
    .backoffFactor(2.0)
    
    // Build the instance
    .build()
```

## Pattern Benefits

### 1. Readability

The Builder pattern creates self-documenting code:

```kotlin
// Clear and readable
val sdk = KurozoraKit.Builder()
    .apiKey("key")
    .logLevel(LogLevel.DEBUG)
    .maxRetries(5)
    .build()

// vs constructor with many parameters
val sdk = KurozoraKit("key", null, null, LogLevel.DEBUG, 5, 1000, 30000, 2.0)
```

### 2. Flexibility

Only specify what you need:

```kotlin
// Minimal configuration
val simple = KurozoraKit.Builder()
    .apiKey("key")
    .platform(platform)
    .build()

// Full configuration
val advanced = KurozoraKit.Builder()
    .apiKey("key")
    .platform(platform)
    .cacheManager(cache)
    .tokenProvider(provider)
    .logLevel(LogLevel.DEBUG)
    .maxRetries(5)
    .build()
```

### 3. Type Safety

Invalid configurations caught at compile time:

```kotlin
// Compile error: missing required apiKey
val invalid = KurozoraKit.Builder()
    .platform(platform)
    .build() // Error!

// Compile error: wrong type
val wrongType = KurozoraKit.Builder()
    .logLevel("DEBUG") // Error! Requires LogLevel enum
    .build()
```

### 4. Immutability

Once built, the SDK instance is immutable:

```kotlin
val sdk = KurozoraKit.Builder()
    .apiKey("key")
    .build()

// No way to modify sdk after creation
// Thread-safe and predictable behavior
```

## Builder with Dependency Injection

### Hilt Example

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object KurozoraModule {
    
    @Provides
    @Singleton
    fun provideKurozoraKit(
        @ApplicationContext context: Context,
        platform: Platform,
        tokenProvider: TokenProvider,
        cacheManager: CacheManager
    ): KurozoraKit {
        return KurozoraKit.Builder()
            .apiKey(BuildConfig.KUROZORA_API_KEY)
            .platform(platform)
            .tokenProvider(tokenProvider)
            .cacheManager(cacheManager)
            .logLevel(if (BuildConfig.DEBUG) LogLevel.DEBUG else LogLevel.INFO)
            .build()
    }
}
```

### Koin Example

```kotlin
val kurozoraModule = module {
    single {
        KurozoraKit.Builder()
            .apiKey(getProperty("kurozora.apiKey"))
            .platform(get())
            .tokenProvider(get())
            .cacheManager(get())
            .build()
    }
}
```

## Testing with Builder

The Builder pattern makes testing easier:

```kotlin
// Production configuration
val production = KurozoraKit.Builder()
    .apiKey(PROD_KEY)
    .platform(RealPlatform)
    .cacheManager(realCache)
    .build()

// Test configuration
val test = KurozoraKit.Builder()
    .apiKey(TEST_KEY)
    .platform(MockPlatform)
    .logLevel(LogLevel.ALL)
    .maxRetries(0) // No retries in tests
    .build()
```

## Common Patterns

### Environment-Specific Configuration

```kotlin
fun createKurozoraKit(context: Context): KurozoraKit {
    val builder = KurozoraKit.Builder()
        .apiKey(getApiKey())
        .platform(AndroidPlatform)
    
    // Add caching only in production
    if (BuildConfig.BUILD_TYPE == "release") {
        builder.cacheManager(createCacheManager(context))
    }
    
    // Debug logging in development
    if (BuildConfig.DEBUG) {
        builder.logLevel(LogLevel.DEBUG)
    }
    
    return builder.build()
}
```

### Lazy Initialization

```kotlin
class MyApplication : Application() {
    val kurozoraKit by lazy {
        KurozoraKit.Builder()
            .apiKey(getString(R.string.api_key))
            .platform(AndroidPlatform)
            .cacheManager(createCacheManager(this))
            .build()
    }
}
```

### Singleton Pattern

```kotlin
object KurozoraManager {
    private var instance: KurozoraKit? = null
    
    fun initialize(context: Context, apiKey: String): KurozoraKit {
        if (instance == null) {
            instance = KurozoraKit.Builder()
                .apiKey(apiKey)
                .platform(AndroidPlatform)
                .cacheManager(createCacheManager(context))
                .build()
        }
        return instance!!
    }
    
    fun get(): KurozoraKit {
        return instance ?: throw IllegalStateException("Not initialized")
    }
}
```

## Best Practices

1. **Create Once**: Build your KurozoraKit instance once and reuse it
2. **Use Dependency Injection**: Let DI frameworks manage the lifecycle
3. **Environment Configuration**: Use different configs for debug/release
4. **Secure API Keys**: Never hardcode keys, use BuildConfig or env vars
5. **Enable Caching**: Use caching in production for better performance
6. **Appropriate Logging**: Use DEBUG for development, WARN for production
7. **Test Configuration**: Create minimal configs for unit tests

## Next Steps

- [Result Handling](result-handling) - Learn about Result type
- [Error Handling](error-handling) - Handle errors gracefully
- [Configuration](configuration) - Explore all configuration options
- [Authentication](authentication) - Set up authentication