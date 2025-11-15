import { View, Pressable, Text, TextInput, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { styles } from './styles';
import { useRef, useState } from 'react';

export default function Blind() {
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const backendUrl = 'https://vllm-app-openshift-terminal.apps.cluster-xj5jp.xj5jp.sandbox664.opentlc.com/describe_image';

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerText}>
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
        console.log('[Camera] âœ“ Picture taken:', photo.uri);

        console.log('[HTTP] Sending to', backendUrl);
        const formData = new FormData();
        formData.append('file', {
          uri: photo.uri,
          type: 'image/jpeg',
          name: 'image.jpeg',
        } as any);

        const response = await fetch(backendUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        console.log('[HTTP] âœ“ Response received');
        const data = await response.json();
        console.log('[HTTP] Response data:', JSON.stringify(data));

        const description = data.output && data.output[0] ? data.output[0] : '';
        console.log('[HTTP] Description:', description);
        setPrompt(description);

        setIsProcessing(false);
      } catch (error) {
        console.error('[Blind] âœ— Failed:', error);
        Alert.alert('Failed', String(error));
        setIsProcessing(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 0.25, padding: 10 }}>
        <TextInput
          style={[styles.inputCard, {
            flex: 1,
            backgroundColor: isProcessing ? '#f5f5f5' : '#fff',
            padding: 10,
            fontSize: 18,
            textAlignVertical: 'top'
          }]}
          placeholder="Enter detailed questions (optional)"
          value={prompt}
          onChangeText={setPrompt}
          editable={!isProcessing}
          multiline
        />
      </View>

      <View style={{ flex: 0.75, padding: 10, paddingTop: 0 }}>
        <Pressable style={[styles.card, { flex: 1, overflow: 'hidden' }]} onPress={takePicture}>
          <CameraView
            ref={camera}
            style={{ flex: 1 }}
            facing="back"
          />
        </Pressable>
      </View>
    </View>
  );
}
