# Configuration

KurozoraKit provides a flexible builder pattern for configuration. This guide covers all available configuration options and best practices.

## Basic Configuration

The minimum configuration requires an API key and platform information:

```kotlin
val kurozoraKit = KurozoraKit.Builder()
    .apiKey("your-api-key")
    .platform(platformInfo)
    .userAgent(userAgent)
    .build()
```

## Configuration Options

### API Endpoint

Customize the API endpoint (default is production):

```kotlin
KurozoraKit.Builder()
    .apiEndpoint("https://api.kurozora.app/v1") // Default
    .build()
```

For testing or development environments:

```kotlin
KurozoraKit.Builder()
    .apiEndpoint("https://staging-api.kurozora.app/v1")
    .build()
```

### Platform Information

Platform information is sent with every request for analytics and debugging:

```kotlin
object AndroidPlatform : Platform {
    override val platform = "Android"
    override val platformVersion = Build.VERSION.RELEASE // "14"
    override val deviceVendor = Build.MANUFACTURER // "Samsung"
    override val deviceModel = Build.MODEL // "SM-G998B"
}

KurozoraKit.Builder()
    .platform(AndroidPlatform)
    .build()
```

### User Agent

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

### Token Provider

For authenticated requests, provide a custom token provider:

```kotlin
class MyTokenProvider : TokenProvider {
    private var currentUser: AccountUser? = null
    
    override suspend fun saveToken(user: AccountUser) {
        currentUser = user
        // Save to secure storage
        saveToEncryptedSharedPreferences(user)
    }
    
    override suspend fun getToken(): String? {
        return currentUser?.token
    }
}

KurozoraKit.Builder()
    .tokenProvider(MyTokenProvider())
    .build()
```

<!-- ### Logging

Configure logging level for debugging:

```kotlin
import kurozorakit.shared.logging.LogLevel

KurozoraKit.Builder()
    .logLevel(LogLevel.DEBUG) // NONE, ERROR, WARN, INFO, DEBUG, ALL
    .build()
```

Log levels:

- `NONE`: No logging
- `ERROR`: Only errors
- `WARN`: Warnings and errors
- `INFO`: General information (default)
- `DEBUG`: Detailed debug information
- `ALL`: Everything including HTTP traffic -->


### Retry Configuration

Configure automatic retry behavior for failed requests:

```kotlin
KurozoraKit.Builder()
    .maxRetries(3) // Number of retry attempts (default: 3)
    .initialBackoffDelayMs(1000) // Initial delay in ms (default: 1000)
    .maxBackoffDelayMs(30000) // Maximum delay in ms (default: 30000)
    .backoffFactor(2.0) // Exponential factor (default: 2.0)
    .build()
```

Retry strategy with exponential backoff:

- 1st retry: 1 second delay
- 2nd retry: 2 seconds delay
- 3rd retry: 4 seconds delay
- Maximum delay capped at 30 seconds


### Cache Manager

Enable caching for improved performance(i don't use and not recommended):

```kotlin
import kurozorakit.cache.*
import java.io.File

// Create cache configuration
val cacheConfig = CacheConfig(
    defaultTtlMillis = 3600000, // 1 hour
    maxSize = 100 * 1024 * 1024, // 100 MB
    maxEntries = 1000,
    enableAutoEviction = true,
    evictionIntervalMillis = 300000 // 5 minutes
)

// Create cache layers
val memoryCache = InMemoryCache(config = cacheConfig)
val fileCache = FileBasedCache(
    cacheDir = File(context.cacheDir, "kurozora"),
    config = cacheConfig
)

// Create cache manager with multi-tier caching
val cacheManager = CacheManager(
    caches = listOf(memoryCache, fileCache)
)

KurozoraKit.Builder()
    .cacheManager(cacheManager)
    .build()
```

## Complete Configuration Example

Here's a production-ready configuration with all options:

```kotlin
import android.content.Context
import kurozorakit.api.Platform
import kurozorakit.cache.*
import kurozorakit.core.KurozoraKit
import kurozorakit.shared.logging.LogLevel
import java.io.File

class KurozoraConfig(private val context: Context) {
    
    // Platform info
    private object AppPlatform : Platform {
        override val platform = "Android"
        override val platformVersion = Build.VERSION.RELEASE
        override val deviceVendor = Build.MANUFACTURER
        override val deviceModel = Build.MODEL
    }

    // User agent
    private val userAgent = UserAgent(
        appName = "your_app_name", 
        appID = "com.username.kurozora", 
        platformName = "your_platform_name", 
        platformVersion = "your_platform_version"
    )
    
    // Token provider
    private val tokenProvider = MyTokenProvider(context)
    
    // Cache configuration
    private fun createCacheManager(): CacheManager {
        val cacheConfig = CacheConfig(
            defaultTtlMillis = 3600000, // 1 hour
            maxSize = 100 * 1024 * 1024, // 100 MB
            maxEntries = 1000,
            enableAutoEviction = true,
            evictionIntervalMillis = 300000 // 5 minutes
        )
        
        val memoryCache = InMemoryCache(config = cacheConfig)
        val fileCache = FileBasedCache(
            cacheDir = File(context.cacheDir, "kurozora"),
            config = cacheConfig
        )
        
        return CacheManager(caches = listOf(memoryCache, fileCache))
    }
    
    // Build KurozoraKit instance
    fun build(apiKey: String): KurozoraKit {
        return KurozoraKit.Builder()
            .apiEndpoint("https://api.kurozora.app/v1")
            .apiKey(apiKey)
            .platform(AppPlatform)
            .userAgent(userAgent)
            .tokenProvider(tokenProvider)
            .logLevel(if (BuildConfig.DEBUG) LogLevel.DEBUG else LogLevel.INFO)
            .maxRetries(3)
            .initialBackoffDelayMs(1000)
            .maxBackoffDelayMs(30000)
            .backoffFactor(2.0)
            .cacheManager(createCacheManager())
            .build()
    }
}

// Usage in Application class
class MyApplication : Application() {
    lateinit var kurozoraKit: KurozoraKit
        private set
    
    override fun onCreate() {
        super.onCreate()
        
        kurozoraKit = KurozoraConfig(this)
            .build(apiKey = getString(R.string.kurozora_api_key))
    }
}
```

::: warning
Never hardcode authentication tokens in source code. Use Android's `EncryptedSharedPreferences` or a secure token manager. Details below in [best practices](#_2-store-api-keys-securely)
:::


## Environment-Specific Configuration

Use different configurations for debug and release builds:

```kotlin
fun createKurozoraKit(context: Context): KurozoraKit {
    return KurozoraKit.Builder()
        .apiKey(getApiKey())
        .platform(AppPlatform)
        .userAgent(userAgent)
        .logLevel(getLogLevel())
        .cacheManager(createCacheManager(context))
        .build()
}

private fun getApiKey(): String {
    return if (BuildConfig.DEBUG) {
        BuildConfig.KUROZORA_DEV_API_KEY
    } else {
        BuildConfig.KUROZORA_PROD_API_KEY
    }
}

private fun getLogLevel(): LogLevel {
    return if (BuildConfig.DEBUG) {
        LogLevel.DEBUG
    } else {
        LogLevel.WARN
    }
}
```

## Configuration with Dependency Injection

### Hilt Example

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object KurozoraModule {
    
    @Provides
    @Singleton
    fun providePlatform(): Platform = object : Platform {
        override val platform = "Android"
        override val platformVersion = Build.VERSION.RELEASE
        override val deviceVendor = Build.MANUFACTURER
        override val deviceModel = Build.MODEL
    }
    
    @Provides
    @Singleton
    fun provideUserAgent(): UserAgent {
        return UserAgent(
            appName = "your_app_name", 
            appID = "com.username.kurozora", 
            platformName = "your_platform_name", 
            platformVersion = "your_platform_version"
        )
    }

    @Provides
    @Singleton
    fun provideTokenProvider(
        @ApplicationContext context: Context
    ): TokenProvider {
        return MyTokenProvider(context)
    }
    
    @Provides
    @Singleton
    fun provideCacheManager(
        @ApplicationContext context: Context
    ): CacheManager {
        val cacheConfig = CacheConfig(
            defaultTtlMillis = 3600000,
            maxSize = 100 * 1024 * 1024,
            maxEntries = 1000
        )
        
        return CacheManager(
            caches = listOf(
                InMemoryCache(config = cacheConfig),
                FileBasedCache(
                    cacheDir = File(context.cacheDir, "kurozora"),
                    config = cacheConfig
                )
            )
        )
    }
    
    @Provides
    @Singleton
    fun provideKurozoraKit(
        platform: Platform,
        userAgent: UserAgent,
        tokenProvider: TokenProvider,
        cacheManager: CacheManager
    ): KurozoraKit {
        return KurozoraKit.Builder()
            .apiKey(BuildConfig.KUROZORA_API_KEY)
            .platform(platform)
            .userAgent(userAgent)
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
    
    single<Platform> {
        object : Platform {
            override val platform = "Android"
            override val platformVersion = Build.VERSION.RELEASE
            override val deviceVendor = Build.MANUFACTURER
            override val deviceModel = Build.MODEL
        }
    }
    
    single<TokenProvider> { MyTokenProvider(androidContext()) }

    single<UserAgent> {
        UserAgent(
            appName = "your_app_name", 
            appID = "com.username.kurozora", 
            platformName = "your_platform_name", 
            platformVersion = "your_platform_version"
        )
    }
    
    single<CacheManager> {
        val cacheConfig = CacheConfig(
            defaultTtlMillis = 3600000,
            maxSize = 100 * 1024 * 1024
        )
        
        CacheManager(
            caches = listOf(
                InMemoryCache(config = cacheConfig),
                FileBasedCache(
                    cacheDir = File(androidContext().cacheDir, "kurozora"),
                    config = cacheConfig
                )
            )
        )
    }
    
    single<KurozoraKit> {
        KurozoraKit.Builder()
            .apiKey(getProperty("kurozora.apiKey"))
            .platform(get())
            .userAgent(get())
            .tokenProvider(get())
            .cacheManager(get())
            .build()
    }
}
```

## Best Practices

### 1. Use a Singleton

Create one KurozoraKit instance and reuse it throughout your app:

```kotlin
object KurozoraManager {
    private lateinit var instance: KurozoraKit
    
    fun initialize(context: Context, apiKey: String) {
        instance = KurozoraConfig(context).build(apiKey)
    }
    
    fun get(): KurozoraKit = instance
}
```

### 2. Store API Keys Securely

Never hardcode API keys. Use:

- BuildConfig fields
- gradle.properties
- Environment variables
- Remote config


```kotlin
// build.gradle.kts
android {
    defaultConfig {
        buildConfigField("String", "KUROZORA_API_KEY", "\"${project.findProperty("kurozora.apiKey")}\"")
    }
}

// gradle.properties (not committed to Git)
kurozora.apiKey=your-api-key-here
```

### 3. Enable Caching

Always enable caching in production for better performance:

```kotlin
if (BuildConfig.BUILD_TYPE == "release") {
    builder.cacheManager(createCacheManager())
}
```

### 4. Appropriate Log Levels

Use different log levels for different builds:

```kotlin
.logLevel(
    when {
        BuildConfig.DEBUG -> LogLevel.DEBUG
        BuildConfig.BUILD_TYPE == "staging" -> LogLevel.INFO
        else -> LogLevel.WARN
    }
)
```

### 5. Handle Configuration Changes

Ensure your configuration survives configuration changes:

```kotlin
class MainActivity : ComponentActivity() {
    private val kurozoraKit by lazy {
        (application as MyApplication).kurozoraKit
    }
}
```