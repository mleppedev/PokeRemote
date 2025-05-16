package io.flutter.plugin.common;

/**
 * API de compatibilidad simplificada para mantener soporte con plugins que usan la antigua API
 * Versión minimalista para evitar errores de compilación
 */
public interface PluginRegistry {
    /**
     * Interfaz para registrar plugins - compatible con WebRTC
     */
    interface Registrar {
        // Método mínimo necesario para la compatibilidad
        Object messenger();
    }
}
