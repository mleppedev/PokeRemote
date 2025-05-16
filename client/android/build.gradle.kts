buildscript {
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://jitpack.io") }
        maven { url = uri("https://google.bintray.com/webrtc") }
    }
    dependencies {
        // NOTE: No usar una versión demasiado reciente para evitar incompatibilidades
        classpath("com.android.tools.build:gradle:7.3.1")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.7.10")
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://jitpack.io") }
        maven { url = uri("https://google.bintray.com/webrtc") }
    }
}

tasks.register("clean", Delete::class) {
    delete(rootProject.buildDir)
}
