import { Audio } from 'expo-av';

export class WhisperClient {
  private host: string;
  private port: number;
  private ws: WebSocket | null = null;
  private recording: Audio.Recording | null = null;
  private uid: string;
  private serverReady: boolean = false;
  private isRecording: boolean = false;
  private onTranscript: (text: string) => void;

  constructor(host: string, port: number, onTranscript: (text: string) => void) {
    this.host = host;
    this.port = port;
    this.onTranscript = onTranscript;
    this.uid = this.generateUUID();
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `ws://${this.host}:${this.port}`;
      console.log(`[WhisperClient] Connecting to ${url}...`);

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[WhisperClient] ✓ WebSocket connected');
        this.sendInitialConfig();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);

          if (message.message === 'SERVER_READY') {
            resolve();
          }
        } catch (error) {
          console.error('[WhisperClient] Error parsing message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WhisperClient] ✗ WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('[WhisperClient] WebSocket closed');
        this.serverReady = false;
      };

      setTimeout(() => {
        if (!this.serverReady) {
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  private sendInitialConfig(): void {
    const config = {
      uid: this.uid,
      language: null,
      task: 'transcribe',
      model: 'small',
      use_vad: true,
      send_last_n_segments: 10,
      no_speech_thresh: 0.45,
      clip_audio: false,
      same_output_threshold: 10,
      enable_translation: false,
      target_language: 'en',
    };

    console.log('[WhisperClient] Sending config');
    this.ws?.send(JSON.stringify(config));
  }

  private handleMessage(message: any): void {
    if (message.uid !== this.uid) {
      console.error('[WhisperClient] Invalid UID');
      return;
    }

    if (message.message === 'SERVER_READY') {
      console.log('[WhisperClient] ✓ Server ready');
      this.serverReady = true;
      return;
    }

    if (message.language) {
      console.log(`[WhisperClient] Detected language: ${message.language}`);
      return;
    }

    if (message.segments) {
      const text = message.segments.map((seg: any) => seg.text).join(' ');
      console.log('[WhisperClient] Transcription:', text);
      this.onTranscript(text);
    }
  }

  async startRecording(): Promise<void> {
    console.log('[WhisperClient] Starting recording...');

    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    this.recording = new Audio.Recording();

    await this.recording.prepareToRecordAsync({
      android: {
        extension: '.wav',
        outputFormat: Audio.AndroidOutputFormat.DEFAULT,
        audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 128000,
      },
      ios: {
        extension: '.wav',
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
      },
    });

    this.recording.setOnRecordingStatusUpdate((status) => {
      if (status.isRecording && status.durationMillis % 500 < 50) {
        this.sendAudioChunk();
      }
    });

    await this.recording.startAsync();
    this.isRecording = true;
    console.log('[WhisperClient] Recording started');
  }

  private async sendAudioChunk(): Promise<void> {
    // Note: expo-av doesn't support real-time streaming
    // This is a simplified version - for production, use expo-av with streaming
    // or a different audio library that supports chunk-by-chunk recording
  }

  async stopRecording(): Promise<void> {
    if (!this.recording) return;

    console.log('[WhisperClient] Stopping recording...');
    this.isRecording = false;

    await this.recording.stopAndUnloadAsync();
    const uri = this.recording.getURI();

    if (uri) {
      await this.sendAudioFile(uri);
    }

    this.recording = null;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const endMessage = 'END_OF_AUDIO';
      this.ws.send(endMessage);
      console.log('[WhisperClient] Sent END_OF_AUDIO');
    }
  }

  private async sendAudioFile(uri: string): Promise<void> {
    console.log('[WhisperClient] Sending audio file...');

    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    const int16Array = new Int16Array(arrayBuffer);
    const float32Array = new Float32Array(int16Array.length);

    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const CHUNK_SIZE = 8000;
    for (let i = 0; i < float32Array.length; i += CHUNK_SIZE) {
      const chunk = float32Array.slice(i, i + CHUNK_SIZE);
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(chunk.buffer);
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('[WhisperClient] Audio file sent');
  }

  disconnect(): void {
    console.log('[WhisperClient] Disconnecting...');

    if (this.isRecording) {
      this.stopRecording();
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
