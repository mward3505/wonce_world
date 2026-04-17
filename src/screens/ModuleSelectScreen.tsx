import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';
import { RootStackParamList } from '../navigation/AppNavigator';
import ModuleCard from '../components/ModuleCard';
import AvatarCircle from '../components/AvatarCircle';
import { LETTERS } from '../data/letters';
import { NUMBERS } from '../data/numbers';
import { COLORS } from '../data/colors';
import { SHAPES } from '../data/shapes';

type ModuleSelectNavProp = NativeStackNavigationProp<RootStackParamList, 'ModuleSelect'>;
type ModuleSelectRouteProp = RouteProp<RootStackParamList, 'ModuleSelect'>;

const MODULE_CONFIG = [
  {
    type: 'letters' as const,
    title: 'Letters',
    emoji: '🔤',
    gradientColors: ['#FF9A9E', '#FAD0C4'] as [string, string],
    total: LETTERS.length,
  },
  {
    type: 'numbers' as const,
    title: 'Numbers',
    emoji: '🔢',
    gradientColors: ['#A1C4FD', '#C2E9FB'] as [string, string],
    total: NUMBERS.length,
  },
  {
    type: 'colors' as const,
    title: 'Colors',
    emoji: '🎨',
    gradientColors: ['#FDDB92', '#D1FDFF'] as [string, string],
    total: COLORS.length,
  },
  {
    type: 'shapes' as const,
    title: 'Shapes',
    emoji: '🔷',
    gradientColors: ['#96FBC4', '#F9F586'] as [string, string],
    total: SHAPES.length,
  },
];

export default function ModuleSelectScreen() {
  const navigation = useNavigation<ModuleSelectNavProp>();
  const route = useRoute<ModuleSelectRouteProp>();
  const { profiles, getProgress, setActiveProfile } = useApp();

  const t = useTranslation();
  const { profileId } = route.params;
  const profile = profiles.find((p) => p.id === profileId);
  const progress = getProgress(profileId);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleBack = () => {
    setActiveProfile(null);
    navigation.navigate('Home');
  };

  if (!profile) {
    navigation.navigate('Home');
    return null;
  }

  return (
    <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.container,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backText}>{t.back}</Text>
            </TouchableOpacity>
            <View style={styles.profileRow}>
              <AvatarCircle name={profile.name} color={profile.avatarColor} size={52} />
              <Text style={styles.profileName}>{profile.name}</Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>{t.whatToLearn}</Text>

            <View style={styles.grid}>
              {MODULE_CONFIG.map((mod) => (
                <ModuleCard
                  key={mod.type}
                  title={t.moduleTitles[mod.type]}
                  emoji={mod.emoji}
                  gradientColors={mod.gradientColors}
                  completedCount={progress[mod.type]}
                  totalCount={mod.total}
                  onPress={() =>
                    navigation.navigate('Learning', {
                      moduleType: mod.type,
                      profileId,
                    })
                  }
                />
              ))}
            </View>

            <View style={styles.quizSection}>
              <Text style={styles.quizSectionTitle}>{t.gameTime}</Text>

              {/* Color Hop — featured game */}
              <TouchableOpacity
                style={styles.hopCard}
                onPress={() => navigation.navigate('ColorHop', { profileId })}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#42A5F5', '#1565C0']}
                  style={styles.hopCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.hopCardEmoji}>🐸</Text>
                  <View style={styles.hopCardInfo}>
                    <Text style={styles.hopCardTitle}>{t.colorHopTitle}</Text>
                    <Text style={styles.hopCardSub}>{t.colorHopSub}</Text>
                  </View>
                  <Text style={styles.hopCardArrow}>▶</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Per-module quizzes */}
              <Text style={styles.quizSubTitle}>{t.quickQuizzes}</Text>
              <View style={styles.quizGrid}>
                {MODULE_CONFIG.map((mod) => (
                  <TouchableOpacity
                    key={mod.type}
                    style={styles.quizButton}
                    onPress={() =>
                      navigation.navigate('Quiz', { moduleType: mod.type, profileId })
                    }
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={mod.gradientColors}
                      style={styles.quizButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.quizButtonEmoji}>{mod.emoji}</Text>
                      <Text style={styles.quizButtonText}>{t.moduleTitles[mod.type]} {t.quiz}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 0,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 38,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    paddingBottom: 8,
  },
  quizSection: {
    gap: 10,
  },
  hopCard: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  hopCardGradient: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  hopCardEmoji: { fontSize: 36 },
  hopCardInfo:  { flex: 1 },
  hopCardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },
  hopCardSub: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  hopCardArrow: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
  },
  quizSubTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  quizSectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  quizGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  quizButton: {
    width: '46%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
  quizButtonGradient: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quizButtonEmoji: {
    fontSize: 22,
  },
  quizButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A2E',
    flexShrink: 1,
  },
});
