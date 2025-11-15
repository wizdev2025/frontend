import { View, Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { styles, colors } from './styles';
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={{ flex: 1, padding: 10 }}>
        <Pressable
          style={styles.buttonCard}
          onPress={() => router.push('/deaf')}
        >
          <Ionicons name="ear" size={64} color={colors.punchRed} style={{ marginBottom: 10 }} />
          <Text style={styles.buttonText}>Hearing Assistance</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, padding: 10 }}>
        <Pressable
          style={styles.buttonCard}
          onPress={() => router.push('/blind')}
        >
          <Ionicons name="eye" size={64} color={colors.punchRed} style={{ marginBottom: 10 }} />
          <Text style={styles.buttonTextDark}>Visual Assistance</Text>
        </Pressable>
      </View>
    </View>
  );
}
