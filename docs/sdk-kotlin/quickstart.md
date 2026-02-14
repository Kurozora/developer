# Quick Start

This guide will help you build your first app with KurozoraKit in just a few minutes.

## Prerequisites

Before starting, make sure you have:

- Completed the [Installation](installation) guide
- An API key from Kurozora (contact [Kurozora](https://kurozora.app) for access)
- Basic knowledge of Kotlin and Android development

## Step 1: Implement Platform Interface

KurozoraKit requires platform information for API calls. Create a Platform implementation:

```kotlin
import kurozorakit.api.Platform
import android.os.Build

object AndroidPlatform : Platform {
    override val platform: String = "Android"
    override val platformVersion: String = Build.VERSION.RELEASE
    override val deviceVendor: String = Build.MANUFACTURER
    override val deviceModel: String = Build.MODEL
}
```

## Step 2: Implement User Agent Class

KurozoraKit requires user agent for API calls. Create a UserAgent implementation:

```kotlin
import kurozorakit.shared.UserAgent

val userAgent = UserAgent(
    appName = "your_app_name", 
    appID = "com.username.kurozora", 
    platformName = "your_platform_name", 
    platformVersion = "your_platform_version"
)
```

## Step 3: Initialize KurozoraKit

Create a singleton to manage your KurozoraKit instance:

```kotlin
import kurozorakit.core.KurozoraKit
import kurozorakit.shared.logging.LogLevel

object KurozoraManager {
    private var instance: KurozoraKit? = null
    
    fun initialize(apiKey: String): KurozoraKit {
        if (instance == null) {
            instance = KurozoraKit.Builder()
                .apiKey(apiKey)
                .platform(AndroidPlatform)
                .userAgent(userAgent)
                .logLevel(LogLevel.INFO)
                .build()
        }
        return instance!!
    }
    
    fun getInstance(): KurozoraKit {
        return instance ?: throw IllegalStateException("KurozoraKit not initialized")
    }
}
```

Initialize in your Application class:

```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // Initialize KurozoraKit
        KurozoraManager.initialize(apiKey = "your-api-key-here")
    }
}
```

Don't forget to register your Application class in `AndroidManifest.xml`:

```xml
<application
android:name=".MyApplication"
...>
</application>
```

## Step 4: Fetch Anime Shows

Now you can use KurozoraKit to fetch data. Here's a simple example:

```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import kurozorakit.shared.Result

class ShowsViewModel : ViewModel() {
    
    fun loadShows() {
        viewModelScope.launch {
            val kurozoraKit = KurozoraManager.getInstance()
            
            // Fetch shows with limit of 20
            val result = kurozoraKit.show().getShows(limit = 20)
            
            when (result) {
                is Result.Success -> {
                    // Handle success
                    val shows = result.data.data
                    shows.forEach { show ->
                        println("Title: ${show.attributes.title}")
                        println("Type: ${show.attributes.type}")
                        println("Episodes: ${show.attributes.episodeCount}")
                        println("---")
                    }
                }
                is Result.Error -> {
                    // Handle error
                    println("Error: ${result.error.message}")
                }
            }
        }
    }
}
```

## Step 5: Display in Compose UI

Here's a complete example using Jetpack Compose:

```kotlin
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import kurozorakit.data.models.show.Show

@Composable
fun ShowsScreen(viewModel: ShowsViewModel = viewModel()) {
    var shows by remember { mutableStateOf<List<Show>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    
    LaunchedEffect(Unit) {
        viewModel.loadShows { result ->
            isLoading = false
            when (result) {
                is Result.Success -> {
                    shows = result.data.data
                }
                is Result.Error -> {
                    error = result.error.message
                }
            }
        }
    }
    
    Column(modifier = Modifier.fillMaxSize()) {
        when {
            isLoading -> {
                Box(modifier = Modifier.fillMaxSize()) {
                    CircularProgressIndicator()
                }
            }
            error != null -> {
                Text(
                    text = "Error: $error",
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(16.dp)
                )
            }
            else -> {
                LazyColumn {
                    items(shows) { show ->
                        ShowCard(show)
                    }
                }
            }
        }
    }
}

@Composable
fun ShowCard(show: Show) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = show.attributes.title,
                style = MaterialTheme.typography.titleLarge
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Type: ${show.attributes.type}",
                style = MaterialTheme.typography.bodyMedium
            )
            
            Text(
                text = "Episodes: ${show.attributes.episodeCount}",
                style = MaterialTheme.typography.bodyMedium
            )
            
            show.attributes.synopsis?.let { synopsis ->
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = synopsis,
                    style = MaterialTheme.typography.bodySmall,
                    maxLines = 3
                )
            }
        }
    }
}
```

Update ViewModel to support callback:

```kotlin
class ShowsViewModel : ViewModel() {
    
    fun loadShows(onResult: (Result<ShowIdentityResponse>) -> Unit) {
        viewModelScope.launch {
            val result = KurozoraManager.getInstance()
                .show()
                .getShows(limit = 20)
            onResult(result)
        }
    }
}
```

## Step 6: Handle Errors Gracefully

KurozoraKit provides detailed error information. Here's how to handle different error types:

```kotlin
import kurozorakit.shared.KurozoraError

fun handleError(error: KurozoraError) {
    when (error) {
        is KurozoraError.NetworkError -> {
            println("Network error: ${error.message}")
            // Show retry option
        }
        is KurozoraError.AuthenticationError -> {
            println("Authentication failed: ${error.message}")
            // Redirect to login
        }
        is KurozoraError.RateLimitError -> {
            println("Rate limit exceeded. Retry after: ${error.retryAfter} seconds")
            // Wait and retry
        }
        is KurozoraError.NotFoundError -> {
            println("Resource not found: ${error.message}")
            // Show not found message
        }
        is KurozoraError.UnknownError -> {
            println("Unknown error: ${error.message}")
            error.cause?.printStackTrace()
        }
    }
}
```

## Complete Example

Here's a complete, production-ready example:

```kotlin
// 1. Platform implementation
object AndroidPlatform : Platform {
    override val platform = "Android"
    override val platformVersion = Build.VERSION.RELEASE
    override val deviceVendor = Build.MANUFACTURER
    override val deviceModel = Build.MODEL
}

// User agent
val userAgent = UserAgent(
    appName = "your_app_name", 
    appID = "com.username.kurozora", 
    platformName = "your_platform_name", 
    platformVersion = "your_platform_version"
)

// 2. Application class
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        initializeKurozoraKit()
    }
    
    private fun initializeKurozoraKit() {
        KurozoraManager.initialize(
            apiKey = BuildConfig.KUROZORA_API_KEY
        )
    }
}

// 3. ViewModel with state management
class ShowsViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()
    
    sealed class UiState {
        object Loading : UiState()
        data class Success(val shows: List<Show>) : UiState()
        data class Error(val message: String) : UiState()
    }
    
    init {
        loadShows()
    }
    
    fun loadShows() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            
            val result = KurozoraManager.getInstance()
                .show()
                .getShows(limit = 20)
            
            _uiState.value = when (result) {
                is Result.Success -> UiState.Success(result.data.data)
                is Result.Error -> UiState.Error(result.error.message ?: "Unknown error")
            }
        }
    }
    
    fun retry() {
        loadShows()
    }
}

// 4. Compose UI
@Composable
fun ShowsScreen(viewModel: ShowsViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsState()
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Anime Shows") }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (val state = uiState) {
                is ShowsViewModel.UiState.Loading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                is ShowsViewModel.UiState.Success -> {
                    LazyColumn {
                        items(state.shows) { show ->
                            ShowCard(show)
                        }
                    }
                }
                is ShowsViewModel.UiState.Error -> {
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = state.message,
                            color = MaterialTheme.colorScheme.error
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = { viewModel.retry() }) {
                            Text("Retry")
                        }
                    }
                }
            }
        }
    }
}
```

## Next Steps

Congratulations! You've built your first app with KurozoraKit. Here's what to explore next:

- [Configuration](configuration) - Learn about advanced configuration options
- [Authentication](authentication) - Add user authentication


## Tips

1. **Use a single KurozoraKit instance** - Create it once and reuse throughout your app
2. **Handle errors gracefully** - Always handle both success and error cases
3. **Use coroutines** - KurozoraKit is designed for coroutines, use them properly
4. **Enable caching** - For better performance and offline support
5. **Monitor network usage** - Use appropriate limit parameters to reduce data usage


## Common Patterns

### Loading with Pagination

```kotlin
fun loadMore(next: String?) {
    viewModelScope.launch {
        val result = if (next != null) {
            kurozoraKit.show().getShows(next = next)
        } else {
            kurozoraKit.show().getShows(limit = 20)
        }
        // Handle result
    }
}
```

### With Filters

```kotlin
val filter = ShowFilter(
    type = FilterValue(listOf(ShowType.TV)),
    year = FilterValue(listOf("2024"))
)

val result = kurozoraKit.show().getShows(limit = 20, filter = filter)
```

### With Relationships

```kotlin
val result = kurozoraKit.show().getShow(
    id = "1",
    relationships = listOf("genres", "studios", "characters")
)
```

Ready to dive deeper? Continue with the [Configuration Guide](configuration)!
