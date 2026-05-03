import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';

const bgSource = require('@/assets/ro/backgrounds/bg-0.png');
// const bgSource = require('@/assets/ro/backgrounds/bg-1.png');

const BG_NATURAL_WIDTH = 1228;
const BG_NATURAL_HEIGHT = 800;
// Original Phaser speed: 2px/frame at ~60fps = 120px/s. We match that on the scaled image.
const SCROLL_SPEED_PPS = 120;

interface Props {
  scrolling: boolean;
  stageWidth: number;
  stageHeight: number;
}

export function ScrollingBackground({ scrolling, stageHeight }: Props) {
  const bgScale = stageHeight / BG_NATURAL_HEIGHT;
  const bgScaledWidth = BG_NATURAL_WIDTH * bgScale;
  const scrollDuration = (bgScaledWidth / SCROLL_SPEED_PPS) * 1000;

  const translateX = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    animRef.current?.stop();
    animRef.current = null;

    if (scrolling && bgScaledWidth > 0) {
      translateX.setValue(0);
      animRef.current = Animated.loop(
        Animated.timing(translateX, {
          toValue: -bgScaledWidth,
          duration: scrollDuration,
          useNativeDriver: true,
        }),
      );
      animRef.current.start();
    }

    return () => {
      animRef.current?.stop();
      animRef.current = null;
    };
  }, [scrolling, bgScaledWidth, scrollDuration, translateX]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.row, { transform: [{ translateX }] }]}>
        <Image source={bgSource} style={{ width: bgScaledWidth, height: stageHeight }} resizeMode="stretch" />
        <Image source={bgSource} style={{ width: bgScaledWidth, height: stageHeight }} resizeMode="stretch" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});
