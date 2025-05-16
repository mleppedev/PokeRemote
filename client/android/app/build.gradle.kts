plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "com.pokeremote.poke_remote"
    compileSdk = 34  // Actualizado a la versión más reciente
    ndkVersion = "27.0.12077973"
    // Configuración del NDK gestionada por local.properties

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8  // Cambiado a 1.8 para compatibilidad
        targetCompatibility = JavaVersion.VERSION_1_8  // Cambiado a 1.8 para compatibilidad
    }
    
    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_1_8.toString()  // Cambiado a 1.8 para compatibilidad
    }
    
    // Agregar configuración para resolver errores de enlace
    packagingOptions {
        resources {
            excludes += listOf(
                "lib/x86/libc++_shared.so",
                "lib/x86_64/libc++_shared.so", 
                "lib/armeabi-v7a/libc++_shared.so",
                "lib/arm64-v8a/libc++_shared.so"
            )
        }
    }    defaultConfig {
        // TODO: Specify your own unique Application ID (https://developer.android.com/studio/build/application-id.html).
        applicationId = "com.pokeremote.poke_remote"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }
    
    buildTypes {
        release {
            // TODO: Add your own signing config for the release build.
            // Signing with the debug keys for now, so `flutter run --release` works.
            signingConfig = signingConfigs.getByName("debug")
            // Habilitar ProGuard para optimizar el tamaño de la APK
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            // Añadir configuración para debug
            isMinifyEnabled = false
            // También aplicamos las reglas de proguard en debug para detectar problemas temprano
            proguardFiles(
                getDefaultProguardFile("proguard-android.txt"),
                "proguard-rules.pro"
            )
        }
    }
}

flutter {
    source = "../.."
}
