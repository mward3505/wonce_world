import React, { useRef, useEffect } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  View,
} from 'react-native';
import { useTranslation } from '../i18n/useTranslation';

const { width } = Dimensions.get('window');
const CARD_SIZE = Math.min(width - 80, 300);

interface LearningCardProps {
  emoji: string;
  shapeNode?: React.ReactNode;
  primaryText: string;
  secondaryText?: string;
  tertiaryText?: string;
  tapped: boolean;
  onTap: () => void;
}

export default function LearningCard({
  emoji,
  shapeNode,
  primaryText,
  secondaryText,
  tertiaryText,
  tapped,
  onTap,
}: LearningCardProps) {
  const t = useTranslation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (tapped) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.12,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(hintOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 350,
          delay: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      contentOpacity.setValue(0);
      hintOpacity.setValue(1);
      scaleAnim.setValue(1);
    }
  }, [tapped, scaleAnim, contentOpacity, hintOpacity]);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onTap} style={styles.touchable}>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        {shapeNode ? (
          <View style={styles.shapeContainer}>{shapeNode}</View>
        ) : (
          <Text style={styles.emoji}>{emoji}</Text>
        )}

        <Animated.View style={[styles.hintContainer, { opacity: hintOpacity }]}>
          <Text style={styles.hintText}>{t.tapMe}</Text>
        </Animated.View>

        <Animated.View style={[styles.contentContainer, { opacity: contentOpacity }]}>
          <Text style={styles.primaryText}>{primaryText}</Text>
          {secondaryText ? (
            <Text style={styles.secondaryText}>{secondaryText}</Text>
          ) : null}
          {tertiaryText ? (
            <Text style={styles.tertiaryText}>{tertiaryText}</Text>
          ) : null}
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    alignSelf: 'center',
  },
  card: {
    width: CARD_SIZE,
    minHeight: CARD_SIZE * 0.75,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
    gap: 12,
  },
  emoji: {
    fontSize: 80,
    textAlign: 'center',
    lineHeight: 96,
  },
  shapeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  hintContainer: {
    position: 'absolute',
    bottom: 28,
  },
  hintText: {
    fontSize: 22,
    color: '#888',
    fontWeight: '600',
  },
  contentContainer: {
    alignItems: 'center',
    gap: 8,
  },
  primaryText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1A1A2E',
    textAlign: 'center',
    letterSpacing: 1,
  },
  secondaryText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#444',
    textAlign: 'center',
  },
  tertiaryText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
});
