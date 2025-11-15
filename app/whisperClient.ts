import AudioRecord from 'react-native-audio-record';

export class WhisperClient {
  private host: string;
  private port: number;
  private ws: WebSocket | null = null;
  private uid: string;
  private serverReady: boolean = false;
  private onTranscript: (text: string) => void;
  private audioBuffer: Int16Array = new Int16Array(0);
  private CHUNK_SIZE = 8000;

  constructor(host: string, port: number, onTranscript: (text: string) => void) {
    this.host = host;
    this.port = port;
    this.onTranscript = onTranscript;
    this.uid = this.generateUUID();

    AudioRecord.init({
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
    });
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

    AudioRecord.on('data', (data: any) => {
      const base64 = data;
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      this.processAudioChunk(int16);
    });

    AudioRecord.start();
    console.log('[WhisperClient] Recording started');
  }

  private processAudioChunk(chunk: Int16Array): void {
    const newBuffer = new Int16Array(this.audioBuffer.length + chunk.length);
    newBuffer.set(this.audioBuffer);
    newBuffer.set(chunk, this.audioBuffer.length);
    this.audioBuffer = newBuffer;

    while (this.audioBuffer.length >= this.CHUNK_SIZE) {
      const chunkToSend = this.audioBuffer.slice(0, this.CHUNK_SIZE);
      this.audioBuffer = this.audioBuffer.slice(this.CHUNK_SIZE);

      const float32 = new Float32Array(this.CHUNK_SIZE);
      for (let i = 0; i < this.CHUNK_SIZE; i++) {
        float32[i] = chunkToSend[i] / 32768.0;
      }

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(float32.buffer);
        console.log(`[WhisperClient] Sent chunk: ${float32.length} samples`);
      }
    }
  }

  async stopRecording(): Promise<void> {
    console.log('[WhisperClient] Stopping recording...');

    AudioRecord.stop();

    if (this.audioBuffer.length > 0) {
      const float32 = new Float32Array(this.audioBuffer.length);
      for (let i = 0; i < this.audioBuffer.length; i++) {
        float32[i] = this.audioBuffer[i] / 32768.0;
      }
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(float32.buffer);
      }
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send('END_OF_AUDIO');
      console.log('[WhisperClient] Sent END_OF_AUDIO');
    }

    this.audioBuffer = new Int16Array(0);
  }

  disconnect(): void {
    console.log('[WhisperClient] Disconnecting...');
    AudioRecord.stop();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
