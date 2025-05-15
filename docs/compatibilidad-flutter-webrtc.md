# Solución de problemas con flutter_webrtc

## Problema común: Incompatibilidad con el SDK

El paquete `flutter_webrtc` puede presentar problemas de compatibilidad con diferentes versiones del SDK de Flutter y versiones específicas de Android. A continuación se presentan algunas soluciones para los problemas más comunes.

## Recomendaciones generales

1. **Alinear las versiones de dependencias**:
   
   En el archivo `pubspec.yaml`, asegúrate de que la versión de flutter_webrtc sea compatible con tu versión de Flutter:
   
   ```yaml
   dependencies:
     flutter_webrtc: ^0.9.46  # Ajusta según sea necesario
   ```

2. **Configuración de gradle en Android**:
   
   En `android/app/build.gradle`, asegúrate de tener:
   
   ```gradle
   android {
     compileSdkVersion 33  // Usar al menos API 33
     
     defaultConfig {
       minSdkVersion 21    // flutter_webrtc requiere mínimo 21
       targetSdkVersion 33
     }
     
     compileOptions {
       sourceCompatibility JavaVersion.VERSION_1_8
       targetCompatibility JavaVersion.VERSION_1_8
     }
   }
   ```

3. **Problemas de compilación en Android**:
   
   Si encuentras errores relacionados con el NDK, asegúrate de tener instalada la versión correcta:
   
   - Abre Android Studio
   - Ve a Tools -> SDK Manager -> SDK Tools
   - Instala "NDK (Side by side)" versión 21.4.7075529 o compatible
   - Configura ANDROID_NDK_HOME en las variables de entorno

4. **Solución a errores de enlace**:
   
   Si aparecen errores de enlace durante la compilación, agrega en `android/app/build.gradle`:
   
   ```gradle
   android {
     // ... código existente ...
     
     packagingOptions {
       exclude 'lib/x86/libc++_shared.so'
       exclude 'lib/x86_64/libc++_shared.so'
       exclude 'lib/armeabi-v7a/libc++_shared.so'
       exclude 'lib/arm64-v8a/libc++_shared.so'
     }
   }
   ```

5. **Permisos en Android**:
   
   Asegúrate de que en `android/app/src/main/AndroidManifest.xml` tengas los permisos necesarios:
   
   ```xml
   <uses-permission android:name="android.permission.INTERNET"/>
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
   <uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
   <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
   ```

## Problemas y soluciones específicos

### Error: "Execution failed for task ':app:checkDebugAarMetadata'"

Este error suele relacionarse con incompatibilidades entre versiones de las dependencias de Android.

**Solución**: Agrega en `android/build.gradle`:

```gradle
allprojects {
    repositories {
        // ... repositorios existentes ...
        maven { url 'https://jitpack.io' }
        maven { url 'https://google.bintray.com/webrtc' }
    }
}
```

### Error: "native libraries missing"

**Solución**: Limpia la caché e instala nuevamente:

```bash
flutter clean
flutter pub get
flutter build apk --debug
```

Para problemas persistentes, considera usar una versión específica de flutter_webrtc que esté verificada como compatible con tu entorno de desarrollo.
