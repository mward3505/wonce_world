import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';
import { speakCard } from '../utils/speech';
import { RootStackParamList } from '../navigation/AppNavigator';
import LearningCard from '../components/LearningCard';
import ProgressDots from '../components/ProgressDots';
import CelebrationOverlay from '../components/CelebrationOverlay';
import { LETTERS } from '../data/letters';
import { NUMBERS } from '../data/numbers';
import { COLORS } from '../data/colors';
import { SHAPES } from '../data/shapes';
import { SHAPE_GRAPHICS } from '../components/ShapeGraphic';

type LearningNavProp = NativeStackNavigationProp<RootStackParamList, 'Learning'>;
type LearningRouteProp = RouteProp<RootStackParamList, 'Learning'>;

interface CardData {
  emoji: string;
  shapeNode?: React.ReactNode;
  primaryText: string;
  secondaryText?: string;
  tertiaryText?: string;
}

const GRADIENTS: Record<string, readonly [string, string]> = {
  letters: ['#FF9A9E', '#FAD0C4'],
  numbers: ['#A1C4FD', '#C2E9FB'],
  colors: ['#FDDB92', '#D1FDFF'],
  shapes: ['#96FBC4', '#F9F586'],
};

function buildCards(moduleType: string, t: ReturnType<typeof useTranslation>): CardData[] {
  switch (moduleType) {
    case 'letters':
      return LETTERS.map((item) => ({
        emoji: t.letterEmojis[item.letter] ?? item.emoji,
        primaryText: item.letter,
        secondaryText: t.letterWords[item.letter] ?? item.word,
      }));
    case 'numbers':
      return NUMBERS.map((item) => ({
        emoji: item.emoji,
        primaryText: t.numberWords[item.word] ?? item.word,
        secondaryText: `${t.countLabel}: ${item.number}`,
        tertiaryText: item.items,
      }));
    case 'colors':
      return COLORS.map((item) => ({
        emoji: item.emoji,
        primaryText: t.colorNames[item.name] ?? item.name,
        secondaryText: item.items,
      }));
    case 'shapes':
      return SHAPES.map((item) => ({
        emoji: item.emoji,
        shapeNode: SHAPE_GRAPHICS[item.name],
        primaryText: t.shapeNames[item.name] ?? item.name,
        secondaryText: t.shapeDescriptions?.[item.name] ?? item.description,
        tertiaryText: item.examples,
      }));
    default:
      return [];
  }
}

export default function LearningScreen() {
  const navigation = useNavigation<LearningNavProp>();
  const route = useRoute<LearningRouteProp>();
  const { updateProgress, language } = useApp();
  const t = useTranslation();

  const { moduleType, profileId } = route.params;
  const cards = buildCards(moduleType, t);
  const total = cards.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [tapped, setTapped] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completed, setCompleted] = useState(false);

  const cardOpacity = useRef(new Animated.Value(1)).current;
  const nextButtonOpacity = useRef(new Animated.Value(0)).current;
  const nextButtonScale = useRef(new Animated.Value(0.7)).current;

  const showNextButton = useCallback(() => {
    Animated.parallel([
      Animated.timing(nextButtonOpacity, {
        toValue: 1,
        duration: 300,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(nextButtonScale, {
        toValue: 1,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [nextButtonOpacity, nextButtonScale]);

  const hideNextButton = useCallback(() => {
    nextButtonOpacity.setValue(0);
    nextButtonScale.setValue(0.7);
  }, [nextButtonOpacity, nextButtonScale]);

  const handleTap = useCallback(() => {
    const card = cards[currentIndex];
    if (card) speakCard(moduleType, card.primaryText, card.secondaryText, language);
    if (!tapped) {
      setTapped(true);
      showNextButton();
    }
  }, [tapped, currentIndex, cards, moduleType, language, showNextButton]);

  const handleNext = useCallback(() => {
    if (!tapped) return;

    if (currentIndex >= total - 1) {
      updateProgress(profileId, moduleType, total);
      setCompleted(true);
      setShowCelebration(true);
      return;
    }

    Animated.timing(cardOpacity, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex((prev) => prev + 1);
      setTapped(false);
      hideNextButton();
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  }, [tapped, currentIndex, total, cardOpacity, updateProgress, profileId, moduleType, hideNextButton]);

  const handlePrev = useCallback(() => {
    if (currentIndex === 0) return;
    Animated.timing(cardOpacity, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex((prev) => prev - 1);
      setTapped(false);
      hideNextButton();
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  }, [currentIndex, cardOpacity, hideNextButton]);

  const handleCelebrationDismiss = useCallback(() => {
    setShowCelebration(false);
    navigation.navigate('ModuleSelect', { profileId });
  }, [navigation, profileId]);

  useEffect(() => {
    cardOpacity.setValue(1);
    nextButtonOpacity.setValue(0);
    nextButtonScale.setValue(0.7);
  }, [cardOpacity, nextButtonOpacity, nextButtonScale]);


  const card = cards[currentIndex];
  const gradientColors = GRADIENTS[moduleType];

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ModuleSelect', { profileId })}
            style={styles.backButton}
          >
            <Text style={styles.backText}>{t.back}</Text>
          </TouchableOpacity>
          <Text style={styles.moduleTitle}>{t.moduleTitlesEmoji[moduleType]}</Text>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {currentIndex + 1}/{total}
            </Text>
          </View>
        </View>

        <ProgressDots
          total={total}
          current={currentIndex + (tapped ? 1 : 0)}
          activeColor="#1A1A2E"
          inactiveColor="rgba(26,26,46,0.25)"
        />

        <View style={styles.cardArea}>
          <Animated.View style={{ opacity: cardOpacity, flex: 1, justifyContent: 'center' }}>
            {card && (
              <LearningCard
                emoji={card.emoji}
                shapeNode={card.shapeNode}
                primaryText={card.primaryText}
                secondaryText={card.secondaryText}
                tertiaryText={card.tertiaryText}
                tapped={tapped}
                onTap={handleTap}
              />
            )}
          </Animated.View>
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navArrow, currentIndex === 0 && styles.navArrowDisabled]}
            onPress={handlePrev}
            disabled={currentIndex === 0}
            activeOpacity={0.8}
          >
            <Text style={styles.navArrowText}>◀</Text>
          </TouchableOpacity>

          <Animated.View
            style={{
              opacity: nextButtonOpacity,
              transform: [{ scale: nextButtonScale }],
            }}
          >
            <TouchableOpacity
              style={[
                styles.nextButton,
                currentIndex >= total - 1 && styles.finishButton,
              ]}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text style={styles.nextButtonText}>
                {currentIndex >= total - 1 ? t.finish : t.next}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={[
              styles.navArrow,
              (currentIndex >= total - 1 || !tapped) && styles.navArrowDisabled,
            ]}
            onPress={handleNext}
            disabled={currentIndex >= total - 1 || !tapped}
            activeOpacity={0.8}
          >
            <Text style={styles.navArrowText}>▶</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <CelebrationOverlay
        visible={showCelebration}
        onDismiss={handleCelebrationDismiss}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
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
    color: 'rgba(26,26,46,0.75)',
  },
  moduleTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A2E',
  },
  counterBadge: {
    backgroundColor: 'rgba(26,26,46,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  counterText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  cardArea: {
    flex: 1,
    justifyContent: 'center',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  navArrow: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(26,26,46,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowDisabled: {
    opacity: 0.3,
  },
  navArrowText: {
    fontSize: 22,
    color: '#1A1A2E',
    fontWeight: '700',
  },
  nextButton: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  finishButton: {
    backgroundColor: '#2ECC71',
  },
  nextButtonText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
