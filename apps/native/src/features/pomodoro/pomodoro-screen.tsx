import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import mvpIcon from '@/assets/ro/items/mvp-icon.png';
import mvpSpriteImg from '@/assets/ro/items/mvp-sprite.png';

import { PoringCharacter } from './poring-character';
import { RetroButton, RetroIconButton } from '@/components/retro-button';
import { RetroWindow } from './retro-window';
import { ScrollingBackground } from './scrolling-background';
import { SettingsModal } from './settings-modal';
import { SpriteAnimation } from './sprite-animation';

import { type ChartBarDatum } from './domain';
import { useBackgroundMusic } from './use-background-music';
import { usePomodoroController } from './use-pomodoro-controller';

const STAGE_RATIO = 360 / 720;

interface ReportModalProps {
  visible: boolean
  onClose: () => void
  todayCount: number
  weekCount: number
  monthCount: number
  weekRangeLabel: string
  yearLabel: string
  weekBars: ChartBarDatum[]
  monthBars: ChartBarDatum[]
  onPrevWeek: () => void
  onNextWeek: () => void
  onPrevYear: () => void
  onNextYear: () => void
}

const phaseCaption = {
  ready: 'Everything is packed. Tap start when you are ready.',
  focus: 'Poring is patrolling while you work.',
  rest: 'Break time. Slow down before the next sprint.',
  finish: 'Cycle complete. Saving the record now.',
} as const;

function BarRow({ item, maxCount }: { item: ChartBarDatum; maxCount: number }) {
  const widthRatio = maxCount === 0 ? 0 : item.count / maxCount;

  return (
    <View style={styles.barRow}>
      <Text style={styles.reportAxisLabel}>{item.label}</Text>
      <View style={styles.barTrack}>
        <LinearGradient
          colors={['#ffb3a7', '#ff8e7c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.barFill, { width: `${Math.max(widthRatio * 100, item.count > 0 ? 8 : 0)}%` }]}
        />
      </View>
      <Text style={styles.reportAxisCount}>{item.count}</Text>
    </View>
  );
}

function ReportModal({
  visible,
  onClose,
  todayCount,
  weekCount,
  monthCount,
  weekRangeLabel,
  yearLabel,
  weekBars,
  monthBars,
  onPrevWeek,
  onNextWeek,
  onPrevYear,
  onNextYear,
}: ReportModalProps) {
  const maxWeekCount = Math.max(0, ...weekBars.map(item => item.count));
  const maxMonthCount = Math.max(0, ...monthBars.map(item => item.count));

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.modalBarrier} onPress={onClose} />
        <RetroWindow title="Report" style={[styles.modalWindow, styles.reportWindow]}>
          <ScrollView style={styles.reportScroll} contentContainerStyle={styles.reportScrollContent}>
            <View style={styles.counterRow}>
              <View style={styles.counterCard}>
                <Text style={styles.counterTitle}>Today</Text>
                <Text style={styles.counterValue}>{todayCount}</Text>
              </View>
              <View style={styles.counterCard}>
                <Text style={styles.counterTitle}>Week</Text>
                <Text style={styles.counterValue}>{weekCount}</Text>
              </View>
              <View style={styles.counterCard}>
                <Text style={styles.counterTitle}>Month</Text>
                <Text style={styles.counterValue}>{monthCount}</Text>
              </View>
            </View>

            <View style={styles.reportSection}>
              <View style={styles.reportHeaderRow}>
                <Text style={styles.reportSectionTitle}>Week Chart</Text>
                <View style={styles.inlineButtons}>
                  <RetroButton label="<" onPress={onPrevWeek} compact />
                  <RetroButton label=">" onPress={onNextWeek} compact />
                </View>
              </View>
              <Text style={styles.reportSubhead}>{weekRangeLabel}</Text>
              {weekBars.map(item => <BarRow key={item.key} item={item} maxCount={maxWeekCount} />)}
            </View>

            <View style={styles.reportSection}>
              <View style={styles.reportHeaderRow}>
                <Text style={styles.reportSectionTitle}>Months Chart</Text>
                <View style={styles.inlineButtons}>
                  <RetroButton label="<" onPress={onPrevYear} compact />
                  <RetroButton label=">" onPress={onNextYear} compact />
                </View>
              </View>
              <Text style={styles.reportSubhead}>{yearLabel}</Text>
              {monthBars.map(item => <BarRow key={item.key} item={item} maxCount={maxMonthCount} />)}
            </View>
          </ScrollView>
          <View style={styles.modalFooterButtons}>
            <RetroButton label="Close" onPress={onClose} />
          </View>
        </RetroWindow>
      </View>
    </Modal>
  );
}

export function PomodoroScreen() {
  const controller = usePomodoroController();
  const music = useBackgroundMusic({
    enabled: !controller.state.settings.isMuted,
    ready: controller.ready,
  });
  const { width, height } = useWindowDimensions();
  const [showSettings, setShowSettings] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [mvpVisible, setMvpVisible] = useState(false);
  const [mvpKey, setMvpKey] = useState(0);
  const prevPhaseRef = useRef(controller.state.phase);

  useEffect(() => {
    if (controller.state.phase === 'finish' && prevPhaseRef.current !== 'finish') {
      setMvpKey(k => k + 1);
      setMvpVisible(true);
    }
    prevPhaseRef.current = controller.state.phase;
  }, [controller.state.phase]);

  const stageWidth = Math.min(width - 24, (height - 40) * STAGE_RATIO, 390);
  const stageHeight = stageWidth / STAGE_RATIO;

  const actionLabel = controller.state.phase === 'ready'
    ? 'Start Focus'
    : controller.state.phase === 'focus'
        ? 'Start Rest'
        : 'Finish';
  const onPrimaryAction = controller.state.phase === 'ready'
    ? controller.startFocus
    : controller.state.phase === 'focus'
        ? controller.startRest
        : controller.finishRest;
  const showActionWindow = controller.state.phase === 'ready'
    || ((controller.state.phase === 'focus' || controller.state.phase === 'rest') && controller.timer.isOverTime);
  const showPauseButton = !controller.timer.isOverTime && (controller.state.phase === 'focus' || controller.state.phase === 'rest');
  const phaseLine = controller.state.phase === 'rest' ? 'Rest Time' : 'Focus Time';
  const stageSummary = `${controller.timer.countDownText}/${controller.timer.durationText}`;
  const weekRangeLabel = `${controller.weekAnchor.format('YYYY/MM/DD')} - ${controller.weekAnchor.add(6, 'day').format('MM/DD')}`;
  const yearLabel = `${controller.yearAnchor.format('YYYY')} Total: ${controller.monthBars.reduce((sum, item) => sum + item.count, 0)}`;

  const handlePrimaryAction = () => {
    music.markUserInteraction();
    onPrimaryAction();
  };

  const openSettings = () => {
    music.markUserInteraction();
    setShowSettings(true);
  };

  const openReport = () => {
    music.markUserInteraction();
    setShowReport(true);
  };

  if (!controller.ready) {
    return (
      <LinearGradient colors={['#060814', '#122644', '#20315d']} style={styles.loadingRoot}>
        <Text style={styles.loadingText}>Loading RO Pomodoro...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#06101d', '#132544', '#1f3463']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.screenRoot}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.stageFrame, { width: stageWidth, height: stageHeight }]}>
          <View style={styles.stageBackground}>
            <ScrollingBackground
              scrolling={controller.state.phase === 'focus' && !controller.timer.isOverTime}
              stageWidth={stageWidth}
              stageHeight={stageHeight}
            />
            <LinearGradient colors={['rgba(5, 11, 24, 0.08)', 'rgba(6, 17, 33, 0.58)']} style={StyleSheet.absoluteFillObject} />
            <LinearGradient
              colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
              style={styles.topGlow}
            />
            <View style={styles.poringWrap}>
              <PoringCharacter phase={controller.state.phase} isOverTime={controller.timer.isOverTime} />
              <View style={styles.captionBubble}>
                <Text style={styles.captionText}>{phaseCaption[controller.state.phase]}</Text>
              </View>
            </View>

            <RetroWindow
              title={controller.state.settings.userName}
              style={styles.statusWindow}
            >
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>
                  {controller.state.phase === 'finish' ? 'Complete!' : `${phaseLine}.`}
                </Text>
                <View style={styles.statusActionRow}>
                  <Text style={styles.timerText}>
                    {controller.state.phase === 'finish' ? '—' : stageSummary}
                  </Text>
                  {showPauseButton ? (
                    <Pressable
                      style={styles.pauseButton}
                      onPress={controller.state.phase === 'focus' ? controller.stopFocus : controller.stopRest}
                    >
                      <View style={styles.pauseGlyph} />
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </RetroWindow>

            {/* MVP floating badge — matches web layout: below status window, left-aligned */}
            <View style={styles.mvpBadge}>
              <ExpoImage source={mvpIcon} contentFit="contain" style={styles.mvpBadgeIcon} />
              <Text style={styles.mvpBadgeCount}>x {controller.state.records.length}</Text>
            </View>

            {showActionWindow ? (
              <RetroWindow title="Actions" style={styles.actionWindow}>
                <View style={styles.actionBody}>
                  <RetroButton label={actionLabel} onPress={handlePrimaryAction} wide />
                </View>
              </RetroWindow>
            ) : null}

            {controller.state.phase === 'finish' ? (
              <View style={styles.finishBanner}>
                <Text style={styles.finishBannerText}>Cycle complete</Text>
              </View>
            ) : null}

            {mvpVisible && (
              <View style={styles.mvpOverlay}>
                <SpriteAnimation
                  key={mvpKey}
                  source={mvpSpriteImg}
                  frameWidth={121}
                  frameHeight={268}
                  frameCount={9}
                  frameRate={20}
                  columns={5}
                  scale={2}
                  totalPlays={1}
                  onComplete={() => setTimeout(() => setMvpVisible(false), 2500)}
                />
              </View>
            )}

            <View style={styles.bottomActions}>
              <RetroIconButton name="bar-chart-outline" onPress={openReport} />
              <RetroIconButton name="settings-outline" onPress={openSettings} />
            </View>
          </View>
        </View>
      </SafeAreaView>

      <SettingsModal
        visible={showSettings}
        settings={controller.state.settings}
        onClose={() => setShowSettings(false)}
        onSave={controller.updateSettings}
      />
      <ReportModal
        visible={showReport}
        onClose={() => setShowReport(false)}
        todayCount={controller.summary.todayCount}
        weekCount={controller.summary.weekCount}
        monthCount={controller.summary.monthCount}
        weekRangeLabel={weekRangeLabel}
        yearLabel={yearLabel}
        weekBars={controller.weekBars}
        monthBars={controller.monthBars}
        onPrevWeek={controller.moveWeekBackward}
        onNextWeek={controller.moveWeekForward}
        onPrevYear={controller.moveYearBackward}
        onNextYear={controller.moveYearForward}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  loadingRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#f4f7ff',
  },
  stageFrame: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#a8b7d8',
    backgroundColor: '#5e77a3',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
  },
  stageBackground: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#8aa4c8',
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
  poringWrap: {
    position: 'absolute',
    bottom: 72,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captionBubble: {
    marginTop: -8,
    width: '78%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 2,
    borderColor: '#8ea2cb',
    shadowColor: '#27395e',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  captionText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    lineHeight: 14,
    color: '#294066',
    textAlign: 'center',
  },
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
  statusWindow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderRadius: 0,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    minHeight: 42,
  },
  statusActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timerText: {
    fontFamily: 'PressStart2P',
    fontSize: 11,
    color: '#122341',
  },
  pauseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f5fb',
    borderWidth: 2,
    borderColor: '#8798bb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseGlyph: {
    width: 10,
    height: 12,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#25375a',
  },
  statusBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  mvpIcon: {
    width: 18,
    height: 18,
  },
  statusMetaText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#435a82',
  },
  bgmBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#b7c5e1',
    backgroundColor: '#edf4ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bgmBadgeMuted: {
    backgroundColor: '#f4e8e7',
    borderColor: '#ddb7b5',
  },
  bgmBadgeText: {
    fontFamily: 'PressStart2P',
    fontSize: 7,
    color: '#405882',
  },
  actionWindow: {
    position: 'absolute',
    top: '38%',
    left: '8%',
    right: '8%',
  },
  actionBody: {
    alignItems: 'stretch',
  },
  finishBanner: {
    position: 'absolute',
    top: '32%',
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(19, 34, 64, 0.86)',
    borderWidth: 2,
    borderColor: '#d9e4ff',
  },
  finishBannerText: {
    fontFamily: 'PressStart2P',
    fontSize: 9,
    color: '#eef4ff',
  },
  bottomActions: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    flexDirection: 'row',
    gap: 10,
  },
  mvpOverlay: {
    position: 'absolute',
    bottom: 72,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalBarrier: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 12, 20, 0.58)',
  },
  modalWindow: {
    width: '100%',
    maxWidth: 440,
  },
  reportWindow: {
    maxHeight: '80%',
  },
  modalFooterButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#253b63',
    marginBottom: 8,
  },
  formHint: {
    fontFamily: 'PressStart2P',
    fontSize: 7,
    lineHeight: 12,
    color: '#5c6d8f',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#b5c1da',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    backgroundColor: '#fff',
    color: '#21355b',
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
    fontSize: 15,
  },
  inlineButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  reportScroll: {
    maxHeight: 520,
  },
  reportScrollContent: {
    gap: 18,
  },
  counterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  counterCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#cad4ea',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  counterTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#546785',
    textAlign: 'center',
    marginBottom: 10,
  },
  counterValue: {
    fontFamily: 'PressStart2P',
    fontSize: 16,
    color: '#22375c',
    textAlign: 'center',
  },
  reportSection: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#cad4ea',
    backgroundColor: '#fff',
  },
  reportHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reportSectionTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#23375d',
  },
  reportSubhead: {
    fontFamily: 'PressStart2P',
    fontSize: 7,
    lineHeight: 12,
    color: '#6a7d9e',
    marginBottom: 12,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  reportAxisLabel: {
    width: 46,
    fontFamily: 'PressStart2P',
    fontSize: 7,
    color: '#3b537a',
  },
  barTrack: {
    flex: 1,
    height: 16,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#eef2fb',
    borderWidth: 1,
    borderColor: '#d5dff1',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  reportAxisCount: {
    width: 22,
    textAlign: 'right',
    fontFamily: 'PressStart2P',
    fontSize: 7,
    color: '#23375d',
  },
  // window ball — 3-D sphere effect with highlight overlay
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
  // status label — left side of status row ("Focus Time.")
  statusLabel: {
    fontFamily: 'PressStart2P',
    fontSize: 9,
    color: '#13203b',
    flexShrink: 1,
  },
  // MVP floating badge below status window, left side
  mvpBadge: {
    position: 'absolute',
    top: 80,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mvpBadgeIcon: {
    width: 52,
    height: 52,
  },
  mvpBadgeCount: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});