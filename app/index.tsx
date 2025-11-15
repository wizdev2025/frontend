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
          <Text style={styles.buttonText}>Hearing </Text>
          <Ionicons name="ear" size={64} color={colors.textMain} style={{ marginBottom: 10 }} />
          <Text style={styles.buttonText}>Assistance</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, padding: 10 }}>
        <Pressable
          style={styles.buttonCard}
          onPress={() => router.push('/blind')}
        >
          <Text style={styles.buttonTextDark}>Visual</Text>
          <Ionicons name="eye" size={128} color={colors.textMain} style={{ marginBottom: 10 }} />
          <Text style={styles.buttonTextDark}>Assistance</Text>
        </Pressable>
      </View>
    </View>
  );
}
