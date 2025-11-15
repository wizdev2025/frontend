import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';

export default function RootLayout() {
  const [loaded] = useFonts({
    'Atkinson': require('../assets/fonts/AtkinsonHyperlegible-Regular.ttf'),
    // 'Atkinson-Bold': require('../assets/fonts/AtkinsonHyperlegible-Bold.ttf'),
  });

  if (!loaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
