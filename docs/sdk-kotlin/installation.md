# Installation

This guide will help you add KurozoraKit to your Android project.

## Requirements

Before installing KurozoraKit, ensure your project meets these requirements:

- **Minimum SDK**: Android 5.0 (API level 21)
- **Target SDK**: Android 14 (API level 34) or higher
- **Kotlin**: Version 2.2.0 or higher
- **Java**: JDK 17 or higher
- **Build System**: Gradle 8.0+

## Gradle Setup

### Step 1: Add Repository

Add Maven Central repository to your project's `settings.gradle.kts`:

```kotlin
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral() // KurozoraKit is published here
    }
}
```

### Step 2: Add Dependency

Add KurozoraKit to your app's `build.gradle.kts`:

```kotlin
dependencies {
    implementation("app.kurozora:kurozorakit:1.2.4")
}
```

### Step 3: Enable Kotlin Serialization

KurozoraKit uses Kotlin Serialization for JSON parsing. Add the plugin to your app's `build.gradle.kts`:

```kotlin
plugins {
    id("com.android.application")
    kotlin("android")
    kotlin("plugin.serialization") version "2.2.0"
}
```

### Step 4: Configure Java Compatibility

Ensure your project uses Java 17:

```kotlin
android {
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    
    kotlinOptions {
        jvmTarget = "17"
    }
}
```

## Complete build.gradle.kts Example

Here's a complete example configuration:

```kotlin
plugins {
    id("com.android.application")
    kotlin("android")
    kotlin("plugin.serialization") version "2.2.0"
}

android {
    namespace = "com.example.myapp"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.myapp"
        minSdk = 21
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    // KurozoraKit
    implementation("app.kurozora:kurozorakit:1.2.4")
    
    // Android essentials
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    
    // Coroutines (if not already included)
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
}
```

## ProGuard Configuration

If you're using ProGuard or R8 for code obfuscation, add these rules to your `proguard-rules.pro`:

```plaintext
# KurozoraKit
-keep class kurozorakit.** { *; }
-keepclassmembers class kurozorakit.** { *; }

# Kotlin Serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt
-keepclassmembers class kotlinx.serialization.json.** {
    *** Companion;
}
-keepclasseswithmembers class kotlinx.serialization.json.** {
    kotlinx.serialization.KSerializer serializer(...);
}

# Ktor
-keep class io.ktor.** { *; }
-keep class kotlinx.coroutines.** { *; }
```

## Permissions

Add the required permissions to your `AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
<!-- Required for network access -->
<uses-permission android:name="android.permission.INTERNET" />
<!-- Optional: for checking network connectivity -->
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<application
    ...
</application>

</manifest>
```
## Version Catalog (Optional)

If you're using Gradle Version Catalogs, add to your `libs.versions.toml`:

```toml
[versions]
kurozorakit = "1.2.4"
kotlin = "2.2.0"
kotlinx-serialization = "1.6.2"

[libraries]
kurozorakit = { module = "app.kurozora:kurozorakit", version.ref = "kurozorakit" }

[plugins]
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }

```

Then in your `build.gradle.kts`:

```kotlin
plugins {
    alias(libs.plugins.kotlin.serialization)
}

dependencies {
    implementation(libs.kurozorakit)
}
```

## Verify Installation

To verify your installation, create a simple test:

```kotlin
import kurozorakit.core.KurozoraKit
import kurozorakit.api.Platform
import kurozorakit.shared.logging.LogLevel

// Create a simple platform implementation
object MyPlatform : Platform {
    override val platform = "Android"
    override val platformVersion = android.os.Build.VERSION.RELEASE
    override val deviceVendor = android.os.Build.MANUFACTURER
    override val deviceModel = android.os.Build.MODEL
}

// Initialize KurozoraKit
val kurozoraKit = KurozoraKit.Builder()
    .apiKey("your-api-key-here")
    .platform(MyPlatform)
    .userAgent(UserAgent(appName = "your_app_name", appID = "com.username.kurozora", platformName = "your_platform_name", platformVersion = "your_platform_version"))
    .logLevel(LogLevel.DEBUG)
    .build()

println("KurozoraKit version: ${KurozoraKit.version}")
```

::: tip
Always check the [GitHub Releases](https://github.com/Kurozora/kurozorakit-android/releases) page for the latest version number.
:::

