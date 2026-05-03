import { Image as ExpoImage } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import idleSprite from '@/assets/ro/poring/poring-idle-sprite.png';
import walkSprite from '@/assets/ro/poring/poring-walk-sprite.png';
import drinkSprite from '@/assets/ro/poring/poring-drink-sprite.png';
import eatSprite from '@/assets/ro/poring/poring-eat-sprite.png';
import appleJuiceImg from '@/assets/ro/items/apple-juice.png';
import foodImg from '@/assets/ro/items/food.gif';
import heartSprite from '@/assets/ro/emotions/emotion-heart-sprite.png';

import { SpriteAnimation } from './sprite-animation';

// Scale 3 for idle/walk/eat; drink sprite is physically larger so scale 2 keeps it proportional.
// totalPlays matches Phaser original: drink repeat:2 (3 total), eat repeat:4 (5 total).
const SPRITES = {
  idle:  { source: idleSprite,  frameWidth: 41, frameHeight: 39, frameCount: 4,  frameRate: 8,  flipX: true,  scale: 2, columns: 4,  totalPlays: undefined },
  walk:  { source: walkSprite,  frameWidth: 41, frameHeight: 44, frameCount: 10, frameRate: 26, flipX: true,  scale: 2, columns: 10, totalPlays: undefined },
  drink: { source: drinkSprite, frameWidth: 74, frameHeight: 76, frameCount: 13, frameRate: 16, flipX: false, scale: 2, columns: 5,  totalPlays: 3 },
  eat:   { source: eatSprite,   frameWidth: 41, frameHeight: 32, frameCount: 10, frameRate: 20, flipX: true,  scale: 2, columns: 5,  totalPlays: 5 },
} as const;

// Heart emotion: 29 frames, 29×26 each, 5 cols × 6 rows, play twice then disappear
const HEART = { source: heartSprite, frameWidth: 29, frameHeight: 26, frameCount: 29, frameRate: 20, columns: 5, scale: 2, totalPlays: 2 };

// Fixed container height keeps caption bubble at a stable Y regardless of animation size
const CHAR_HEIGHT = 160;

type SpriteKey = keyof typeof SPRITES;
type Phase = 'ready' | 'focus' | 'rest' | 'finish';
type RestAction = 'drink' | 'eat';

function resolveSprite(phase: Phase, isOverTime: boolean, restAction: RestAction): SpriteKey {
  if (phase === 'focus' && !isOverTime) return 'walk';
  if (phase === 'rest' && !isOverTime) return restAction;
  return 'idle';
}

interface Props {
  phase: Phase;
  isOverTime: boolean;
}

export function PoringCharacter({ phase, isOverTime }: Props) {
  const isActiveRest = phase === 'rest' && !isOverTime;
  const isActiveRestRef = useRef(isActiveRest);
  isActiveRestRef.current = isActiveRest;

  const [restAction, setRestAction] = useState<RestAction>('eat');
  // Incremented to remount SpriteAnimation when the same rest action repeats
  const [cycleKey, setCycleKey] = useState(0);
  const [itemVisible, setItemVisible] = useState(false);
  const [heartVisible, setHeartVisible] = useState(false);
  const [heartKey, setHeartKey] = useState(0);

  // Start / stop rest cycling when entering or leaving active rest
  useEffect(() => {
    if (isActiveRest) {
      const action: RestAction = Math.random() < 0.5 ? 'drink' : 'eat';
      setRestAction(action);
      setItemVisible(true);
      setCycleKey(k => k + 1);
    }
    else {
      setItemVisible(false);
    }
  }, [isActiveRest]);

  // Trigger heart emotion when entering finish phase
  useEffect(() => {
    if (phase === 'finish') {
      setHeartKey(k => k + 1);
      setHeartVisible(true);
    }
    else {
      setHeartVisible(false);
    }
  }, [phase]);

  // Called when a drink or eat animation cycle finishes
  const handleRestComplete = () => {
    setItemVisible(false);
    setTimeout(() => {
      if (!isActiveRestRef.current) return;
      const next: RestAction = Math.random() < 0.5 ? 'drink' : 'eat';
      setRestAction(next);
      setCycleKey(k => k + 1);
      setItemVisible(true);
    }, 300);
  };

  const spriteKey = resolveSprite(phase, isOverTime, restAction);
  const cfg = SPRITES[spriteKey];
  const spriteH = cfg.frameHeight * cfg.scale;

  // Item offsets match Phaser's posAdjustConfig scaled for native sprite sizes.
  // Keep both rest items slightly lower so the sip / bite point sits closer to the poring mouth.
  const drinkItemStyle = {
    position: 'absolute' as const,
    width: 48,
    height: 48,
    bottom: -6,
    left: '50%' as const,
    marginLeft: -64, // -40 (left of center) - 24 (half item width)
  };
  const eatItemStyle = {
    position: 'absolute' as const,
    width: 80,
    height: 72,
    bottom: -10,
    left: '50%' as const,
    marginLeft: 38, // 52*1.5 (Phaser offset scaled) - 40 (half item width) = 78 - 40
  };
  const itemStyle = restAction === 'drink' ? drinkItemStyle : eatItemStyle;
  const itemSource = restAction === 'drink' ? appleJuiceImg : foodImg;

  // Heart floats above the poring's head (upper-left in original Phaser: x-45, y-45)
  const heartStyle = {
    position: 'absolute' as const,
    bottom: spriteH + 4,
    left: '50%' as const,
    marginLeft: -45 - (HEART.frameWidth * HEART.scale) / 2,
  };

  return (
    <View style={{ height: CHAR_HEIGHT, width: '100%', alignItems: 'center', justifyContent: 'flex-end' }}>
      {/* flipX wrapper: scaleX:-1 mirrors the sprite without affecting overflow:hidden inside */}
      <View style={cfg.flipX ? { transform: [{ scaleX: -1 }] } : undefined}>
        <SpriteAnimation
          key={`${spriteKey}-${cycleKey}`}
          source={cfg.source}
          frameWidth={cfg.frameWidth}
          frameHeight={cfg.frameHeight}
          frameCount={cfg.frameCount}
          frameRate={cfg.frameRate}
          columns={cfg.columns}
          scale={cfg.scale}
          totalPlays={isActiveRest ? cfg.totalPlays : undefined}
          onComplete={isActiveRest ? handleRestComplete : undefined}
        />
      </View>

      {/* Food / apple-juice item shown during rest */}
      {itemVisible && (
        <ExpoImage
          source={itemSource}
          style={itemStyle}
          contentFit="contain"
        />
      )}

      {/* Heart emotion shown when cycle is complete (finish phase) */}
      {heartVisible && (
        <View style={heartStyle}>
          <SpriteAnimation
            key={`heart-${heartKey}`}
            source={HEART.source}
            frameWidth={HEART.frameWidth}
            frameHeight={HEART.frameHeight}
            frameCount={HEART.frameCount}
            frameRate={HEART.frameRate}
            columns={HEART.columns}
            scale={HEART.scale}
            totalPlays={HEART.totalPlays}
            onComplete={() => setHeartVisible(false)}
          />
        </View>
      )}
    </View>
  );
}
