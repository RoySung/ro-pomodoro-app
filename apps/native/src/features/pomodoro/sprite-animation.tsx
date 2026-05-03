import { useEffect, useRef, useState } from 'react';
import { Image, View } from 'react-native';

interface Props {
  source: number;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  frameRate: number;
  columns?: number;
  scale?: number;
  // undefined = loop forever; N = play exactly N times then call onComplete
  totalPlays?: number;
  onComplete?: () => void;
}

export function SpriteAnimation({
  source,
  frameWidth,
  frameHeight,
  frameCount,
  frameRate,
  columns,
  scale = 1,
  totalPlays,
  onComplete,
}: Props) {
  const [frame, setFrame] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let current = 0;
    let plays = 0;
    setFrame(0);

    const id = setInterval(() => {
      current += 1;
      if (current >= frameCount) {
        plays += 1;
        if (totalPlays !== undefined && plays >= totalPlays) {
          clearInterval(id);
          onCompleteRef.current?.();
          return;
        }
        current = 0;
      }
      setFrame(current);
    }, 1000 / frameRate);

    return () => clearInterval(id);
  }, [frameCount, frameRate, totalPlays]);

  const cols = columns ?? frameCount;
  const rows = Math.ceil(frameCount / cols);
  const col = frame % cols;
  const row = Math.floor(frame / cols);
  const scaledW = frameWidth * scale;
  const scaledH = frameHeight * scale;

  return (
    <View style={{ width: scaledW, height: scaledH, overflow: 'hidden' }}>
      <Image
        source={source}
        style={{
          width: cols * frameWidth * scale,
          height: rows * frameHeight * scale,
          transform: [{ translateX: -col * scaledW }, { translateY: -row * scaledH }],
        }}
        resizeMode="stretch"
      />
    </View>
  );
}
