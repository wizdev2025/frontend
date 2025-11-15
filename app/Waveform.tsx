import { View, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { colors } from './styles';

export default function Waveform() {
  const bars = [useRef(new Animated.Value(0.3)).current,
                useRef(new Animated.Value(0.5)).current,
                useRef(new Animated.Value(0.4)).current,
                useRef(new Animated.Value(0.6)).current,
                useRef(new Animated.Value(0.3)).current];

  useEffect(() => {
    const animations = bars.map((bar, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: 0.8 + Math.random() * 0.2,
            duration: 300 + i * 50,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false
          }),
          Animated.timing(bar, {
            toValue: 0.2 + Math.random() * 0.2,
            duration: 300 + i * 50,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false
          })
        ])
      )
    );
    animations.forEach(anim => anim.start());
    return () => animations.forEach(anim => anim.stop());
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 60, gap: 8 }}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={{
            width: 6,
            backgroundColor: colors.textMain,
            borderRadius: 3,
            height: bar.interpolate({
              inputRange: [0, 1],
              outputRange: ['20%', '100%']
            })
          }}
        />
      ))}
    </View>
  );
}
