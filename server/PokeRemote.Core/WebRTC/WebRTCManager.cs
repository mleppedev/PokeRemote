using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SIPSorcery.Net;

namespace PokeRemote.Core.WebRTC
{
    public class WebRTCManager
    {
        private RTCPeerConnection _peerConnection;
        private RTCDataChannel _dataChannel;
        private readonly List<RTCIceCandidate> _pendingIceCandidates = new List<RTCIceCandidate>();
        private bool _isRemoteDescriptionSet = false;

        // Events
        public event EventHandler<RTCIceCandidateEvent> OnIceCandidate;
        public event EventHandler<RTCDataChannelEvent> OnDataChannel;
        public event EventHandler<RTCPeerConnectionState> OnConnectionStateChange;
        
        // Setup WebRTC with STUN/TURN servers
        public void Initialize()
        {
            var config = new RTCConfiguration
            {
                iceServers = new List<RTCIceServer>
                {
                    new RTCIceServer
                    {
                        urls = "stun:stun.l.google.com:19302"
                    }
                }
            };
            
            _peerConnection = new RTCPeerConnection(config);

            // Setup event handlers
            _peerConnection.onicecandidate += (candidate) => OnIceCandidate?.Invoke(this, new RTCIceCandidateEvent(candidate));
            _peerConnection.ondatachannel += (dc) => OnDataChannel?.Invoke(this, new RTCDataChannelEvent(dc));
            _peerConnection.onconnectionstatechange += (state) => OnConnectionStateChange?.Invoke(this, state);
        }

        // Create offer for WebRTC negotiation
        public async Task<string> CreateOffer()
        {
            var offer = _peerConnection.createOffer(null);
            await _peerConnection.setLocalDescription(offer);
            return offer.sdp;
        }

        // Set remote description (answer from client)
        public async Task SetRemoteDescription(string sdp, string type)
        {
            var remoteDescription = new RTCSessionDescriptionInit
            {
                sdp = sdp,
                type = type == "answer" ? RTCSdpType.answer : RTCSdpType.offer
            };

            await _peerConnection.setRemoteDescription(remoteDescription);
            _isRemoteDescriptionSet = true;

            // Process any pending ICE candidates
            foreach (var candidate in _pendingIceCandidates)
            {
                await _peerConnection.addIceCandidate(candidate);
            }
            _pendingIceCandidates.Clear();
        }

        // Create data channel for control messages
        public RTCDataChannel CreateDataChannel(string label)
        {
            _dataChannel = _peerConnection.createDataChannel(label, null);
            return _dataChannel;
        }

        // Add ICE candidate received from client
        public async Task AddIceCandidate(RTCIceCandidateInit candidate)
        {
            var iceCandidate = new RTCIceCandidate(candidate);
            
            if (_isRemoteDescriptionSet)
            {
                await _peerConnection.addIceCandidate(iceCandidate);
            }
            else
            {
                _pendingIceCandidates.Add(iceCandidate);
            }
        }

        // Close connection
        public void Close()
        {
            _dataChannel?.close();
            _peerConnection?.close();
        }
    }

    public class RTCIceCandidateEvent : EventArgs
    {
        public RTCIceCandidate Candidate { get; }

        public RTCIceCandidateEvent(RTCIceCandidate candidate)
        {
            Candidate = candidate;
        }
    }

    public class RTCDataChannelEvent : EventArgs
    {
        public RTCDataChannel Channel { get; }

        public RTCDataChannelEvent(RTCDataChannel channel)
        {
            Channel = channel;
        }
    }
}
