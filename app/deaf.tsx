import { View, Pressable, Text } from 'react-native';
import { styles } from './styles';

export default function Deaf() {
  return (
    <View style={styles.container}>
      <Pressable style={{ flex: 0.25, backgroundColor: '#2196F3', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.buttonText}>SUMMARIZE</Text>
      </Pressable>

      <View style={{ flex: 0.5, backgroundColor: 'white' }} />

      <Pressable style={{ flex: 0.25, backgroundColor: '#F44336', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.buttonText}>RECORD</Text>
      </Pressable>
    </View>
  );
}
