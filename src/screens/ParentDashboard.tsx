import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useApp, ModuleType } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';
import { RootStackParamList } from '../navigation/AppNavigator';
import PinScreen from './PinScreen';
import AvatarCircle from '../components/AvatarCircle';
import { LETTERS } from '../data/letters';
import { NUMBERS } from '../data/numbers';
import { COLORS } from '../data/colors';
import { SHAPES } from '../data/shapes';

type ParentDashNavProp = NativeStackNavigationProp<RootStackParamList, 'ParentDashboard'>;

const MODULE_TOTALS: Record<ModuleType, number> = {
  letters: LETTERS.length,
  numbers: NUMBERS.length,
  colors: COLORS.length,
  shapes: SHAPES.length,
};

const MODULE_LABELS: Record<ModuleType, string> = {
  letters: '🔤',
  numbers: '🔢',
  colors: '🎨',
  shapes: '🔷',
};

const MODULES: ModuleType[] = ['letters', 'numbers', 'colors', 'shapes'];

export default function ParentDashboard() {
  const navigation = useNavigation<ParentDashNavProp>();
  const { profiles, getProgress, deleteProfile, updatePin } = useApp();
  const t = useTranslation();
  const [unlocked, setUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  if (!unlocked) {
    return (
      <PinScreen
        onSuccess={() => setUnlocked(true)}
        onCancel={() => navigation.goBack()}
      />
    );
  }

  const openPinModal = () => {
    setNewPin('');
    setConfirmPin('');
    setPinError('');
    setShowPinModal(true);
  };

  const handleSavePin = () => {
    if (!/^\d{4}$/.test(newPin)) {
      setPinError(t.pinMustBe4);
      return;
    }
    if (newPin !== confirmPin) {
      setPinError(t.pinsNoMatch);
      setConfirmPin('');
      return;
    }
    updatePin(newPin);
    setShowPinModal(false);
    Alert.alert(t.pinUpdatedTitle, t.pinUpdatedMsg);
  };

  const handleDelete = (profileId: string, name: string) => {
    Alert.alert(
      t.deleteProfileTitle,
      t.deleteProfileMsg(name),
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: () => deleteProfile(profileId),
        },
      ]
    );
  };

  return (
    <LinearGradient colors={['#2D3748', '#4A5568']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.parentDashboard}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Text style={styles.backText}>{t.kidsLabel}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {profiles.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>👶</Text>
              <Text style={styles.emptyText}>{t.noProfiles}</Text>
              <TouchableOpacity
                style={styles.addProfileButton}
                onPress={() => navigation.navigate('ProfileSetup', {})}
                activeOpacity={0.85}
              >
                <Text style={styles.addProfileButtonText}>{t.addFirstKid}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {profiles.map((profile) => {
                const progress = getProgress(profile.id);
                return (
                  <View key={profile.id} style={styles.profileCard}>
                    <View style={styles.profileCardHeader}>
                      <View style={styles.profileInfo}>
                        <AvatarCircle
                          name={profile.name}
                          color={profile.avatarColor}
                          size={64}
                        />
                        <Text style={styles.profileName}>{profile.name}</Text>
                      </View>
                      <View style={styles.profileActions}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() =>
                            navigation.navigate('ProfileSetup', { profileId: profile.id })
                          }
                          activeOpacity={0.8}
                        >
                          <Text style={styles.editButtonText}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDelete(profile.id, profile.name)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.deleteButtonText}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.progressGrid}>
                      {MODULES.map((mod) => {
                        const count = progress[mod];
                        const total = MODULE_TOTALS[mod];
                        const pct = total > 0 ? count / total : 0;
                        return (
                          <View key={mod} style={styles.progressItem}>
                            <Text style={styles.progressEmoji}>{MODULE_LABELS[mod]}</Text>
                            <View style={styles.progressBarBg}>
                              <View
                                style={[
                                  styles.progressBarFill,
                                  { width: `${pct * 100}%` },
                                  pct >= 1 && styles.progressBarComplete,
                                ]}
                              />
                            </View>
                            <Text style={styles.progressCount}>
                              {count}/{total}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}

              <TouchableOpacity
                style={styles.addProfileButton}
                onPress={() => navigation.navigate('ProfileSetup', {})}
                activeOpacity={0.85}
              >
                <Text style={styles.addProfileButtonText}>{t.addAnotherKid}</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.changePinButton}
            onPress={openPinModal}
            activeOpacity={0.8}
          >
            <Text style={styles.changePinText}>{t.changePinLabel}</Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal visible={showPinModal} transparent animationType="fade" onRequestClose={() => setShowPinModal(false)}>
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{t.changePinTitle}</Text>
              <Text style={styles.modalLabel}>{t.newPinLabel}</Text>
              <TextInput
                style={styles.pinInput}
                value={newPin}
                onChangeText={(t) => { setNewPin(t.replace(/\D/g, '').slice(0, 4)); setPinError(''); }}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                placeholder="····"
                placeholderTextColor="rgba(255,255,255,0.35)"
              />
              <Text style={styles.modalLabel}>{t.confirmPinLabel}</Text>
              <TextInput
                style={styles.pinInput}
                value={confirmPin}
                onChangeText={(t) => { setConfirmPin(t.replace(/\D/g, '').slice(0, 4)); setPinError(''); }}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                placeholder="····"
                placeholderTextColor="rgba(255,255,255,0.35)"
              />
              {pinError ? <Text style={styles.pinError}>{pinError}</Text> : null}
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowPinModal(false)} activeOpacity={0.8}>
                  <Text style={styles.modalCancelText}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSavePin} activeOpacity={0.8}>
                  <Text style={styles.modalSaveText}>{t.save}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  backText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    gap: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 16,
  },
  emptyEmoji: { fontSize: 72 },
  emptyText: {
    fontSize: 26,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    gap: 16,
  },
  profileCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profileActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: { fontSize: 22 },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(252,129,129,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: { fontSize: 22 },
  progressGrid: {
    gap: 10,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressEmoji: {
    fontSize: 22,
    width: 30,
    textAlign: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 7,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#63B3ED',
    borderRadius: 7,
  },
  progressBarComplete: {
    backgroundColor: '#68D391',
  },
  progressCount: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    width: 42,
    textAlign: 'right',
  },
  addProfileButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addProfileButtonText: {
    fontSize: 22,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
  },
  changePinButton: {
    marginTop: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  changePinText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#2D3748',
    borderRadius: 28,
    padding: 28,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    marginBottom: -6,
  },
  pinInput: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
  },
  pinError: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FC8181',
    textAlign: 'center',
    backgroundColor: 'rgba(252,129,129,0.1)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modalCancelText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: '#63B3ED',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
