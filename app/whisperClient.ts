import { Audio } from 'expo-av';

export class WhisperClient {
  private backendUrl: string;
  private recording: Audio.Recording | null = null;
  private onTranscript: (text: string) => void;

  constructor(host: string, port: number, onTranscript: (text: string) => void) {
    const protocol = host.includes('.') ? 'https' : 'http';
    const portStr = host.includes('.') ? '' : `:${port}`;
    this.backendUrl = `${protocol}://${host}${portStr}/transcribe_audio`;
    this.onTranscript = onTranscript;
  }

  async startRecording(): Promise<void> {
    console.log('[Audio] Requesting permissions...');
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Microphone permission denied');
    }
    console.log('[Audio] ✓ Permission granted');

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    this.recording = new Audio.Recording();
    await this.recording.prepareToRecordAsync({
      android: {
        extension: '.mp3',
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 128000,
      },
      ios: {
        extension: '.mp3',
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 128000,
      },
      web: {},
    });

    await this.recording.startAsync();
    console.log('[Audio] ✓ Recording started');
  }

  async stopRecording(): Promise<string> {
    if (!this.recording) throw new Error('No recording in progress');

    console.log('[Audio] Stopping recording...');
    await this.recording.stopAndUnloadAsync();
    const uri = this.recording.getURI();

    if (!uri) {
      this.recording = null;
      throw new Error('Failed to get recording URI');
    }
    console.log('[Audio] ✓ Recording saved:', uri);

    console.log('[HTTP] Sending to', this.backendUrl);
    const formData = new FormData();
    formData.append('audio_file', {
      uri,
      type: 'audio/mp3',
      name: 'audio.mp3',
    } as any);

    try {
      const response = await fetch(this.backendUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const transcript = await response.text();
      console.log('[HTTP] ✓ Response received');
      console.log('[HTTP] Transcript:', transcript);

      this.recording = null;
      this.onTranscript(transcript);
      return transcript;
    } catch (error) {
      this.recording = null;
      console.error('[HTTP] ✗ Request failed:', error);
      throw error;
    }
  }
}
