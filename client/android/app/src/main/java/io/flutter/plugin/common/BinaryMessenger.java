package io.flutter.plugin.common;

/**
 * Interfaz de compatibilidad para BinaryMessenger
 */
public interface BinaryMessenger {
    void send(String channel, byte[] message);
    void setMessageHandler(String channel, BinaryMessageHandler handler);
    
    interface BinaryMessageHandler {
        void onMessage(byte[] message, BinaryReply reply);
    }
    
    interface BinaryReply {
        void reply(byte[] reply);
    }
}
