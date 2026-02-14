# Architecture

KurozoraKit is built with a clean, modular architecture that separates concerns and promotes maintainability. This guide explains the overall architecture and design decisions.

## Overview

KurozoraKit follows the **Repository Pattern** with a multi-layered architecture:

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│    (Your Android App / ViewModels)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          KurozoraKit API                │
│    (Main SDK Interface / Facade)        │
└──────────────┬──────────────────────────┘
               │
     ┌─────────┴─────────┐
     │                   │
┌────▼─────┐      ┌─────▼──────┐
│Repositories│     │ Cache Mgr  │
│  Layer    │     │            │
└────┬──────┘     └─────┬──────┘
     │                   │
┌────▼──────────────────▼──────┐
│      API Client Layer         │
│   (HTTP / Serialization)      │
└───────────────┬───────────────┘
                │
       ┌────────┴────────┐
       │                 │
┌──────▼──────┐   ┌─────▼──────┐
│  Data Models │   │   Shared   │
│              │   │  Utilities │
└──────────────┘   └────────────┘
```

## Module Structure

KurozoraKit is organized into 5 main modules:

### 1. Core Module

**Purpose**: Main entry point and SDK configuration

**Key Classes**:
- `KurozoraKit`: Main SDK facade with builder pattern
- `KurozoraApi`: API version configuration
- `KKServices`: Additional services (secure storage)

**Responsibilities**:
- SDK initialization and configuration
- Repository factory/provider
- Global settings management

**Example**:

```kotlin
// KurozoraKit.kt
class KurozoraKit private constructor(
    private val apiClient: KurozoraApiClient,
    private val showRepository: ShowRepository,
    private val literatureRepository: LiteratureRepository,
    // ... other repositories
) {
    fun show(): ShowRepository = showRepository
    fun literature(): LiteratureRepository = literatureRepository
    // ... accessor methods
    
    class Builder {
        fun apiKey(key: String) = apply { ... }
        fun platform(platform: Platform) = apply { ... }
        fun cacheManager(manager: CacheManager) = apply { ... }
        fun build(): KurozoraKit = ...
    }
}
```

### 2. API Module

**Purpose**: HTTP communication and network layer

**Key Classes**:

- `KurozoraApiClient`: HTTP client with Ktor
- `KKEndpoint`: Type-safe endpoint definitions
- `TokenProvider`: Authentication token management
- `Platform`: Platform information interface


**Responsibilities**:

- HTTP request/response handling
- Authentication token injection
- Automatic retry with exponential backoff
- Request logging
- Error transformation


**Features**:

- Automatic Bearer token authentication
- Content negotiation (JSON)
- Request/response interceptors
- Timeout configuration
- Retry logic


**Example**:

```kotlin
// KurozoraApiClient.kt
class KurozoraApiClient(
    val baseUrl: String,
    private val apiKey: String,
    val tokenProvider: TokenProvider?,
    val cacheManager: CacheManager?,
    val platform: Platform
) {
    val httpClient = HttpClient {
        install(ContentNegotiation) { json(...) }
        install(Logging) { ... }
        install(Auth) { bearer { ... } }
        install(HttpRequestRetry) { ... }
    }
    
    suspend inline fun <reified T> get(
        endpoint: KKEndpoint,
        parameters: Map<String, String> = emptyMap(),
        ttlMillis: Long = 300000,
        forceRefresh: Boolean = false
    ): Result<T>
}
```

### 3. Data Module

**Purpose**: Domain models and repository implementations

**Structure**:

```plaintext
data/
├── models/                 # Data models
│   ├── show/              # Show-related models
│   ├── literature/        # Literature models
│   ├── game/              # Game models
│   ├── character/         # Character models
│   ├── person/            # Person models
│   ├── user/              # User models
│   ├── search/            # Search and filters
│   └── ...
├── repositories/          # Repository implementations
│   ├── show/             # ShowRepository
│   ├── literature/       # LiteratureRepository
│   ├── auth/             # AuthRepository
│   └── ...
├── enums/                # Enumerations
│   ├── ShowType.kt
│   ├── ShowStatus.kt
│   └── ...
└── DefaultTokenProvider.kt
```

**Responsibilities**:

- Define domain models with Kotlin Serialization
- Implement repository interfaces
- Handle data transformation
- Manage relationships between entities


**Repository Pattern**:

```kotlin
// Repository interface
interface ShowRepository {
    suspend fun getShows(
        next: String? = null,
        limit: Int = 20,
        filter: ShowFilter? = null
    ): Result<ShowIdentityResponse>
    
    suspend fun getShow(
        id: String,
        relationships: List<String> = emptyList()
    ): Result<ShowResponse>
    
    // ... more methods
}

// Implementation
class ShowRepositoryImpl(
    private val apiClient: KurozoraApiClient
) : ShowRepository {
    override suspend fun getShows(
        next: String?,
        limit: Int,
        filter: ShowFilter?
    ): Result<ShowIdentityResponse> {
        val endpoint = next?.let { KKEndpoint.Url(it) } 
                      ?: KKEndpoint.Show.Index()
        return apiClient.get(endpoint, parameters)
    }
}
```

### 4. Cache Module

**Purpose**: Multi-tier caching system

**Key Classes**:

- `Cache`: Cache interface
- `CacheManager`: Multi-tier cache coordinator
- `InMemoryCache`: Fast in-memory cache
- `FileBasedCache`: Persistent disk cache
- `CacheEntry`: Cache entry model
- `CacheStats`: Statistics tracking


**Architecture**:

```plaintext
┌──────────────────────────────────┐
│        CacheManager              │
│  (Coordinates multiple caches)   │
└────────┬─────────────────────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼─────┐
│Memory │ │  File  │
│Cache  │ │ Cache  │
└───────┘ └────────┘
 (Fast)    (Persistent)
```

**Features**:

- **Cache Promotion**: Data found in lower tiers is promoted to higher tiers
- **Automatic Eviction**: Expired entries are removed automatically
- **Statistics**: Track hits, misses, and performance
- **Configurable TTL**: Set custom expiration per request
- **Size Limits**: Prevent unbounded growth


**Example**:

```kotlin
// Multi-tier cache with promotion
class CacheManager(private val caches: List<Cache>) {
    suspend fun get(key: String): CacheEntry? {
        for ((index, cache) in caches.withIndex()) {
            val entry = cache.get(key)
            if (entry != null) {
                // Promote to higher-tier caches
                for (i in 0 until index) {
                    caches[i].put(entry)
                }
                return entry
            }
        }
        return null
    }
}
```

### 5. Shared Module

**Purpose**: Common utilities and types

**Key Components**:

- `Result<T>`: Result monad for error handling
- `KurozoraError`: Error types
- `KurozoraLogger`: Logging utilities
- `MetaResponse`: API metadata
- `UserAgent`: User agent


**Result Type**:

```kotlin
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val error: KurozoraError) : Result<Nothing>()
    
    val isSuccess: Boolean
    val isError: Boolean
    
    fun getOrNull(): T?
    fun errorOrNull(): KurozoraError?
    fun <R> map(transform: (T) -> R): Result<R>
    fun onSuccess(block: (T) -> Unit): Result<T>
    fun onError(block: (KurozoraError) -> Unit): Result<T>
}
```

## Design Patterns

### 1. Builder Pattern

Used for SDK configuration with fluent API:

```kotlin
val kurozoraKit = KurozoraKit.Builder()
    .apiKey("key")
    .platform(platform)
    .userAgent(userAgent)
    .logLevel(LogLevel.INFO)
    .cacheManager(cacheManager)
    .build()
```

**Benefits**:

- Flexible configuration
- Optional parameters with defaults
- Immutable result
- Type-safe configuration


### 2. Repository Pattern

Separates data access logic from business logic:

```kotlin
interface ShowRepository {
    suspend fun getShows(...): Result<ShowIdentityResponse>
}

class ShowRepositoryImpl(
    private val apiClient: KurozoraApiClient
) : ShowRepository {
    override suspend fun getShows(...) = ...
}
```

**Benefits**:

- Testability (easy to mock)
- Separation of concerns
- Single responsibility
- Flexibility to change data sources


### 3. Result Monad

Type-safe error handling without exceptions:

```kotlin
val result: Result<ShowResponse> = repository.getShow("1")

when (result) {
    is Result.Success -> println(result.data)
    is Result.Error -> println(result.error)
}
```

**Benefits**:

- Explicit error handling
- No silent failures
- Composable with `map()`, `onSuccess()`, `onError()`
- Type-safe


### 4. Sealed Classes

Type-safe endpoint definitions:

```kotlin
sealed class KKEndpoint(val path: String) {
    sealed class Show(path: String) : KKEndpoint(path) {
        class Details(showId: String) : Show("anime/$showId")
        class Reviews(showId: String) : Show("anime/$showId/reviews")
    }
}
```

**Benefits**:

- Compile-time safety
- Exhaustive when expressions
- Type hierarchy
- IDE autocomplete


### 5. Dependency Injection

Dependencies passed through constructor:

```kotlin
class ShowRepositoryImpl(
    private val apiClient: KurozoraApiClient // Injected
) : ShowRepository
```

**Benefits**:

- Testability
- Loose coupling
- Easy to swap implementations
- Works with DI frameworks (Hilt, Koin)


## Data Flow

### Request Flow

```plaintext
User Action
    │
    ▼
ViewModel calls Repository
    │
    ▼
Repository calls ApiClient
    │
    ▼
ApiClient checks Cache ──► Cache Hit ──► Return cached data
    │
    │ Cache Miss
    ▼
ApiClient makes HTTP request
    │
    ▼
Ktor Client with interceptors
    │
    ▼
Server Response
    │
    ▼
JSON Deserialization
    │
    ▼
ApiClient caches response
    │
    ▼
Return Result<T> to Repository
    │
    ▼
Return Result<T> to ViewModel
    │
    ▼
ViewModel updates UI State
    │
    ▼
Compose recomposes UI
```

### Error Flow

```plaintext
Network/Server Error
    │
    ▼
HttpResponseValidator catches error
    │
    ▼
Transform to KurozoraError
    │
    ▼
Wrap in Result.Error
    │
    ▼
Return to caller
    │
    ▼
Handle with when/onError
```

## Threading Model

KurozoraKit uses Kotlin Coroutines for async operations:

- All repository methods are `suspend` functions
- API calls run on `Dispatchers.IO` (handled by Ktor)
- Cache operations are thread-safe
- No blocking operations on main thread


**Example**:

```kotlin
viewModelScope.launch {
    // Runs on Dispatchers.Main
    val result = kurozoraKit.show().getShows()
    // API call automatically switches to IO dispatcher
    
    when (result) {
        is Result.Success -> updateUI(result.data)
        is Result.Error -> showError(result.error)
    }
}
```

## Performance Considerations

### 1. Caching Strategy

Multi-tier caching minimizes network requests:

```plaintext
Request → Memory Cache (μs) → File Cache (ms) → Network (s)
```

### 2. Connection Pooling

Ktor client maintains HTTP connection pool for efficiency.

### 3. JSON Parsing

Kotlinx Serialization provides fast, compile-time safe parsing.

### 4. Coroutines

Non-blocking async operations prevent UI freezing.

### 5. Pagination

All list endpoints support pagination to reduce data transfer:

```kotlin
// Initial request
val page1 = repository.getShows(limit = 20)

// Next page using cursor
val page2 = repository.getShows(next = page1.data.links.next)
```

## Testing Architecture

KurozoraKit is designed for testability:

### Repository Testing

```kotlin
class ShowRepositoryTest {
    private val mockApiClient = mockk<KurozoraApiClient>()
    private val repository = ShowRepositoryImpl(mockApiClient)
    
    @Test
    fun `getShows returns success`() = runTest {
        // Given
        coEvery { mockApiClient.get(...) } returns 
            Result.Success(mockResponse)
        
        // When
        val result = repository.getShows()
        
        // Then
        assertTrue(result.isSuccess)
    }
}
```

### Integration Testing

```kotlin
@Test
fun `fetch shows end-to-end`() = runTest {
    val kurozoraKit = KurozoraKit.Builder()
        .apiKey(TEST_API_KEY)
        .platform(TestPlatform)
        .build()
    
    val result = kurozoraKit.show().getShows(limit = 5)
    
    assertTrue(result.isSuccess)
    assertEquals(5, result.getOrNull()?.data?.size)
}
```

## Next Steps

- [Builder Pattern](builder-pattern) - Deep dive into configuration
- [Result Handling](result-handling) - Learn about Result type
<!-- - [Caching Architecture](caching/architecture) - Understand caching system -->
<!-- - [Best Practices](best-practices/error-handling) - Follow recommended patterns -->