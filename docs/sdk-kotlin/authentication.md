# Authentication

KurozoraKit provides comprehensive authentication support including user registration, login, profile management, and secure token storage.

## Overview

Authentication in KurozoraKit follows these principles:

- **Token-Based Authentication**: JWT tokens for API authentication
- **Secure Storage**: Encrypted token storage via TokenProvider
- **Automatic Token Injection**: Tokens automatically added to requests
- **Session Management**: Handle login, logout, and token refresh
- **Profile Management**: Full user profile CRUD operations

## Getting Started

### Basic Authentication Flow

```kotlin
// Initialize KurozoraKit with token provider
val tokenProvider = MyTokenProvider(context)

val kurozoraKit = KurozoraKit.Builder()
    .apiKey("your-api-key")
    .platform(AndroidPlatform)
    .userAgent(userAgent)
    .tokenProvider(tokenProvider)
    .build()

// Sign up
val signUpResult = kurozoraKit.auth().signUp(
    email = "user@example.com",
    username = "username",
    password = "securePassword123"
)

// Sign in
val signInResult = kurozoraKit.auth().signIn(
    email = "user@example.com",
    password = "securePassword123"
)

// Check if user is authenticated
val isAuthenticated = kurozoraKit.auth().isAuthenticated()

// Sign out
kurozoraKit.auth().signOut()
```

## Authentication Repository

Access authentication features through the `auth()` repository:

```kotlin
val authRepository = kurozoraKit.auth()
```

### Sign Up

Create a new user account:

```kotlin
suspend fun signUp(email: String, username: String, password: String) {
    val result = kurozoraKit.auth().signUp(
        email = email,
        username = username,
        password = password
    )
    
    when (result) {
        is Result.Success -> {
            val user = result.data.data.first()
            println("Welcome ${user.attributes.username}!")
            
            // Token is automatically saved via TokenProvider
            navigateToHome()
        }
        is Result.Error -> {
            when (val error = result.error) {
                is KurozoraError.ValidationError -> {
                    // Show field-specific errors
                    showValidationErrors(error.message)
                }
                is KurozoraError.ApiError -> {
                    // Email/username already exists
                    showError(error.message)
                }
                else -> showError("Sign up failed")
            }
        }
    }
}
```

**Parameters:**
- `email: String` - User's email address
- `username: String` - Unique username
- `password: String` - Password (minimum requirements apply)

**Response:** `Result<AccountUserResponse>`

### Sign In

Authenticate existing user:

```kotlin
suspend fun signIn(email: String, password: String) {
    val result = kurozoraKit.auth().signIn(
        email = email,
        password = password
    )
    
    when (result) {
        is Result.Success -> {
            val user = result.data.data.first()
            println("Token: ${user.token}")
            
            // Save user data locally if needed
            saveUserProfile(user)
            
            navigateToHome()
        }
        is Result.Error -> {
            when (result.error) {
                is KurozoraError.AuthenticationError -> {
                    showError("Invalid email or password")
                }
                else -> showError("Sign in failed")
            }
        }
    }
}
```

**Parameters:**
- `email: String` - User's email address
- `password: String` - User's password

**Response:** `Result<AccountUserResponse>`

**Returned User Object:**

```kotlin
data class AccountUser(
    val id: String,
    val token: String,
    val username: String,
    val profileUrl: String? = null,
    val userJson: String,
)
```

<!-- ### Sign Out

Clear authentication and token:

```kotlin
suspend fun signOut() {
    kurozoraKit.auth().signOut()
    
    // Clear local data
    clearUserData()
    
    // Navigate to login
    navigateToLogin()
}
```

**Note:** This clears the stored token via TokenProvider. -->

<!-- ### Check Authentication Status

```kotlin
suspend fun checkAuthStatus() {
    val isAuthenticated = kurozoraKit.auth().isAuthenticated()
    
    if (isAuthenticated) {
        // User is logged in
        loadUserProfile()
    } else {
        // User needs to login
        navigateToLogin()
    }
}
``` -->

## Token Provider

Implement `TokenProvider` interface for secure token storage:

### Interface Definition

```kotlin
interface TokenProvider {
    /**
     * Save user authentication token
     */
    suspend fun saveToken(user: AccountUser)
    
    /**
     * Retrieve stored authentication token
     */
    suspend fun getToken(): String?
}
```

### EncryptedSharedPreferences Implementation

```kotlin
import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import kurozorakit.api.TokenProvider
import kurozorakit.data.models.user.AccountUser

class SecureTokenProvider(private val context: Context) : TokenProvider {
    
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()
    
    private val sharedPreferences = EncryptedSharedPreferences.create(
        context,
        "kurozora_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
    
    override suspend fun saveToken(user: AccountUser) {
        sharedPreferences.edit()
            .putString(KEY_TOKEN, user.token)
            .putString(KEY_USER_ID, user.id)
            .putString(KEY_USERNAME, user.attributes.username)
            .apply()
    }
    
    override suspend fun getToken(): String? {
        return sharedPreferences.getString(KEY_TOKEN, null)
    }
    
    fun getUserId(): String? {
        return sharedPreferences.getString(KEY_USER_ID, null)
    }
    
    fun clearToken() {
        sharedPreferences.edit()
            .remove(KEY_TOKEN)
            .remove(KEY_USER_ID)
            .remove(KEY_USERNAME)
            .apply()
    }
    
    companion object {
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_USERNAME = "username"
    }
}
```

### DataStore Implementation

```kotlin
import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kurozorakit.api.TokenProvider
import kurozorakit.data.models.user.AccountUser

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "kurozora_auth")

class DataStoreTokenProvider(private val context: Context) : TokenProvider {
    
    override suspend fun saveToken(user: AccountUser) {
        context.dataStore.edit { preferences ->
            preferences[KEY_TOKEN] = user.token
            preferences[KEY_USER_ID] = user.id
            preferences[KEY_USERNAME] = user.attributes.username
        }
    }
    
    override suspend fun getToken(): String? {
        return context.dataStore.data
            .map { preferences -> preferences[KEY_TOKEN] }
            .first()
    }
    
    suspend fun getUserId(): String? {
        return context.dataStore.data
            .map { preferences -> preferences[KEY_USER_ID] }
            .first()
    }
    
    suspend fun clearToken() {
        context.dataStore.edit { preferences ->
            preferences.remove(KEY_TOKEN)
            preferences.remove(KEY_USER_ID)
            preferences.remove(KEY_USERNAME)
        }
    }
    
    companion object {
        private val KEY_TOKEN = stringPreferencesKey("auth_token")
        private val KEY_USER_ID = stringPreferencesKey("user_id")
        private val KEY_USERNAME = stringPreferencesKey("username")
    }
}
```

## Complete Authentication Example

Here's a production-ready authentication implementation:

```kotlin
class AuthViewModel(
    private val kurozoraKit: KurozoraKit,
    private val tokenProvider: SecureTokenProvider
) : ViewModel() {
    
    private val _authState = MutableStateFlow<AuthState>(AuthState.Initial)
    val authState: StateFlow<AuthState> = _authState
    
    sealed class AuthState {
        object Initial : AuthState()
        object Loading : AuthState()
        object Authenticated : AuthState()
        object Unauthenticated : AuthState()
        data class Error(val message: String) : AuthState()
    }
    
    init {
        checkAuthStatus()
    }
    
    private fun checkAuthStatus() {
        viewModelScope.launch {
            val token = tokenProvider.getToken()
            _authState.value = if (token != null) {
                AuthState.Authenticated
            } else {
                AuthState.Unauthenticated
            }
        }
    }
    
    fun signUp(email: String, username: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            
            // Validate input
            if (!isValidEmail(email)) {
                _authState.value = AuthState.Error("Invalid email format")
                return@launch
            }
            
            if (username.length < 3) {
                _authState.value = AuthState.Error("Username must be at least 3 characters")
                return@launch
            }
            
            if (password.length < 8) {
                _authState.value = AuthState.Error("Password must be at least 8 characters")
                return@launch
            }
            
            // Sign up
            val result = kurozoraKit.auth().signUp(email, username, password)
            
            _authState.value = when (result) {
                is Result.Success -> {
                    analytics.logEvent("user_signed_up")
                    AuthState.Authenticated
                }
                is Result.Error -> {
                    val message = when (result.error) {
                        is KurozoraError.ValidationError -> result.error.message
                        is KurozoraError.ApiError -> result.error.message
                        else -> "Sign up failed. Please try again."
                    }
                    AuthState.Error(message ?: "Unknown error")
                }
            }
        }
    }
    
    fun signIn(email: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            
            val result = kurozoraKit.auth().signIn(email, password)
            
            _authState.value = when (result) {
                is Result.Success -> {
                    analytics.logEvent("user_signed_in")
                    AuthState.Authenticated
                }
                is Result.Error -> {
                    val message = when (result.error) {
                        is KurozoraError.AuthenticationError -> "Invalid email or password"
                        is KurozoraError.NetworkError -> "Network error. Please check your connection."
                        else -> "Sign in failed. Please try again."
                    }
                    AuthState.Error(message)
                }
            }
        }
    }
    
    fun signOut() {
        viewModelScope.launch {
            tokenProvider.clearToken()
            analytics.logEvent("user_signed_out")
            _authState.value = AuthState.Unauthenticated
        }
    }
    
    private fun isValidEmail(email: String): Boolean {
        return android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }
}
```

### Compose UI

```kotlin
@Composable
fun AuthScreen(viewModel: AuthViewModel = viewModel()) {
    val authState by viewModel.authState.collectAsState()
    
    when (authState) {
        is AuthState.Initial, AuthState.Loading -> LoadingScreen()
        AuthState.Authenticated -> {
            LaunchedEffect(Unit) {
                // Navigate to home
            }
        }
        AuthState.Unauthenticated -> LoginForm(viewModel)
        is AuthState.Error -> {
            LoginForm(viewModel)
            // Show error message
        }
    }
}

@Composable
fun LoginForm(viewModel: AuthViewModel) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isSignUp by remember { mutableStateOf(false) }
    var username by remember { mutableStateOf("") }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = if (isSignUp) "Sign Up" else "Sign In",
            style = MaterialTheme.typography.headlineMedium
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            modifier = Modifier.fillMaxWidth()
        )
        
        if (isSignUp) {
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = username,
                onValueChange = { username = it },
                label = { Text("Username") },
                modifier = Modifier.fillMaxWidth()
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            modifier = Modifier.fillMaxWidth()
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = {
                if (isSignUp) {
                    viewModel.signUp(email, username, password)
                } else {
                    viewModel.signIn(email, password)
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(if (isSignUp) "Sign Up" else "Sign In")
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        TextButton(onClick = { isSignUp = !isSignUp }) {
            Text(
                if (isSignUp) "Already have an account? Sign In"
                else "Don't have an account? Sign Up"
            )
        }
    }
}
```

## Protected Routes

Protect routes that require authentication:

```kotlin
@Composable
fun App(viewModel: AuthViewModel) {
    val authState by viewModel.authState.collectAsState()
    
    when (authState) {
        AuthState.Authenticated -> {
            // Show authenticated app
            MainApp()
        }
        AuthState.Unauthenticated -> {
            // Show login screen
            AuthScreen(viewModel)
        }
        else -> {
            // Show loading
            LoadingScreen()
        }
    }
}
```

## Best Practices

1. **Use Encrypted Storage**: Always encrypt tokens (EncryptedSharedPreferences or DataStore Encrypted)
2. **Clear on Logout**: Remove all auth data on sign out
3. **Validate Input**: Validate email and password format before API calls
4. **Handle Token Expiry**: Implement token refresh or re-authentication
5. **Secure Password Storage**: Never store passwords, only tokens
6. **Use HTTPS**: Always use secure connections (handled by SDK)
7. **Implement Biometric Auth**: Add biometric authentication for better UX
8. **Session Timeout**: Implement automatic logout after inactivity

## Security Considerations

### Token Security

```kotlin
// Good: Encrypted storage
class SecureTokenProvider(context: Context) : TokenProvider {
    private val encryptedPrefs = EncryptedSharedPreferences.create(...)
}

// Bad: Plain text storage
class InsecureTokenProvider(context: Context) : TokenProvider {
    private val prefs = context.getSharedPreferences("auth", Context.MODE_PRIVATE)
}
```

### Password Requirements

Enforce strong passwords:

```kotlin
fun validatePassword(password: String): String? {
    return when {
        password.length < 8 -> "Password must be at least 8 characters"
        !password.any { it.isDigit() } -> "Password must contain at least one number"
        !password.any { it.isUpperCase() } -> "Password must contain at least one uppercase letter"
        !password.any { it.isLowerCase() } -> "Password must contain at least one lowercase letter"
        else -> null // Valid
    }
}
```

::: tip
Store tokens using `EncryptedSharedPreferences` from AndroidX Security for production apps.
:::
