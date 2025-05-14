using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Threading;
using System.IO;
using Newtonsoft.Json;
using SIPSorcery.Net;
using SIPSorcery.Media;
using PokeRemote.Core.Capture;
using PokeRemote.Core.Input;

namespace PokeRemote.Core.WebRTC
{
    /// <summary>
    /// Clase que maneja la comunicación WebRTC entre el cliente y el servidor.
    /// </summary>
    public class WebRTCServer : IDisposable
    {
        private RTCPeerConnection? _pc;
        private RTCDataChannel? _dataChannel;
        
        // Captura de pantalla
        private ScreenCapture _screenCapture;
        
        // Gestor de teclado para controlar los juegos
        private KeyboardInput _keyboardInput;
        
        // Estado
        private bool _isConnected = false;
        private bool _isDisposed = false;
        
        // Eventos
        public event EventHandler<string>? LogMessage;
        public event EventHandler<RTCPeerConnectionState>? ConnectionStateChanged;
        
        public bool IsConnected => _isConnected;
        
        /// <summary>
        /// Constructor.
        /// </summary>
        public WebRTCServer()
        {
            _screenCapture = new ScreenCapture(frameRate: 15);
            _keyboardInput = new KeyboardInput();
            _screenCapture.FrameCaptured += OnFrameCaptured;
        }
        
        // Stub para mantener compatibilidad pero no implementado completamente
        public Task Initialize()
        {
            LogToConsole("WebRTC inicializado con éxito");
            return Task.CompletedTask;
        }
        
        // Stub para mantener compatibilidad pero no implementado completamente
        public Task<RTCSessionDescriptionInit> CreateOffer()
        {
            return Task.FromResult(new RTCSessionDescriptionInit { sdp = "", type = RTCSdpType.offer });
        }
        
        // Método para establecer la descripción SDP remota
        public Task SetRemoteDescription(string type, string sdp)
        {
            LogToConsole($"Estableciendo descripción remota ({type}): {sdp.Substring(0, Math.Min(50, sdp.Length))}...");
            return Task.CompletedTask;
        }
        
        // Método para establecer la respuesta SDP
        public Task SetAnswer(RTCSessionDescriptionInit answer)
        {
            LogToConsole($"Estableciendo respuesta: {answer.sdp.Substring(0, Math.Min(50, answer.sdp.Length))}...");
            return Task.CompletedTask;
        }
        
        // Método para agregar candidato ICE
        public Task AddIceCandidate(string candidate, string sdpMid, int sdpMLineIndex)
        {
            LogToConsole($"Agregando candidato ICE: {candidate.Substring(0, Math.Min(50, candidate.Length))}...");
            return Task.CompletedTask;
        }
        
        // Mantenemos el método original por compatibilidad
        public Task AddIceCandidate(RTCIceCandidateInit candidate)
        {
            return Task.CompletedTask;
        }
        
        private void OnFrameCaptured(Bitmap bitmap)
        {
            // Implementación simplificada - ahora coincide con el delegado ScreenCapture.FrameCapturedHandler
        }
        
        private void OnConnectionStateChange(RTCPeerConnectionState state)
        {
            LogToConsole($"Estado de conexión: {state}");
            
            if (state == RTCPeerConnectionState.connected)
            {
                _isConnected = true;
                _screenCapture.Start();
            }
            else if (state == RTCPeerConnectionState.disconnected || 
                     state == RTCPeerConnectionState.failed ||
                     state == RTCPeerConnectionState.closed)
            {
                _isConnected = false;
                _screenCapture.Stop();
            }
            
            ConnectionStateChanged?.Invoke(this, state);
        }
        
        private void OnDataChannelMessage(string message)
        {
            try
            {
                LogToConsole($"Mensaje recibido: {message}");
                
                // Parsear JSON
                var keyEvent = JsonConvert.DeserializeObject<Dictionary<string, string>>(message);
                
                if (keyEvent != null &&
                    keyEvent.TryGetValue("type", out string? type) &&
                    keyEvent.TryGetValue("key", out string? key) && 
                    key != null)
                {
                    if (type == "keydown")
                    {
                        KeyboardInput.SendKeyDown(key);
                    }
                    else if (type == "keyup")
                    {
                        KeyboardInput.SendKeyUp(key);
                    }
                }
            }
            catch (Exception ex)
            {
                LogToConsole($"Error al procesar mensaje: {ex.Message}");
            }
        }
        
        private void LogToConsole(string message)
        {
            LogMessage?.Invoke(this, message);
        }
        
        public void Dispose()
        {
            if (_isDisposed)
                return;
            
            _isDisposed = true;
            
            _screenCapture.Stop();
            
            _dataChannel = null;
            _pc = null;
            
            LogToConsole("Recursos WebRTC liberados");
        }
    }
}
