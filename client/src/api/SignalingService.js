import * as signalR from '@microsoft/signalr';

class SignalingService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.onIceCandidateCallback = null;
    this.onAnswerCallback = null;
  }

  async connect(serverUrl) {
    try {
      // Create the SignalR connection
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${serverUrl}/signaling`)
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Set up handlers for received messages
      this.connection.on('ReceiveAnswer', (sdp) => {
        console.log('Received SDP answer from server');
        if (this.onAnswerCallback) {
          this.onAnswerCallback(sdp);
        }
      });

      this.connection.on('ReceiveIceCandidate', (candidate) => {
        console.log('Received ICE candidate from server');
        if (this.onIceCandidateCallback) {
          this.onIceCandidateCallback(candidate);
        }
      });

      this.connection.on('ConnectionClosed', () => {
        console.log('Server connection closed');
        this.isConnected = false;
      });

      // Start the connection
      await this.connection.start();
      console.log('Connected to signaling server!');
      this.isConnected = true;
      return true;

    } catch (err) {
      console.error('Error connecting to signaling server:', err);
      this.isConnected = false;
      return false;
    }
  }

  async sendOffer(offer) {
    if (!this.isConnected) {
      throw new Error('Not connected to signaling server');
    }

    try {
      await this.connection.invoke('SendOffer', offer);
      console.log('Offer sent to server');
    } catch (err) {
      console.error('Error sending offer:', err);
      throw err;
    }
  }

  async sendIceCandidate(candidate) {
    if (!this.isConnected) {
      throw new Error('Not connected to signaling server');
    }

    try {
      await this.connection.invoke('SendIceCandidate', candidate);
      console.log('ICE candidate sent to server');
    } catch (err) {
      console.error('Error sending ICE candidate:', err);
      throw err;
    }
  }

  onAnswer(callback) {
    this.onAnswerCallback = callback;
  }

  onIceCandidate(callback) {
    this.onIceCandidateCallback = callback;
  }

  disconnect() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
      this.isConnected = false;
      console.log('Disconnected from signaling server');
    }
  }
}

export default new SignalingService();
