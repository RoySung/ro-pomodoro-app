import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { type PomodoroSettings } from './domain';
import { RetroButton } from '@/components/retro-button';
import { RetroWindow } from './retro-window';

const sanitizeMinutes = (value: string, fallback: number) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1)
    return fallback;
  return parsed;
};

function RadioOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.radioOption} onPress={onPress}>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </Pressable>
  );
}

interface SettingsModalProps {
  visible: boolean
  settings: PomodoroSettings
  onClose: () => void
  onSave: (settings: PomodoroSettings) => void
}

export function SettingsModal({ visible, settings, onClose, onSave }: SettingsModalProps) {
  const [userName, setUserName] = useState(settings.userName);
  const [focusMinutes, setFocusMinutes] = useState(String(settings.focusDurationMinutes));
  const [restMinutes, setRestMinutes] = useState(String(settings.restDurationMinutes));
  const [notificationMinutes, setNotificationMinutes] = useState(String(settings.notificationIntervalMinutes));
  const [isMuted, setIsMuted] = useState(settings.isMuted);

  useEffect(() => {
    if (!visible)
      return;

    setUserName(settings.userName);
    setFocusMinutes(String(settings.focusDurationMinutes));
    setRestMinutes(String(settings.restDurationMinutes));
    setNotificationMinutes(String(settings.notificationIntervalMinutes));
    setIsMuted(settings.isMuted);
  }, [visible, settings]);

  const save = () => {
    onSave({
      userName: userName.trim() || settings.userName,
      focusDurationMinutes: sanitizeMinutes(focusMinutes, settings.focusDurationMinutes),
      restDurationMinutes: sanitizeMinutes(restMinutes, settings.restDurationMinutes),
      notificationIntervalMinutes: sanitizeMinutes(notificationMinutes, settings.notificationIntervalMinutes),
      isMuted,
    });
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalRoot}>
        <Pressable style={styles.modalBarrier} onPress={onClose} />
        <RetroWindow
          title="Settings"
          style={styles.modalWindow}
          footer={(
            <View style={styles.modalFooterButtons}>
              <RetroButton label="Save" onPress={save} />
              <RetroButton label="Cancel" onPress={onClose} />
            </View>
          )}
        >
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Your Name</Text>
            <TextInput value={userName} onChangeText={setUserName} style={styles.textInput} placeholder="Guest" placeholderTextColor="#8a8a8a" />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Focus Time (Minute)</Text>
            <TextInput value={focusMinutes} onChangeText={setFocusMinutes} style={styles.textInput} keyboardType="number-pad" />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Rest Time (Minute)</Text>
            <TextInput value={restMinutes} onChangeText={setRestMinutes} style={styles.textInput} keyboardType="number-pad" />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Notification Interval (Minute)</Text>
            <TextInput value={notificationMinutes} onChangeText={setNotificationMinutes} style={styles.textInput} keyboardType="number-pad" />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Sound</Text>
            <View style={styles.radioGroup}>
              <RadioOption label="On" selected={!isMuted} onPress={() => setIsMuted(false)} />
              <RadioOption label="Off" selected={isMuted} onPress={() => setIsMuted(true)} />
            </View>
          </View>
        </RetroWindow>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  radioGroup: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 4,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioOuter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#8a9cc0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#253b63',
  },
  radioInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#253b63',
  },
  radioLabel: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#253b63',
  },
});
