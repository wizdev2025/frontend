import { View, Pressable, Text } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { styles } from './styles';
import { useRef } from 'react';

export default function Blind() {
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef(null);

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
    if (camera.current) {
      const photo = await camera.current.takePictureAsync();
      console.log(photo.uri);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={{ flex: 0.25, backgroundColor: '#9C27B0', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.buttonText}>MODE</Text>
      </Pressable>

      <View style={{ flex: 0.75 }}>
        <CameraView
          ref={camera}
          style={{ flex: 1 }}
          facing="back"
        />
        <Pressable
          onPress={takePicture}
          style={{
            position: 'absolute',
            bottom: 30,
            alignSelf: 'center',
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: 'white',
            borderWidth: 5,
            borderColor: '#333'
          }}
        />
      </View>
    </View>
  );
}
