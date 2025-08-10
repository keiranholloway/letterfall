// File: src/net/rtc.ts
import { compress, decompress } from 'lz-string';
import type { P2PMessage } from '../game/types';

export class WebRTCManager {
  private pc: RTCPeerConnection | null = null;
  private channel: RTCDataChannel | null = null;
  private isHost: boolean = false;
  
  private onMessage?: (message: P2PMessage) => void;
  private onConnection?: () => void;
  private onDisconnection?: () => void;
  private onError?: (error: string) => void;
  
  constructor() {
    this.setupPeerConnection();
  }
  
  private setupPeerConnection() {
    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    });
    
    this.pc.oniceconnectionstatechange = () => {
      const state = this.pc?.iceConnectionState;
      console.log('ICE connection state:', state);
      
      if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        this.onDisconnection?.();
      }
    };
    
    this.pc.ondatachannel = (event) => {
      if (!this.isHost) {
        this.setupDataChannel(event.channel);
      }
    };
  }
  
  private setupDataChannel(channel: RTCDataChannel) {
    this.channel = channel;
    
    channel.onopen = () => {
      console.log('Data channel opened');
      this.onConnection?.();
    };
    
    channel.onmessage = (event) => {
      try {
        const decompressed = decompress(event.data);
        const message = JSON.parse(decompressed || event.data);
        this.onMessage?.(message);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };
    
    channel.onclose = () => {
      console.log('Data channel closed');
      this.onDisconnection?.();
    };
    
    channel.onerror = (error) => {
      console.error('Data channel error:', error);
      this.onError?.('Data channel error');
    };
  }
  
  async createOffer(): Promise<string> {
    if (!this.pc) throw new Error('Peer connection not initialized');
    
    this.isHost = true;
    
    // Create data channel as host
    const channel = this.pc.createDataChannel('game', {
      ordered: true,
    });
    this.setupDataChannel(channel);
    
    // Create offer
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    
    // Wait for ICE gathering to complete
    await this.waitForICE();
    
    // Compress and encode the offer
    const offerData = {
      type: offer.type,
      sdp: this.pc.localDescription?.sdp,
    };
    
    const compressedOfferData = compress(JSON.stringify(offerData));
    return btoa(compressedOfferData).replace(/[+/]/g, c => c === '+' ? '-' : '_').replace(/=+$/, '');
  }
  
  async createAnswer(encodedOffer: string): Promise<string> {
    if (!this.pc) throw new Error('Peer connection not initialized');
    
    this.isHost = false;
    
    try {
      // Decode and decompress offer
      const normalizedOffer = encodedOffer.replace(/[-_]/g, c => c === '-' ? '+' : '/');
      const padding = '='.repeat((4 - normalizedOffer.length % 4) % 4);
      const compressedOffer = atob(normalizedOffer + padding);
      const decompressed = decompress(compressedOffer);
      const offerData = JSON.parse(decompressed || compressedOffer);
      
      // Set remote description
      await this.pc.setRemoteDescription(offerData);
      
      // Create answer
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      
      // Wait for ICE gathering
      await this.waitForICE();
      
      // Compress and encode answer
      const answerData = {
        type: answer.type,
        sdp: this.pc.localDescription?.sdp,
      };
      
      const compressedAnswer = compress(JSON.stringify(answerData));
      return btoa(compressedAnswer).replace(/[+/]/g, c => c === '+' ? '-' : '_').replace(/=+$/, '');
    } catch (error) {
      console.error('Failed to create answer:', error);
      throw new Error('Invalid offer format');
    }
  }
  
  async acceptAnswer(encodedAnswer: string): Promise<void> {
    if (!this.pc) throw new Error('Peer connection not initialized');
    
    try {
      // Decode and decompress answer
      const normalizedAnswer = encodedAnswer.replace(/[-_]/g, c => c === '-' ? '+' : '/');
      const padding = '='.repeat((4 - normalizedAnswer.length % 4) % 4);
      const compressedAnswerData = atob(normalizedAnswer + padding);
      const decompressed = decompress(compressedAnswerData);
      const answerData = JSON.parse(decompressed || compressedAnswerData);
      
      // Set remote description
      await this.pc.setRemoteDescription(answerData);
    } catch (error) {
      console.error('Failed to accept answer:', error);
      throw new Error('Invalid answer format');
    }
  }
  
  private waitForICE(): Promise<void> {
    return new Promise((resolve) => {
      if (this.pc?.iceGatheringState === 'complete') {
        resolve();
        return;
      }
      
      const checkState = () => {
        if (this.pc?.iceGatheringState === 'complete') {
          this.pc.removeEventListener('icegatheringstatechange', checkState);
          resolve();
        }
      };
      
      this.pc?.addEventListener('icegatheringstatechange', checkState);
      
      // Fallback timeout
      setTimeout(resolve, 5000);
    });
  }
  
  sendMessage(message: P2PMessage): void {
    if (this.channel?.readyState === 'open') {
      try {
        const compressed = compress(JSON.stringify(message));
        this.channel.send(compressed);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  }
  
  close(): void {
    this.channel?.close();
    this.pc?.close();
    this.channel = null;
    this.pc = null;
  }
  
  // Event handlers
  onMessageReceived(handler: (message: P2PMessage) => void) {
    this.onMessage = handler;
  }
  
  onConnected(handler: () => void) {
    this.onConnection = handler;
  }
  
  onDisconnected(handler: () => void) {
    this.onDisconnection = handler;
  }
  
  onErrorOccurred(handler: (error: string) => void) {
    this.onError = handler;
  }
  
  get isConnected(): boolean {
    return this.channel?.readyState === 'open';
  }
  
  get connectionState(): string {
    return this.pc?.connectionState || 'disconnected';
  }
}