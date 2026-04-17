import React, { useState, useRef, useCallback, useMemo } from 'react';
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
import { RootStackParamList } from '../navigation/AppNavigator';
import CelebrationOverlay from '../components/CelebrationOverlay';
import { useTranslation } from '../i18n/useTranslation';
import { Translations } from '../i18n/translations';
import { LETTERS } from '../data/letters';
import { NUMBERS } from '../data/numbers';
import { COLORS } from '../data/colors';
import { SHAPES } from '../data/shapes';

type QuizNavProp = NativeStackNavigationProp<RootStackParamList, 'Quiz'>;
type QuizRouteProp = RouteProp<RootStackParamList, 'Quiz'>;

interface QuizQuestion {
  mainEmoji: string;
  hintText?: string;
  promptText: string;
  correctAnswer: string;
  options: string[];
}

const QUIZ_LENGTH = 10;

const GRADIENTS: Record<string, readonly [string, string]> = {
  letters: ['#FF9A9E', '#FAD0C4'],
  numbers: ['#A1C4FD', '#C2E9FB'],
  colors: ['#FDDB92', '#D1FDFF'],
  shapes: ['#96FBC4', '#F9F586'],
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestions(moduleType: string, t: Translations): QuizQuestion[] {
  switch (moduleType) {
    case 'letters': {
      const pool = shuffle(LETTERS).slice(0, QUIZ_LENGTH);
      return pool.map((item) => {
        const wrongs = shuffle(LETTERS.filter((l) => l.letter !== item.letter))
          .slice(0, 3)
          .map((l) => l.letter);
        return {
          mainEmoji: t.letterEmojis[item.letter] ?? item.emoji,
          hintText: t.letterWords[item.letter] ?? item.word,
          promptText: t.quizPrompts.letters,
          correctAnswer: item.letter,
          options: shuffle([item.letter, ...wrongs]),
        };
      });
    }
    case 'numbers': {
      const pool = shuffle(NUMBERS).slice(0, QUIZ_LENGTH);
      return pool.map((item) => {
        const translated = t.numberWords[item.word] ?? item.word;
        const wrongs = shuffle(NUMBERS.filter((n) => n.number !== item.number))
          .slice(0, 3)
          .map((n) => t.numberWords[n.word] ?? n.word);
        return {
          mainEmoji: item.items,
          promptText: t.quizPrompts.numbers,
          correctAnswer: translated,
          options: shuffle([translated, ...wrongs]),
        };
      });
    }
    case 'colors': {
      const pool = shuffle(COLORS).slice(0, QUIZ_LENGTH);
      return pool.map((item) => {
        const translated = t.colorNames[item.name] ?? item.name;
        const wrongs = shuffle(COLORS.filter((c) => c.name !== item.name))
          .slice(0, 3)
          .map((c) => t.colorNames[c.name] ?? c.name);
        return {
          mainEmoji: item.emoji,
          hintText: item.items,
          promptText: t.quizPrompts.colors,
          correctAnswer: translated,
          options: shuffle([translated, ...wrongs]),
        };
      });
    }
    case 'shapes': {
      const pool = shuffle(SHAPES).slice(0, QUIZ_LENGTH);
      return pool.map((item) => {
        const translated = t.shapeNames[item.name] ?? item.name;
        const wrongs = shuffle(SHAPES.filter((s) => s.name !== item.name))
          .slice(0, 3)
          .map((s) => t.shapeNames[s.name] ?? s.name);
        return {
          mainEmoji: item.emoji,
          hintText: item.description,
          promptText: t.quizPrompts.shapes,
          correctAnswer: translated,
          options: shuffle([translated, ...wrongs]),
        };
      });
    }
    default:
      return [];
  }
}

export default function QuizScreen() {
  const navigation = useNavigation<QuizNavProp>();
  const route = useRoute<QuizRouteProp>();
  const t = useTranslation();
  const { language } = useApp();
  const { moduleType, profileId } = route.params;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const questions = useMemo(() => buildQuestions(moduleType, t), [moduleType, language]);
  const total = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const emojiScale = useRef(new Animated.Value(1)).current;
  const cardShake = useRef(new Animated.Value(0)).current;

  const handleAnswer = useCallback(
    (answer: string) => {
      if (selectedAnswer !== null) return;

      const isCorrect = answer === questions[currentIndex].correctAnswer;
      setSelectedAnswer(answer);

      if (isCorrect) {
        setScore((prev) => prev + 1);
        Animated.sequence([
          Animated.spring(emojiScale, {
            toValue: 1.35,
            friction: 3,
            tension: 300,
            useNativeDriver: true,
          }),
          Animated.spring(emojiScale, {
            toValue: 1,
            friction: 4,
            tension: 200,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.sequence([
          Animated.timing(cardShake, { toValue: 10, duration: 60, useNativeDriver: true }),
          Animated.timing(cardShake, { toValue: -10, duration: 60, useNativeDriver: true }),
          Animated.timing(cardShake, { toValue: 8, duration: 60, useNativeDriver: true }),
          Animated.timing(cardShake, { toValue: -8, duration: 60, useNativeDriver: true }),
          Animated.timing(cardShake, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
      }

      setTimeout(() => {
        if (currentIndex >= total - 1) {
          setShowCelebration(true);
        } else {
          setCurrentIndex((prev) => prev + 1);
          setSelectedAnswer(null);
          emojiScale.setValue(1);
          cardShake.setValue(0);
        }
      }, 1200);
    },
    [selectedAnswer, currentIndex, questions, total, emojiScale, cardShake]
  );

  const handleCelebrationDismiss = useCallback(() => {
    setShowCelebration(false);
    navigation.navigate('ModuleSelect', { profileId });
  }, [navigation, profileId]);

  if (questions.length === 0) {
    navigation.navigate('ModuleSelect', { profileId });
    return null;
  }

  const question = questions[currentIndex];
  const gradientColors = GRADIENTS[moduleType];
  const answeredCount = currentIndex + (selectedAnswer !== null ? 1 : 0);

  const getOptionStyle = (option: string) => {
    if (selectedAnswer === null) return styles.optionButton;
    if (option === question.correctAnswer) return [styles.optionButton, styles.optionCorrect];
    if (option === selectedAnswer) return [styles.optionButton, styles.optionWrong];
    return [styles.optionButton, styles.optionDimmed];
  };

  const getOptionTextStyle = (option: string) => {
    if (selectedAnswer === null) return styles.optionText;
    if (option === question.correctAnswer || option === selectedAnswer)
      return [styles.optionText, styles.optionTextLight];
    return styles.optionText;
  };

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
          <Text style={styles.scoreText}>⭐ {score}/{answeredCount}</Text>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {currentIndex + 1}/{total}
            </Text>
          </View>
        </View>

        <Text style={styles.prompt}>{question.promptText}</Text>

        <Animated.View
          style={[styles.emojiCard, { transform: [{ translateX: cardShake }] }]}
        >
          <Animated.Text style={[styles.emoji, { transform: [{ scale: emojiScale }] }]}>
            {question.mainEmoji}
          </Animated.Text>
          {question.hintText ? (
            <Text style={styles.hintText}>{question.hintText}</Text>
          ) : null}
        </Animated.View>

        <View style={styles.optionsGrid}>
          {question.options.map((option) => (
            <TouchableOpacity
              key={option}
              style={getOptionStyle(option)}
              onPress={() => handleAnswer(option)}
              activeOpacity={0.8}
              disabled={selectedAnswer !== null}
            >
              <Text style={getOptionTextStyle(option)}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      <CelebrationOverlay visible={showCelebration} onDismiss={handleCelebrationDismiss} />
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
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { paddingVertical: 8, paddingHorizontal: 4 },
  backText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(26,26,46,0.75)',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '800',
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
  prompt: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A2E',
    textAlign: 'center',
  },
  emojiCard: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 28,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emoji: {
    fontSize: 68,
    lineHeight: 82,
    textAlign: 'center',
  },
  hintText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'rgba(26,26,46,0.6)',
    textAlign: 'center',
  },
  optionsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    alignContent: 'center',
  },
  optionButton: {
    width: '46%',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 20,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  optionCorrect: {
    backgroundColor: '#2ECC71',
  },
  optionWrong: {
    backgroundColor: '#E74C3C',
  },
  optionDimmed: {
    opacity: 0.35,
  },
  optionText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A2E',
    textAlign: 'center',
  },
  optionTextLight: {
    color: '#FFFFFF',
  },
});
