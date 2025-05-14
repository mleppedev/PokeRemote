using Microsoft.AspNetCore.SignalR;
using PokeRemote.Core.WebRTC;
using PokeRemote.Server.Models;
using System.Threading.Tasks;

namespace PokeRemote.Server.Hubs
{
    public class WebRTCHub : Hub
    {
        private readonly WebRTCServer _webRTCServer;
        private readonly ILogger<WebRTCHub> _logger;

        public WebRTCHub(WebRTCServer webRTCServer, ILogger<WebRTCHub> logger)
        {
            _webRTCServer = webRTCServer;
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation($"Cliente conectado: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation($"Cliente desconectado: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendOffer(SdpMessage offer)
        {
            _logger.LogInformation($"Oferta recibida desde cliente {Context.ConnectionId}");
            
            try
            {
                await _webRTCServer.SetRemoteDescription("offer", offer.Sdp);
                
                // La respuesta se envía automáticamente a través del evento IceGatheringStateChanged
                await Clients.Caller.SendAsync("ReceiveAnswer", new SdpMessage
                {
                    Type = "answer",
                    Sdp = "sdp_answer_placeholder" // Esto debería venir del WebRTCServer
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar oferta WebRTC");
                await Clients.Caller.SendAsync("Error", $"Error al procesar oferta: {ex.Message}");
            }
        }

        public async Task SendIceCandidate(IceMessage candidate)
        {
            _logger.LogInformation($"Candidato ICE recibido desde cliente {Context.ConnectionId}");
            
            try
            {
                await _webRTCServer.AddIceCandidate(
                    candidate.Candidate,
                    candidate.SdpMid,
                    candidate.SdpMLineIndex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar candidato ICE");
                await Clients.Caller.SendAsync("Error", $"Error al procesar candidato ICE: {ex.Message}");
            }
        }
    }
}
