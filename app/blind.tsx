import { View, Text } from 'react-native';
import { styles } from './styles';

export default function Blind() {
  return (
    <View style={styles.centerText}>
      <Text style={styles.pageText}>blind</Text>
    </View>
  );
}
