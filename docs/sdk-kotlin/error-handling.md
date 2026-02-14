# Error Handling

KurozoraKit provides comprehensive error handling through the `KurozoraError` sealed class. This approach gives you detailed information about what went wrong and how to handle it.

## Error Types

KurozoraKit defines 8 specific error types for different failure scenarios:

### NetworkError

Occurs when network communication fails.

```kotlin
data class NetworkError(
    val code: Int,
    override val message: String
) : KurozoraError()
```

**Common Causes:**
- No internet connection
- Server unreachable
- Connection timeout
- DNS resolution failure

**HTTP Status Codes:**
- `408` - Request timeout
- `500` - Internal server error
- `502` - Bad gateway
- `503` - Service unavailable
- `504` - Gateway timeout

**Example:**

```kotlin
when (val result = kurozoraKit.show().getShows()) {
    is Result.Error -> {
        when (val error = result.error) {
            is KurozoraError.NetworkError -> {
                println("Network failed with code: ${error.code}")
                println("Message: ${error.message}")
                
                when (error.code) {
                    503 -> showMessage("Server is under maintenance")
                    else -> showMessage("Network error, please try again")
                }
            }
            else -> { /* handle other errors */ }
        }
    }
    is Result.Success -> { /* handle success */ }
}
```

### ApiError

Returned by the Kurozora API for business logic errors.

```kotlin
data class ApiError(
    val code: String,
    override val message: String
) : KurozoraError()
```

**Common Causes:**
- Invalid request parameters
- Resource state conflicts
- Business rule violations

**Example:**

```kotlin
when (val error = result.errorOrNull()) {
    is KurozoraError.ApiError -> {
        println("API Error Code: ${error.code}")
        println("Message: ${error.message}")
        
        when (error.code) {
            "INVALID_RATING" -> showMessage("Rating must be between 0 and 5")
            "ALREADY_RATED" -> showMessage("You already rated this show")
            else -> showMessage(error.message)
        }
    }
}
```

### AuthenticationError

Occurs when authentication fails or token is invalid.

```kotlin
data class AuthenticationError(
    override val message: String
) : KurozoraError()
```

**Common Causes:**
- Invalid API key
- Expired authentication token
- Missing authentication
- Invalid credentials

**Example:**

```kotlin
when (val error = result.errorOrNull()) {
    is KurozoraError.AuthenticationError -> {
        println("Auth failed: ${error.message}")
        
        // Clear stored credentials
        tokenProvider.clearToken()
        
        // Redirect to login
        navigateToLogin()
    }
}
```

### NotFoundError

Occurs when a requested resource doesn't exist.

```kotlin
data class NotFoundError(
    override val message: String
) : KurozoraError()
```

**HTTP Status Code:** `404`

**Common Causes:**
- Invalid resource ID
- Resource was deleted
- Incorrect endpoint

**Example:**

```kotlin
when (val error = result.errorOrNull()) {
    is KurozoraError.NotFoundError -> {
        println("Resource not found: ${error.message}")
        showMessage("Show not found")
        navigateBack()
    }
}
```

### RateLimitError

Occurs when API rate limit is exceeded.

```kotlin
data class RateLimitError(
    override val message: String,
    val retryAfter: Int? = null
) : KurozoraError()
```

**HTTP Status Code:** `429`

**Properties:**
- `retryAfter` - Seconds to wait before retrying (optional)

**Example:**

```kotlin
when (val error = result.errorOrNull()) {
    is KurozoraError.RateLimitError -> {
        val waitTime = error.retryAfter ?: 60
        println("Rate limited. Retry after $waitTime seconds")
        
        showMessage("Too many requests. Please wait $waitTime seconds")
        
        // Schedule retry
        viewModelScope.launch {
            delay(waitTime * 1000L)
            retryRequest()
        }
    }
}
```

### ValidationError

Occurs when input validation fails.

```kotlin
data class ValidationError(
    override val message: String
) : KurozoraError()
```

**Common Causes:**
- Invalid email format
- Password too short
- Required field missing
- Invalid parameter format

**Example:**

```kotlin
suspend fun signUp(email: String, username: String, password: String) {
    val result = kurozoraKit.auth().signUp(email, username, password)
    
    when (val error = result.errorOrNull()) {
        is KurozoraError.ValidationError -> {
            println("Validation failed: ${error.message}")
            
            when {
                error.message.contains("email") -> 
                    showFieldError("email", error.message)
                error.message.contains("password") -> 
                    showFieldError("password", error.message)
                else -> 
                    showMessage(error.message)
            }
        }
    }
}
```

### StorageError

Occurs when cache or storage operations fail.

```kotlin
data class StorageError(
    override val message: String
) : KurozoraError()
```

**Common Causes:**
- Disk full
- Permission denied
- I/O error
- Corrupted cache file

**Example:**

```kotlin
when (val error = result.errorOrNull()) {
    is KurozoraError.StorageError -> {
        println("Storage error: ${error.message}")
        
        // Try to clear cache
        kurozoraKit.cacheManager?.clear()
        
        // Retry without cache
        retryWithoutCache()
    }
}
```

### UnknownError

Catch-all for unexpected errors.

```kotlin
data class UnknownError(
    override val message: String,
    override val cause: Throwable? = null
) : KurozoraError()
```

**Properties:**
- `cause` - Original exception that caused the error

**Example:**

```kotlin
when (val error = result.errorOrNull()) {
    is KurozoraError.UnknownError -> {
        println("Unknown error: ${error.message}")
        
        // Log full stack trace
        error.cause?.printStackTrace()
        
        // Report to crash analytics
        analytics.logError(error)
        
        showMessage("An unexpected error occurred")
    }
}
```

## Comprehensive Error Handling

Handle all error types systematically:

```kotlin
fun handleError(error: KurozoraError) {
    when (error) {
        is KurozoraError.NetworkError -> {
            println("Network error: ${error.message} (Code: ${error.code})")
            showRetryOption("Check your internet connection")
        }
        
        is KurozoraError.ApiError -> {
            println("API error: ${error.code} - ${error.message}")
            showMessage(error.message)
        }
        
        is KurozoraError.AuthenticationError -> {
            println("Auth error: ${error.message}")
            clearCredentials()
            navigateToLogin()
        }
        
        is KurozoraError.NotFoundError -> {
            println("Not found: ${error.message}")
            showMessage("Resource not found")
            navigateBack()
        }
        
        is KurozoraError.RateLimitError -> {
            println("Rate limited: ${error.message}")
            val waitTime = error.retryAfter ?: 60
            showMessage("Please wait $waitTime seconds")
            scheduleRetry(waitTime)
        }
        
        is KurozoraError.ValidationError -> {
            println("Validation error: ${error.message}")
            showFormErrors(error.message)
        }
        
        is KurozoraError.StorageError -> {
            println("Storage error: ${error.message}")
            clearCache()
            showMessage("Storage error, cache cleared")
        }
        
        is KurozoraError.UnknownError -> {
            println("Unknown error: ${error.message}")
            error.cause?.printStackTrace()
            reportError(error)
            showMessage("An unexpected error occurred")
        }
    }
}
```

## Error Recovery Strategies

### Retry with Exponential Backoff

```kotlin
suspend fun <T> retryWithBackoff(
    maxRetries: Int = 3,
    initialDelay: Long = 1000,
    maxDelay: Long = 10000,
    factor: Double = 2.0,
    block: suspend () -> Result<T>
): Result<T> {
    var currentDelay = initialDelay
    
    repeat(maxRetries) { attempt ->
        val result = block()
        
        when (val error = result.errorOrNull()) {
            is KurozoraError.NetworkError -> {
                if (attempt < maxRetries - 1) {
                    delay(currentDelay)
                    currentDelay = (currentDelay * factor).toLong().coerceAtMost(maxDelay)
                } else {
                    return result
                }
            }
            else -> return result
        }
    }
    
    return block()
}

// Usage
val result = retryWithBackoff {
    kurozoraKit.show().getShows(limit = 20)
}
```

### Fallback to Cache

```kotlin
suspend fun loadShowsWithFallback(): List<Show> {
    val result = kurozoraKit.show().getShows(limit = 20)
    
    return when (result) {
        is Result.Success -> result.data.data
        is Result.Error -> {
            when (result.error) {
                is KurozoraError.NetworkError -> {
                    // Try to load from cache
                    loadFromCache() ?: emptyList()
                }
                else -> emptyList()
            }
        }
    }
}
```

### Silent Retry with Notification

```kotlin
class ShowsViewModel : ViewModel() {
    private val _retrying = MutableStateFlow(false)
    val retrying: StateFlow<Boolean> = _retrying
    
    suspend fun loadShowsWithAutoRetry() {
        val result = kurozoraKit.show().getShows(limit = 20)
        
        if (result.isError) {
            val error = result.errorOrNull()!!
            
            if (error is KurozoraError.NetworkError) {
                _retrying.value = true
                
                delay(3000)
                
                val retryResult = kurozoraKit.show().getShows(limit = 20)
                _retrying.value = false
                
                if (retryResult.isSuccess) {
                    updateShows(retryResult.getOrNull()!!.data)
                } else {
                    showError("Failed after retry")
                }
            }
        }
    }
}
```

## User-Friendly Error Messages

Convert technical errors to user-friendly messages:

```kotlin
fun getUserFriendlyMessage(error: KurozoraError): String {
    return when (error) {
        is KurozoraError.NetworkError -> {
            when (error.code) {
                in 500..599 -> "Our servers are having issues. Please try again later."
                408 -> "Request timed out. Please check your connection."
                else -> "Network error. Please check your internet connection."
            }
        }
        
        is KurozoraError.AuthenticationError -> {
            "Your session has expired. Please login again."
        }
        
        is KurozoraError.NotFoundError -> {
            "The content you're looking for doesn't exist."
        }
        
        is KurozoraError.RateLimitError -> {
            val waitTime = error.retryAfter ?: 60
            "You're making too many requests. Please wait $waitTime seconds."
        }
        
        is KurozoraError.ValidationError -> {
            error.message // These are usually user-friendly already
        }
        
        is KurozoraError.ApiError -> {
            error.message // API errors are usually descriptive
        }
        
        is KurozoraError.StorageError -> {
            "Unable to save data locally. Please check your storage."
        }
        
        is KurozoraError.UnknownError -> {
            "Something went wrong. Please try again."
        }
    }
}

// Usage
when (result) {
    is Result.Error -> {
        val friendlyMessage = getUserFriendlyMessage(result.error)
        showSnackbar(friendlyMessage)
    }
    is Result.Success -> { /* handle success */ }
}
```

## Logging Errors

Log errors for debugging and analytics:

```kotlin
fun logError(error: KurozoraError, context: String) {
    val errorType = error::class.simpleName
    val message = error.message
    
    // Log to console in debug
    if (BuildConfig.DEBUG) {
        println("[$context] $errorType: $message")
        
        if (error is KurozoraError.UnknownError) {
            error.cause?.printStackTrace()
        }
    }
    
    // Log to analytics
    analytics.logEvent("error_occurred") {
        param("error_type", errorType ?: "Unknown")
        param("error_message", message ?: "No message")
        param("context", context)
        
        if (error is KurozoraError.NetworkError) {
            param("http_code", error.code.toString())
        }
    }
    
    // Send to crash reporting (only for unexpected errors)
    if (error is KurozoraError.UnknownError) {
        crashlytics.recordException(error)
    }
}

// Usage
when (result) {
    is Result.Error -> {
        logError(result.error, "LoadShows")
        handleError(result.error)
    }
    is Result.Success -> { /* handle success */ }
}
```

## UI Integration

### Compose Error Display

```kotlin
@Composable
fun ErrorView(
    error: KurozoraError,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = when (error) {
                is KurozoraError.NetworkError -> Icons.Default.CloudOff
                is KurozoraError.AuthenticationError -> Icons.Default.Lock
                is KurozoraError.NotFoundError -> Icons.Default.SearchOff
                else -> Icons.Default.Error
            },
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.error
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = getUserFriendlyMessage(error),
            style = MaterialTheme.typography.bodyLarge,
            textAlign = TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Button(onClick = onRetry) {
            Text("Retry")
        }
    }
}
```

### Snackbar Error Notification

```kotlin
@Composable
fun ShowsScreen(viewModel: ShowsViewModel = viewModel()) {
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    
    LaunchedEffect(Unit) {
        viewModel.errorFlow.collect { error ->
            scope.launch {
                snackbarHostState.showSnackbar(
                    message = getUserFriendlyMessage(error),
                    actionLabel = "Retry",
                    duration = SnackbarDuration.Long
                )
            }
        }
    }
    
    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->
        // Content
    }
}
```

## Testing Error Handling

Test that your app handles errors correctly:

```kotlin
@Test
fun \`test network error handling\`() = runTest {
    // Given
    val error = KurozoraError.NetworkError(503, "Service unavailable")
    coEvery { mockRepository.getShows() } returns Result.Error(error)
    
    // When
    viewModel.loadShows()
    
    // Then
    val uiState = viewModel.uiState.value
    assertTrue(uiState is UiState.Error)
    assertEquals("Our servers are having issues", uiState.message)
}

@Test
fun \`test authentication error clears token\`() = runTest {
    // Given
    val error = KurozoraError.AuthenticationError("Token expired")
    coEvery { mockRepository.getShows() } returns Result.Error(error)
    
    // When
    viewModel.loadShows()
    
    // Then
    verify { mockTokenProvider.clearToken() }
    verify { mockNavigator.navigateToLogin() }
}

@Test
fun \`test rate limit error schedules retry\`() = runTest {
    // Given
    val error = KurozoraError.RateLimitError("Too many requests", retryAfter = 30)
    coEvery { mockRepository.getShows() } returns Result.Error(error)
    
    // When
    viewModel.loadShows()
    
    // Then
    assertEquals(30, viewModel.retryAfterSeconds)
    assertTrue(viewModel.isSchedulingRetry)
}
```

## Best Practices

1. **Always Handle Errors**: Never ignore the error case in Result
2. **Provide Context**: Log errors with context about what operation failed
3. **User-Friendly Messages**: Convert technical errors to understandable messages
4. **Appropriate Retry**: Only retry transient errors like network issues
5. **Clear State**: Clear authentication on auth errors
6. **Graceful Degradation**: Provide fallbacks when possible
7. **Analytics**: Track errors for monitoring and debugging
8. **Test Error Paths**: Write tests for error scenarios

## Anti-Patterns

### Don't Swallow Errors

```kotlin
// Bad
when (result) {
    is Result.Success -> updateUI(result.data)
    is Result.Error -> { /* ignored */ }
}

// Good
when (result) {
    is Result.Success -> updateUI(result.data)
    is Result.Error -> handleError(result.error)
}
```

### Don't Show Stack Traces to Users

```kotlin
// Bad
showMessage(error.toString()) // Shows technical error

// Good
showMessage(getUserFriendlyMessage(error))
```

### Don't Retry Indefinitely

```kotlin
// Bad
while (true) {
    val result = loadData()
    if (result.isSuccess) break
    delay(1000)
}

// Good
repeat(3) { attempt ->
    val result = loadData()
    if (result.isSuccess) return result
    if (attempt < 2) delay(1000)
}
```

## Next Steps

- [Result Handling](result-handling) - Learn about Result type
<!-- - [Best Practices](best-practices/error-handling) - Error handling patterns
- [API Client](api-client/http-client) - Understand retry logic -->