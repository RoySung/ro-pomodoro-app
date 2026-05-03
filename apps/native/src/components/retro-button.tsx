import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

interface RetroButtonProps {
  label: string
  onPress: () => void
  compact?: boolean
  wide?: boolean
}

// Bubble highlight: bright white band on top half, warm gray base on bottom half
const FACE_NORMAL = ['#eceae8', '#eceae8', '#f4f3f2', '#ffffff'] as const;
const FACE_PRESSED = ['#dcdad8', '#dcdad8', '#d8d6d4', '#d0cecc'] as const;

export function RetroButton({ label, onPress, compact, wide }: RetroButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={wide ? styles.wrapWide : styles.wrap}
    >
      {({ pressed }) => (
        <LinearGradient
          colors={pressed ? FACE_PRESSED : FACE_NORMAL}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[
            styles.face,
            compact && styles.faceCompact,
            wide && styles.faceWide,
            pressed ? styles.facePressed : styles.faceRaised,
          ]}
        >
          <Text style={[styles.label, pressed && styles.labelPressed]}>{label}</Text>
        </LinearGradient>
      )}
    </Pressable>
  );
}

export function RetroIconButton({ name, onPress }: { name: React.ComponentProps<typeof Ionicons>['name']; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      {({ pressed }) => (
        <LinearGradient
          colors={pressed ? FACE_PRESSED : FACE_NORMAL}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.faceIcon, pressed ? styles.facePressed : styles.faceRaised]}
        >
          <Ionicons name={name} size={18} color="#1e3260" />
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  wrapWide: {
    alignSelf: 'stretch',
  },
  // Raised: white/light top-left, dark bottom-right
  faceRaised: {
    borderTopColor: '#ffffff',
    borderLeftColor: '#ffffff',
    borderBottomColor: '#7a7875',
    borderRightColor: '#7a7875',
  },
  // Sunken: dark top-left, light bottom-right
  facePressed: {
    borderTopColor: '#7a7875',
    borderLeftColor: '#7a7875',
    borderBottomColor: '#ffffff',
    borderRightColor: '#ffffff',
  },
  face: {
    minWidth: 80,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceCompact: {
    minWidth: 52,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  faceWide: {
    minWidth: undefined,
    height: 38,
  },
  faceIcon: {
    width: 38,
    height: 38,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#1a2a4a',
    textAlign: 'center',
  },
  labelPressed: {
    transform: [{ translateX: 0.5 }, { translateY: 0.5 }],
  },
});
