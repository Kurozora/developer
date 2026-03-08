# Result Handling

KurozoraKit uses a `Result<T>` type for type-safe error handling. This approach provides explicit error handling without exceptions, making your code more predictable and safer.

## Overview

The `Result<T>` type is a sealed class with two possible states:

- `Result.Success<T>` - Contains successful data
- `Result.Error` - Contains error information

Every repository method returns a `Result<T>`, ensuring you always handle both success and failure cases.

## Result Type Structure

```kotlin
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val error: KurozoraError) : Result<Nothing>()
    
    val isSuccess: Boolean
    val isError: Boolean
    
    fun getOrNull(): T?
    fun errorOrNull(): KurozoraError?
}
```

## Basic Usage

### Pattern Matching with when

The most common way to handle results:

```kotlin
suspend fun loadShows() {
    val result = kurozoraKit.show().getShows(limit = 20)
    
    when (result) {
        is Result.Success -> {
            val shows = result.data.data
            println("Loaded ${shows.size} shows")
            shows.forEach { show ->
                println(show.attributes.title)
            }
        }
        is Result.Error -> {
            println("Error: ${result.error.message}")
            handleError(result.error)
        }
    }
}
```

### Checking Result State

```kotlin
val result = kurozoraKit.show().getShow("1")

if (result.isSuccess) {
    val show = result.getOrNull()!!
    displayShow(show)
}

if (result.isError) {
    val error = result.errorOrNull()!!
    showErrorMessage(error.message)
}
```

## Functional Operators

Result provides functional operators for elegant error handling:

### map()

Transform successful data without handling errors:

```kotlin
val result = kurozoraKit.show().getShows(limit = 20)

val titles: Result<List<String>> = result.map { response ->
    response.data.map { it.attributes.title }
}

when (titles) {
    is Result.Success -> println(titles.data)
    is Result.Error -> println("Error: ${titles.error}")
}
```

### flatMap() (not included yet)

Chain operations that return Results:

```kotlin
suspend fun loadShowAndReviews(showId: String): Result<Pair<Show, List<Review>>> {
    return kurozoraKit.show().getShow(showId).flatMap { showResponse ->
        kurozoraKit.show().getShowReviews(showId).map { reviewsResponse ->
            showResponse.data.first() to reviewsResponse.data
        }
    }
}
```

### onSuccess()

Execute code only on success (doesn't change Result):

```kotlin
kurozoraKit.show().getShows(limit = 20)
    .onSuccess { response ->
        println("Loaded ${response.data.size} shows")
        analytics.logEvent("shows_loaded", response.data.size)
    }
    .onError { error ->
        println("Failed: ${error.message}")
        analytics.logError(error)
    }
```

### onError()

Execute code only on error (doesn't change Result):

```kotlin
val result = kurozoraKit.show().getShow("invalid-id")
    .onError { error ->
        logError(error)
        showToast("Failed to load show")
    }
```

### getOrNull()

Get data or null if error:

```kotlin
val show = kurozoraKit.show().getShow("1").getOrNull()

if (show != null) {
    displayShow(show.data.first())
} else {
    showPlaceholder()
}
```

### getOrDefault()

Get data or provide default:

```kotlin
val shows = kurozoraKit.show().getShows(limit = 20)
    .getOrNull()?.data ?: emptyList()

displayShows(shows) // Always have a list to display
```

### getOrThrow()

Get data or throw exception:

```kotlin
try {
    val show = kurozoraKit.show().getShow("1").getOrThrow()
    displayShow(show.data.first())
} catch (e: KurozoraError) {
    handleError(e)
}
```

## Error Information

The `Result.Error` contains a `KurozoraError` with detailed information:

```kotlin
when (val result = kurozoraKit.show().getShow("1")) {
    is Result.Error -> {
        val error = result.error
        
        println("Message: ${error.message}")
        println("HTTP Status: ${error.statusCode}")
        println("Error Code: ${error.errorCode}")
        
        // Original exception if available
        error.cause?.printStackTrace()
    }
    is Result.Success -> { /* handle success */ }
}
```

## UI State Management

### With Jetpack Compose

```kotlin
@Composable
fun ShowsScreen(viewModel: ShowsViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsState()
    
    when (uiState) {
        is UiState.Loading -> LoadingIndicator()
        is UiState.Success -> ShowsList(uiState.data)
        is UiState.Error -> ErrorMessage(uiState.error)
    }
}

class ShowsViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()
    
    sealed class UiState {
        object Loading : UiState()
        data class Success(val data: List<Show>) : UiState()
        data class Error(val error: KurozoraError) : UiState()
    }
    
    init {
        loadShows()
    }
    
    fun loadShows() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            
            when (val result = kurozoraKit.show().getShows(limit = 20)) {
                is Result.Success -> {
                    _uiState.value = UiState.Success(result.data.data)
                }
                is Result.Error -> {
                    _uiState.value = UiState.Error(result.error)
                }
            }
        }
    }
}
```

### With LiveData

```kotlin
class ShowsViewModel : ViewModel() {
    private val _shows = MutableLiveData<List<Show>>()
    val shows: LiveData<List<Show>> = _shows
    
    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error
    
    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> = _loading
    
    fun loadShows() {
        viewModelScope.launch {
            _loading.value = true
            
            val result = kurozoraKit.show().getShows(limit = 20)
            
            _loading.value = false
            
            when (result) {
                is Result.Success -> {
                    _shows.value = result.data.data
                    _error.value = null
                }
                is Result.Error -> {
                    _error.value = result.error.message
                }
            }
        }
    }
}
```

## Chaining Operations

Chain multiple API calls with proper error handling:

```kotlin
suspend fun loadShowDetails(showId: String): Result<ShowDetails> {
    // Get show
    val showResult = kurozoraKit.show().getShow(showId)
    if (showResult.isError) return Result.Error(showResult.errorOrNull()!!)
    
    // Get reviews
    val reviewsResult = kurozoraKit.show().getShowReviews(showId)
    if (reviewsResult.isError) return Result.Error(reviewsResult.errorOrNull()!!)
    
    // Get characters
    val charactersResult = kurozoraKit.show().getShowCharacters(showId)
    if (charactersResult.isError) return Result.Error(charactersResult.errorOrNull()!!)
    
    return Result.Success(
        ShowDetails(
            show = showResult.getOrNull()!!.data.first(),
            reviews = reviewsResult.getOrNull()!!.data,
            characters = charactersResult.getOrNull()!!.data
        )
    )
}
```

Or using flatMap:

```kotlin
suspend fun loadShowDetails(showId: String): Result<ShowDetails> {
    return kurozoraKit.show().getShow(showId).flatMap { showResponse ->
        kurozoraKit.show().getShowReviews(showId).flatMap { reviewsResponse ->
            kurozoraKit.show().getShowCharacters(showId).map { charactersResponse ->
                ShowDetails(
                    show = showResponse.data.first(),
                    reviews = reviewsResponse.data,
                    characters = charactersResponse.data
                )
            }
        }
    }
}
```

## Error Recovery

Implement fallback strategies:

```kotlin
suspend fun loadShowsWithFallback(): List<Show> {
    // Try loading from API
    val result = kurozoraKit.show().getShows(limit = 20)
    
    return when (result) {
        is Result.Success -> result.data.data
        is Result.Error -> {
            // Try loading from cache
            loadShowsFromCache() ?: emptyList()
        }
    }
}
```

## Retry Logic

Implement custom retry logic:

```kotlin
suspend fun loadShowsWithRetry(maxRetries: Int = 3): Result<ShowIdentityResponse> {
    repeat(maxRetries) { attempt ->
        val result = kurozoraKit.show().getShows(limit = 20)
        
        if (result.isSuccess) {
            return result
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries - 1) {
            delay(1000L * (attempt + 1))
        }
    }
    
    // Final attempt
    return kurozoraKit.show().getShows(limit = 20)
}
```

## Testing with Result

Results make testing straightforward:

```kotlin
@Test
fun \`test successful show fetch\`() = runTest {
    // Mock successful result
    val mockShows = listOf(mockShow1, mockShow2)
    coEvery { mockRepository.getShows() } returns Result.Success(mockResponse(mockShows))
    
    // Execute
    val result = viewModel.loadShows()
    
    // Verify
    assertTrue(result.isSuccess)
    assertEquals(2, result.getOrNull()?.data?.size)
}

@Test
fun \`test error handling\`() = runTest {
    // Mock error result
    val error = KurozoraError.NetworkError("Network failed")
    coEvery { mockRepository.getShows() } returns Result.Error(error)
    
    // Execute
    val result = viewModel.loadShows()
    
    // Verify
    assertTrue(result.isError)
    assertEquals("Network failed", result.errorOrNull()?.message)
}
```

## Best Practices

1. **Always Handle Both Cases**: Never ignore the error case
2. **Use Pattern Matching**: Prefer `when` for exhaustive handling
3. **Transform with map**: Use functional operators for cleaner code
4. **Separate Concerns**: Map Result to UI state in ViewModel
5. **Provide Fallbacks**: Consider cache or default data on errors
6. **Log Errors**: Always log errors for debugging
7. **User Feedback**: Show meaningful error messages to users
8. **Test Both Paths**: Test both success and error scenarios

## Anti-Patterns

### Don't Force Unwrap

```kotlin
// Bad: Can crash
val show = result.getOrNull()!!.data.first()

// Good: Handle null case
val show = result.getOrNull()?.data?.firstOrNull()
if (show != null) {
    displayShow(show)
}
```

### Don't Ignore Errors

```kotlin
// Bad: Silent failure
when (result) {
    is Result.Success -> displayShows(result.data.data)
    is Result.Error -> { /* ignored */ }
}

// Good: Handle errors
when (result) {
    is Result.Success -> displayShows(result.data.data)
    is Result.Error -> showError(result.error.message)
}
```

### Don't Use Exceptions for Flow Control

```kotlin
// Bad: Using exceptions
try {
    val data = result.getOrThrow()
    process(data)
} catch (e: Exception) {
    handleError(e)
}

// Good: Use pattern matching
when (result) {
    is Result.Success -> process(result.data)
    is Result.Error -> handleError(result.error)
}
```

## Next Steps

- [Error Handling](error-handling) - Learn about error types
<!-- - [Best Practices](best-practices/error-handling) - Error handling patterns
- [Testing](best-practices/testing) - Test Result-based code -->