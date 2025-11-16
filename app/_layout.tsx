import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Text } from 'react-native';
import { colors } from './styles';

export default function RootLayout() {
  const [loaded] = useFonts({
    'Atkinson': require('../assets/fonts/AtkinsonHyperlegible-Regular.ttf'),
    'Atkinson-Bold': require('../assets/fonts/AtkinsonHyperlegible-Bold.ttf'),
  });

  if (!loaded) return null;

  return (
    <Stack screenOptions={{
      title: 'Bridge',
      headerRight: () => (
        <Text style={{
          color: colors.red,
          fontFamily: 'Atkinson-Bold',
          marginRight: 15,
          fontSize: 17
        }}>
          Powered By OpenShift AI
        </Text>
      ),
      headerShown: true,
      headerStyle: { backgroundColor: colors.white },
      headerTintColor: colors.textMainVisual,
      headerTitleStyle: { fontFamily: 'Atkinson-Bold', fontSize: 30}
    }} />
  );
}
