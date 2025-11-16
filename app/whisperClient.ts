import { Audio } from 'expo-av';
import { ENDPOINTS } from './endpoints';

const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number = 300000) => {
  const controller = new AbortController();
  const startTime = Date.now();

  console.log(`[Fetch] Starting request to ${url}`);
  console.log(`[Fetch] Timeout set to ${timeoutMs}ms`);

  const timeout = setTimeout(() => {
    const elapsed = Date.now() - startTime;
    console.log(`[Fetch] TIMEOUT after ${elapsed}ms - aborting`);
    controller.abort();
  }, timeoutMs);

  controller.signal.addEventListener('abort', () => {
    const elapsed = Date.now() - startTime;
    console.log(`[Fetch] Signal aborted after ${elapsed}ms`);
  });

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    const elapsed = Date.now() - startTime;
    console.log(`[Fetch] Success after ${elapsed}ms - Status: ${response.status}`);
    return response;
  } catch (error: any) {
    clearTimeout(timeout);
    const elapsed = Date.now() - startTime;
    console.log(`[Fetch] FAILED after ${elapsed}ms`);
    console.log(`[Fetch] Error name: ${error.name}`);
    console.log(`[Fetch] Error message: ${error.message}`);
    console.log(`[Fetch] Error type: ${typeof error}`);
    console.log(`[Fetch] Error keys: ${Object.keys(error).join(', ')}`);
    console.log(`[Fetch] Full error:`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw error;
  }
};

export class WhisperClient {
  private recording: Audio.Recording | null = null;
  private onTranscript: (text: string) => void;
  private onSummary?: (text: string) => void;
  private prompt: string = '';

  constructor(
    onTranscript: (text: string) => void,
    onSummary?: (text: string) => void
  ) {
    this.onTranscript = onTranscript;
    this.onSummary = onSummary;
  }

  setPrompt(prompt: string) {
    this.prompt = prompt;
  }

  async startRecording(): Promise<void> {
    console.log('[Whisper] Requesting permissions');
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Microphone permission denied');
    }
    console.log('[Whisper] Permission granted');

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
    console.log('[Whisper] Recording started');
  }

  async stopRecording(): Promise<void> {
    if (!this.recording) {
      throw new Error('No recording in progress');
    }

    console.log('[Whisper] Stopping recording');
    await this.recording.stopAndUnloadAsync();
    const uri = this.recording.getURI();

    if (!uri) {
      this.recording = null;
      throw new Error('Failed to get recording URI');
    }
    console.log('[Whisper] Recording saved:', uri);

    console.log('[Whisper] Sending to transcription API');
    const formData = new FormData();
    formData.append('audio_file', {
      uri,
      type: 'audio/mp3',
      name: 'audio.mp3',
    } as any);

    try {
      const response = await fetchWithTimeout(ENDPOINTS.WHISPER_TRANSCRIBE, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }

      const transcript = await response.text();
      console.log('[Whisper] Transcript received:', transcript);
      this.onTranscript(transcript);

      if (this.prompt && this.onSummary) {
        console.log('[Whisper] Sending to summarization API with prompt:', this.prompt);
        const summaryFormData = new FormData();
        summaryFormData.append('text', `${this.prompt}\n\n${transcript}`);

        const summaryResponse = await fetchWithTimeout(ENDPOINTS.VLM_SUMMARIZE, {
          method: 'POST',
          body: summaryFormData,
        });

        if (!summaryResponse.ok) {
          throw new Error(`Summarization failed: ${summaryResponse.status}`);
        }

        const summaryData = await summaryResponse.json();
        console.log('[Whisper] Summary response:', JSON.stringify(summaryData));

        const summary = summaryData.output?.[0] || summaryData.summary || summaryData.text;
        if (summary) {
          console.log('[Whisper] Summary received');
          this.onSummary(summary);
        }
      }

      this.recording = null;
    } catch (error: any) {
      this.recording = null;
      const errorDetails = {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        code: error?.code,
        type: typeof error,
      };
      console.error('[Whisper] Error details:', JSON.stringify(errorDetails, null, 2));
      console.error('[Whisper] Full error object:', error);
      throw error;
    }
  }
}
