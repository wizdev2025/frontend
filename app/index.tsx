import { View, Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { styles } from './styles';
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={{ flex: 1, padding: 10 }}>
        <Pressable
          style={[styles.buttonCard, styles.buttonGreen]}
          onPress={() => router.push('/deaf')}
        >
          <Ionicons name="ear" size={64} color="#fff" style={{ marginBottom: 10 }} />
          <Text style={styles.buttonText}>Need help hearing</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, padding: 10 }}>
        <Pressable
          style={[styles.buttonCard, styles.buttonYellow]}
          onPress={() => router.push('/blind')}
        >
          <Ionicons name="eye" size={64} color="#000" style={{ marginBottom: 10 }} />
          <Text style={styles.buttonTextDark}>Need help seeing</Text>
        </Pressable>
      </View>
    </View>
  );
}
