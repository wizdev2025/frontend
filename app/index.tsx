import { View, Pressable, Text } from 'react-native';
import { router } from 'expo-router';

export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <Pressable
        style={{ flex: 1, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' }}
        onPress={() => router.push('/deaf')}
      >
        <Text style={{ fontSize: 24, color: 'white' }}>Deaf</Text>
      </Pressable>

      <Pressable
        style={{ flex: 1, backgroundColor: '#FFEB3B', justifyContent: 'center', alignItems: 'center' }}
        onPress={() => router.push('/blind')}
      >
        <Text style={{ fontSize: 24, color: 'black' }}>Blind</Text>
      </Pressable>
    </View>
  );
}
