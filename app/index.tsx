import { View, Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { styles } from './styles';

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={{ flex: 1, padding: 10 }}>
        <Pressable
          style={[styles.buttonCard, styles.buttonGreen]}
          onPress={() => router.push('/deaf')}
        >
          <Text style={styles.buttonText}>Hard of hearing</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, padding: 10 }}>
        <Pressable
          style={[styles.buttonCard, styles.buttonYellow]}
          onPress={() => router.push('/blind')}
        >
          <Text style={styles.buttonTextDark}>Visually impaired</Text>
        </Pressable>
      </View>
    </View>
  );
}
