# WebRTC specific rules
-keep class org.webrtc.** { *; }
-keep class com.twilio.video.** { *; }
-keep class org.webrtc.ContextUtils.** { *; }

# Flutter WebRTC plugin
-keep class com.cloudwebrtc.webrtc.** { *; }
-keep class org.webrtc.audio.** { *; }
-keep class org.webrtc.voiceengine.** { *; }
-keep class flutter.** { *; }
-keep class io.flutter.** { *; }

# Reglas para mantener compatibilidad con versiones antiguas de Flutter
-keep class io.flutter.plugin.common.PluginRegistry$Registrar { *; }
-keep class io.flutter.plugin.common.BinaryMessenger { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.plugins.** { *; }
-keep class io.flutter.embedding.** { *; }

# Mantener las clases para la compatibilidad con versiones antiguas de Flutter
-keep class io.flutter.plugin.common.PluginRegistry$Registrar { *; }
-keep class io.flutter.plugin.common.PluginRegistry { *; }
-keep class io.flutter.view.** { *; }

# Evitar advertencias de clases faltantes
-dontwarn org.webrtc.**
-dontwarn com.twilio.**
-dontwarn io.flutter.embedding.**
