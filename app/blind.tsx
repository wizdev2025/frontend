import { View, Pressable, Text, TextInput, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { styles, colors } from './styles';
import { useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { documentDirectory, writeAsStringAsync } from 'expo-file-system/legacy';
import { ENDPOINTS } from './endpoints';

export default function Blind() {
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

      console.log('[Blind] Sending to VLM');
      const formData = new FormData();
      formData.append('file', {
        uri: photo.uri,
        type: 'image/png',
        name: 'image.png',
      } as any);

      const vlmResponse = await fetch(ENDPOINTS.VLM_DESCRIBE, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!vlmResponse.ok) {
        throw new Error(`VLM failed: ${vlmResponse.status}`);
      }

      const vlmData = await vlmResponse.json();
      console.log('[Blind] VLM response:', JSON.stringify(vlmData));

      const description = vlmData.output?.[0];
      if (!description) {
        throw new Error('No description in VLM response');
      }
      console.log('[Blind] Description:', description);

      console.log('[Blind] Sending to TTS');
      const ttsFormData = new FormData();
      ttsFormData.append('text', description);

      const ttsResponse = await fetch(ENDPOINTS.TTS, {
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

        await writeAsStringAsync(audioUri, base64, { encoding: 'base64' });
        console.log('[Blind] Audio saved:', audioUri);

        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
        await sound.playAsync();
        console.log('[Blind] Playing audio');

        setIsProcessing(false);
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('[Blind] Error:', error);
      Alert.alert('Error', String(error));
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 0.75, padding: 10, paddingTop: 0 }}>
        <Pressable style={[styles.card, { flex: 1, overflow: 'hidden' }]} onPress={takePicture}>
          <CameraView ref={camera} style={{ flex: 1 }} facing="back" />
        </Pressable>
      </View>

      <View style={{ flex: 0.25, padding: 10 }}>
        <TextInput
          style={[styles.inputCard, {
            flex: 1,
            backgroundColor: colors.white,
            padding: 10,
            fontSize: 38,
            textAlignVertical: 'top',
            textAlign: 'center'
          }]}
          placeholder="Enter detailed questions (optional)"
          placeholderTextColor={colors.textMainVisual}
          value={prompt}
          onChangeText={setPrompt}
          editable={!isProcessing}
          multiline
        />
      </View>
    </View>
  );
}
