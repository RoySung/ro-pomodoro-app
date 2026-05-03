import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

export interface RetroWindowProps {
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  status?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

export function RetroWindow({ title, children, footer, status, style }: RetroWindowProps) {
  return (
    <View style={[styles.windowWrap, style]}>
      <LinearGradient
        colors={['#cbd7f9', '#b4c4ed', '#c5d2f7', '#b0c0ea', '#cbd7f9', '#b4c4ed', '#c5d2f7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.windowTopBar}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.55)', 'rgba(164,179,221,0.4)', 'rgba(255,255,255,0.45)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.windowBallWrap}>
          <View style={styles.windowBallHighlight} />
        </View>
        <Text style={styles.windowTitle}>{title}</Text>
        <View style={styles.windowBallWrap}>
          <View style={styles.windowBallHighlight} />
        </View>
      </LinearGradient>
      <View style={styles.windowBody}>
        {children}
        {footer ? <View style={styles.windowFooter}>{footer}</View> : null}
      </View>
      {status ? <View style={styles.windowStatus}>{status}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  windowWrap: {
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#7d8cb4',
    backgroundColor: '#f6fbfb',
  },
  windowTopBar: {
    height: 25,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e2f54',
  },
  windowTitle: {
    flex: 1,
    marginHorizontal: 8,
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#13203b',
  },
  windowBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f4f8f4',
  },
  windowFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#c4d1eb',
  },
  windowStatus: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: 'rgba(248, 252, 251, 0.94)',
  },
  windowBallWrap: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#303e6c',
    borderWidth: 1,
    borderColor: '#6f85c1',
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  windowBallHighlight: {
    width: 8,
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(238,255,255,0.55)',
    marginTop: 2,
  },
});
