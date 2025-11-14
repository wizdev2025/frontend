import { View, Text } from 'react-native';

export default function Blind() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 32 }}>blind</Text>
    </View>
  );
}


// Expo Router = file-based routing. File structure = URL structure.

// app/
//   index.tsx       → "/"
//   deaf.tsx        → "/deaf"
//   blind.tsx       → "/blind"

