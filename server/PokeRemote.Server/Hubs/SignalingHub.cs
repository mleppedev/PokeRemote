using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using PokeRemote.Core.WebRTC;
using SIPSorcery.Net;

namespace PokeRemote.Server.Hubs
{
    public class SignalingHub : Hub
    {
        // Store WebRTC managers for active connections
        private static ConcurrentDictionary<string, WebRTCManager> _webRtcManagers = new();
        private readonly ILogger<SignalingHub> _logger;

        public SignalingHub(ILogger<SignalingHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation($"Client connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            _logger.LogInformation($"Client disconnected: {Context.ConnectionId}");
            
            // Clean up WebRTC resources
            if (_webRtcManagers.TryRemove(Context.ConnectionId, out var manager))
            {
                manager.Close();
                manager = null;
            }
            
            await base.OnDisconnectedAsync(exception);
        }

        // Client sends an offer
        public async Task SendOffer(string sdp)
        {
            _logger.LogInformation($"Received offer from client: {Context.ConnectionId}");
            
            // Create new WebRTC manager for this connection
            var manager = new WebRTCManager();
            manager.Initialize();
            
            // Set up event handlers
            manager.OnIceCandidate += async (sender, e) =>
            {
                if (e.Candidate != null)
                {
                    await Clients.Caller.SendAsync("ReceiveIceCandidate", new
                    {
                        candidate = e.Candidate.candidate,
                        sdpMid = e.Candidate.sdpMid,
                        sdpMLineIndex = e.Candidate.sdpMLineIndex
                    });
                }
            };
            
            manager.OnConnectionStateChange += async (sender, state) =>
            {
                _logger.LogInformation($"Connection state changed to: {state}");
                
                if (state == RTCPeerConnectionState.failed || state == RTCPeerConnectionState.closed)
                {
                    if (_webRtcManagers.TryRemove(Context.ConnectionId, out var oldManager))
                    {
                        oldManager.Close();
                        await Clients.Caller.SendAsync("ConnectionClosed");
                    }
                }
            };
            
            _webRtcManagers[Context.ConnectionId] = manager;
            
            // Set remote description (offer from client)
            await manager.SetRemoteDescription(sdp, "offer");
            
            // Create and set local description (answer)
            var answer = await manager.CreateOffer();
            
            // Send answer to client
            await Clients.Caller.SendAsync("ReceiveAnswer", answer);
        }

        // Client sends an ICE candidate
        public async Task SendIceCandidate(dynamic candidate)
        {
            _logger.LogInformation($"Received ICE candidate from client: {Context.ConnectionId}");
            
            if (_webRtcManagers.TryGetValue(Context.ConnectionId, out var manager))
            {
                var iceCandidate = new RTCIceCandidateInit
                {
                    candidate = candidate.candidate.ToString(),
                    sdpMid = candidate.sdpMid.ToString(),
                    sdpMLineIndex = (int)candidate.sdpMLineIndex
                };
                
                await manager.AddIceCandidate(iceCandidate);
            }
        }
    }
}
