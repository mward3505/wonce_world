import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';
import { RootStackParamList } from '../navigation/AppNavigator';
import AvatarCircle from '../components/AvatarCircle';

type ProfileSetupNavProp = NativeStackNavigationProp<RootStackParamList, 'ProfileSetup'>;
type ProfileSetupRouteProp = RouteProp<RootStackParamList, 'ProfileSetup'>;

const AVATAR_COLORS = [
  '#FF6B6B', '#FF9F43', '#FECA57', '#48DBFB',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#1DD1A1',
  '#C8D6E5', '#EE5A24', '#009432', '#833471',
];

export default function ProfileSetupScreen() {
  const navigation = useNavigation<ProfileSetupNavProp>();
  const route = useRoute<ProfileSetupRouteProp>();
  const { profiles, addProfile, updateProfile } = useApp();
  const t = useTranslation();

  const editingId = route.params?.profileId;
  const editingProfile = editingId ? profiles.find((p) => p.id === editingId) : undefined;

  const [name, setName] = useState(editingProfile?.name ?? '');
  const [selectedColor, setSelectedColor] = useState(
    editingProfile?.avatarColor ?? AVATAR_COLORS[0]
  );

  useEffect(() => {
    if (editingProfile) {
      setName(editingProfile.name);
      setSelectedColor(editingProfile.avatarColor);
    }
  }, [editingProfile]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert(t.oops, t.nameRequired);
      return;
    }
    if (trimmed.length > 20) {
      Alert.alert(t.oops, t.nameTooLong);
      return;
    }

    if (editingProfile) {
      updateProfile({ ...editingProfile, name: trimmed, avatarColor: selectedColor });
      navigation.goBack();
    } else {
      addProfile(trimmed, selectedColor);
      navigation.navigate('Home');
    }
  };

  return (
    <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>{t.back}</Text>
            </TouchableOpacity>

            <Text style={styles.title}>
              {editingProfile ? t.editProfile : t.newKid}
            </Text>

            <View style={styles.previewContainer}>
              <AvatarCircle
                name={name.trim() || '?'}
                color={selectedColor}
                size={120}
              />
              <Text style={styles.previewName}>{name.trim() || t.yourName}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t.nameLabel}</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={t.enterName}
                placeholderTextColor="rgba(255,255,255,0.5)"
                maxLength={20}
                autoFocus={!editingProfile}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            </View>

            <View style={styles.colorSection}>
              <Text style={styles.label}>{t.pickColor}</Text>
              <View style={styles.colorGrid}>
                {AVATAR_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorSwatchSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                    activeOpacity={0.8}
                  >
                    {selectedColor === color && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.saveButtonText}>
                {editingProfile ? t.saveChanges : t.letsGo}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: 28,
    paddingBottom: 48,
    gap: 24,
  },
  backButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 22,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  previewContainer: {
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  previewName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  inputContainer: {
    gap: 10,
  },
  label: {
    fontSize: 22,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  colorSection: {
    gap: 14,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  colorSwatchSelected: {
    borderWidth: 4,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.15 }],
  },
  checkmark: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 24,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
