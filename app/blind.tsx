import { Stack } from 'expo-router';
import { View, Pressable, Text, TextInput, Alert } from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { styles, colors } from './styles';
import { useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { documentDirectory, writeAsStringAsync } from 'expo-file-system/legacy';

export default function Blind() {
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const backendUrl = 'https://fastapi-openshift-terminal.apps.cluster-xj5jp.xj5jp.sandbox664.opentlc.com/img_to_audio';

  if (!permission) {
    return <View />;
  }

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
    if (camera.current && !isProcessing) {
      try {
        setIsProcessing(true);
        console.log('[Camera] Taking picture...');
        const photo = await camera.current.takePictureAsync();
        console.log('[Camera] ✓ Picture taken:', photo.uri);

        console.log('[HTTP] Sending to', backendUrl);
        const formData = new FormData();
        formData.append('file', {
          uri: photo.uri,
          type: 'image/png',
          name: 'image.png',
        } as any);

        const response = await fetch(backendUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Log response details
        console.log('[HTTP] Status:', response.status, response.statusText);
        console.log('[HTTP] Headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));
        console.log('[HTTP] Content-Type:', response.headers.get('content-type'));

        if (!response.ok) {
          const errorText = await response.text();
          console.log('[HTTP] Error body:', errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        console.log('[HTTP] ✓ Response received');

        // Check if it's actually audio
        const contentType = response.headers.get('content-type');
        console.log('[HTTP] Actual content-type:', contentType);

        // Get audio as blob and save
        const blob = await response.blob();
        console.log('[Blob] Size:', blob.size, 'Type:', blob.type);

        const reader = new FileReader();

        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          console.log('[Base64] Length:', base64.length);
          console.log('[Base64] First 100 chars:', base64.substring(0, 100));

          // Save audio file
          const audioUri = documentDirectory + 'output.wav';
          await writeAsStringAsync(audioUri, base64, {
            encoding: 'base64',
          });
          console.log('[Audio] ✓ Saved to', audioUri);

          // Play audio
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
          });
          const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
          await sound.playAsync();
          console.log('[Audio] ✓ Playing');

          setIsProcessing(false);
        };

        reader.readAsDataURL(blob);

      } catch (error) {
        console.error('[Blind] ✗ Failed:', error);
        Alert.alert('Failed', String(error));
        setIsProcessing(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 0.75, padding: 10, paddingTop: 0 }}>
        <Pressable style={[styles.card, { flex: 1, overflow: 'hidden' }]} onPress={takePicture}>
          <CameraView
            ref={camera}
            style={{ flex: 1 }}
            facing="back"
          />
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
