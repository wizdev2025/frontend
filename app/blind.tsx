import { View, Pressable, Text, Alert, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { styles, colors } from './styles';
import { useRef, useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { FileSystemUploadType, uploadAsync, documentDirectory, writeAsStringAsync, EncodingType} from 'expo-file-system/legacy';
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

export default function Blind() {
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={[styles.centerText, { backgroundColor: colors.buttonBackground }]}>
        <Pressable onPress={requestPermission}>
          <Text style={styles.pageText}>Grant Camera Permission</Text>
        </Pressable>
      </View>
    );
  }

  const takePicture = async () => {
    if (!camera.current || isProcessing) return;

    try {
      setIsProcessing(true);

      console.log('[Blind] Taking picture');
      const photo = await camera.current.takePictureAsync();
      console.log('[Blind] Picture taken:', photo.uri);

      setCurrentPhoto(photo.uri);

      console.log('[Blind] Sending to VLM using uploadAsync');

      const uploadResult = await uploadAsync(ENDPOINTS.VLM_DESCRIBE, photo.uri, {
        fieldName: 'file',
        httpMethod: 'POST',
        uploadType: FileSystemUploadType.MULTIPART,
      });

      console.log('[Blind] Upload complete - Status:', uploadResult.status);
      console.log('[Blind] Response body:', uploadResult.body);

      if (uploadResult.status !== 200) {
        throw new Error(`VLM failed: ${uploadResult.status}`);
      }

      const vlmData = JSON.parse(uploadResult.body);
      console.log('[Blind] VLM response parsed:', JSON.stringify(vlmData));

      const description = vlmData.output?.[0];
      if (!description) {
        throw new Error('No description in VLM response');
      }
      console.log('[Blind] Description:', description);

      console.log('[Blind] Sending to TTS');
      const ttsFormData = new FormData();
      ttsFormData.append('text', description);

      const ttsResponse = await fetchWithTimeout(ENDPOINTS.TTS, {
        method: 'POST',
        body: ttsFormData,
      });

      if (!ttsResponse.ok) {
        throw new Error(`TTS failed: ${ttsResponse.status}`);
      }

      console.log('[Blind] TTS response received');
      const blob = await ttsResponse.blob();
      console.log('[Blind] Audio blob size:', blob.size);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const audioUri = documentDirectory + 'output.wav';

        await writeAsStringAsync(audioUri, base64, { encoding: EncodingType.Base64 });
        console.log('[Blind] Audio saved:', audioUri);

        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync({ uri: audioUri });

        soundRef.current = sound;

        await sound.playAsync();
        console.log('[Blind] Playing audio');

        setCurrentPhoto(null);
        setIsProcessing(false);
      };

      reader.readAsDataURL(blob);
    } catch (error: any) {
      const errorDetails = {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        code: error?.code,
        type: typeof error,
      };
      console.error('[Blind] Error details:', JSON.stringify(errorDetails, null, 2));
      console.error('[Blind] Full error object:', error);
      Alert.alert('Error', `${error?.name || 'Error'}: ${error?.message || String(error)}`);
      setCurrentPhoto(null);
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, padding: 10, paddingTop: 0 }}>
        <Pressable style={[styles.card, { flex: 1, overflow: 'hidden' }]} onPress={takePicture}>
          {currentPhoto ? (
            <Image source={{ uri: currentPhoto }} style={{ flex: 1 }} resizeMode="cover" />
          ) : (
            <CameraView ref={camera} style={{ flex: 1 }} facing="back" />
          )}
        </Pressable>
      </View>
    </View>
  );
}
