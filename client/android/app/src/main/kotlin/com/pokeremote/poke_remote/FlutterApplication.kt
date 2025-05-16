package com.pokeremote.poke_remote

import io.flutter.app.FlutterApplication
import io.flutter.plugin.common.PluginRegistry
import io.flutter.plugins.GeneratedPluginRegistrant

// Clase de aplicación para soporte completo de WebRTC
class FlutterApplication : FlutterApplication(), PluginRegistry.PluginRegistrantCallback {
    override fun onCreate() {
        super.onCreate()
    }
    
    // Este método es necesario para los plugins que aún usan el viejo sistema de registro
    override fun registerWith(registry: PluginRegistry) {
        GeneratedPluginRegistrant.registerWith(registry)
    }
}
