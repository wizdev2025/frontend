class WhisperLiveClient {
    private host: string;
    private port: number;
    private language: string | null;
    private model: string;
    private useVad: boolean;
    private uid: string;
    private ws: WebSocket | null = null;
    private serverReady: boolean = false;
    private isRecording: boolean = false;
    private audioRecord: any = null;
    private onTranscription?: (text: string, segments: any[]) => void;
    private onConnectionStatus?: (status: string) => void;

    private SAMPLE_RATE = 16000;
    private CHUNK_SIZE = 8000;

    constructor(config: {
      host?: string;
      port?: number;
      language?: string | null;
      model?: string;
      useVad?: boolean;
      onTranscription?: (text: string, segments: any[]) => void;
      onConnectionStatus?: (status: string) => void;
    } = {}) {
      this.host = config.host || 'localhost';
      this.port = config.port || 9090;
      this.language = config.language || null;
      this.model = config.model || 'small';
      this.useVad = config.useVad !== undefined ? config.useVad : true;
      this.onTranscription = config.onTranscription;
      this.onConnectionStatus = config.onConnectionStatus;
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
        console.log('[WhisperLive] Connecting to:', url);
        this.onConnectionStatus?.('connecting');

        this.ws = new WebSocket(url);
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
          console.log('[WhisperLive] ✓ WebSocket connected');
          this.onConnectionStatus?.('connected');
          this.sendInitialConfig();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);

            if (message.message === 'SERVER_READY') {
              console.log('[WhisperLive] ✓ Server ready');
              resolve();
            }
          } catch (error) {
            console.error('[WhisperLive] ✗ Error parsing message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WhisperLive] ✗ WebSocket error:', error);
          this.onConnectionStatus?.('error');
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[WhisperLive] WebSocket closed');
          this.serverReady = false;
          this.onConnectionStatus?.('disconnected');
        };

        setTimeout(() => {
          if (!this.serverReady) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);
      });
    }

    private sendInitialConfig() {
      const config = {
        uid: this.uid,
        language: this.language,
        task: 'transcribe',
        model: this.model,
        use_vad: this.useVad,
        send_last_n_segments: 10,
        no_speech_thresh: 0.45,
        clip_audio: false,
        same_output_threshold: 10,
        enable_translation: false,
        target_language: 'en',
      };

      console.log('[WhisperLive] Sending config');
      this.ws?.send(JSON.stringify(config));
    }

    private handleMessage(message: any) {
      if (message.uid !== this.uid) {
        console.error('[WhisperLive] Invalid UID');
        return;
      }

      if (message.status) {
        console.log('[WhisperLive] Status:', message.status, message.message || '');
        return;
      }

      if (message.message === 'SERVER_READY') {
        this.serverReady = true;
        return;
      }

      if (message.language) {
        console.log(`[WhisperLive] Detected language: ${message.language}`);
        return;
      }

      if (message.segments) {
        this.handleSegments(message.segments);
      }
    }

    private handleSegments(segments: any[]) {
      console.log('[WhisperLive] Transcription received');
      const text = segments.map(seg => seg.text.trim()).join(' ');
      this.onTranscription?.(text, segments);
    }

    async startRecording() {
      const AudioRecord = require('react-native-audio-record').default;

      const options = {
        sampleRate: this.SAMPLE_RATE,
        channels: 1,
        bitsPerSample: 16,
        audioSource: 6,
        wavFile: 'temp.wav'
      };

      AudioRecord.init(options);
      this.audioRecord = AudioRecord;

      console.log('[WhisperLive] Starting recording');
      this.audioRecord.start();
      this.isRecording = true;

      this.audioRecord.on('data', (data: string) => {
        this.processAudioChunk(data);
      });
    }

    private processAudioChunk(base64Data: string) {
      try {
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const int16Array = new Int16Array(bytes.buffer);
        const float32Array = new Float32Array(int16Array.length);

        for (let i = 0; i < int16Array.length; i++) {
          float32Array[i] = int16Array[i] / 32768.0;
        }

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(float32Array.buffer);
        }
      } catch (error) {
        console.error('[WhisperLive] Error processing chunk:', error);
      }
    }

    async stopRecording() {
      console.log('[WhisperLive] Stopping recording');
      this.isRecording = false;

      if (this.audioRecord) {
        this.audioRecord.stop();
        this.audioRecord = null;
      }

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const endMessage = new TextEncoder().encode('END_OF_AUDIO');
        this.ws.send(endMessage);
        console.log('[WhisperLive] Sent END_OF_AUDIO');
      }
    }

    disconnect() {
      console.log('[WhisperLive] Disconnecting');

      if (this.isRecording) {
        this.stopRecording();
      }

      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    }

    getIsRecording(): boolean {
      return this.isRecording;
    }
  }

  export default WhisperLiveClient;
