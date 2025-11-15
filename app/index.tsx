import { View, Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { styles } from './styles';

export default function Index() {
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.buttonGreen}
        onPress={() => router.push('/deaf')}
      >
        <Text style={styles.buttonText}>Hard of hearing</Text>
      </Pressable>

      <Pressable
        style={styles.buttonYellow}
        onPress={() => router.push('/blind')}
      >
        <Text style={styles.buttonTextDark}>Visually impaired</Text>
      </Pressable>
    </View>
  );
}
