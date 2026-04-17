/**
 * ColorHopScreen — an endless side-scrolling jump game.
 *
 * Colored platforms scroll from right to left at a fixed height.
 * The player taps anywhere to make the frog jump.  If the frog is
 * in the air when a platform is directly beneath the jump arc, it
 * "collects" that platform.  Collect the target color for points;
 * land on a wrong color to lose a heart.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTranslation } from '../i18n/useTranslation';

const { width: SW } = Dimensions.get('window');

// ── Layout & timing constants ─────────────────────────────────────────────────
const GROUND_H      = 80;          // height of the grass strip
const CHAR_LEFT     = 64;          // character fixed left offset
const CHAR_FS       = 52;          // emoji font-size ≈ rendered height
const JUMP_DIST     = 160;         // pixels upward on a jump
const JUMP_UP_MS    = 360;
const JUMP_DOWN_MS  = 320;
const PLAT_W        = 108;
const PLAT_H        = 56;
const PLAT_SPEED_MS = 3600;        // total time for a platform to cross the screen
const SPAWN_MS      = 2800;        // interval between new platforms
const SCORE_WIN     = 8;
const HEARTS_START  = 3;

// Vertical position of platforms — centred at the character's jump peak.
// char bottom (at rest) = GROUND_H; char centre ≈ GROUND_H + CHAR_FS/2
// at peak, char centre rises by JUMP_DIST → GROUND_H + CHAR_FS/2 + JUMP_DIST
// platform bottom = peak_centre − PLAT_H/2
const PLAT_BOTTOM = GROUND_H + CHAR_FS / 2 + JUMP_DIST - PLAT_H / 2; // ≈ 234

// Horizontal collision zone: overlap between platform translateX and character X range
// char: [CHAR_LEFT, CHAR_LEFT + CHAR_FS] = [64, 116]
// platform: [tx, tx + PLAT_W]; overlaps when tx < 116 AND tx + PLAT_W > 64
//   → tx ∈ (64 − PLAT_W, 116) = (−44, 116)
const ZONE_ENTRY_TX = CHAR_LEFT + CHAR_FS;    // 116 — plat left enters char right
const ZONE_EXIT_TX  = CHAR_LEFT - PLAT_W;     // −44 — plat right passes char left
const TOTAL_TRAVEL  = SW + PLAT_W + 20;        // total distance the platform travels
const ZONE_ENTRY_MS = Math.round(((SW - ZONE_ENTRY_TX) / TOTAL_TRAVEL) * PLAT_SPEED_MS);
const ZONE_EXIT_MS  = Math.round(((SW - ZONE_EXIT_TX)  / TOTAL_TRAVEL) * PLAT_SPEED_MS);

// ── Color data ────────────────────────────────────────────────────────────────
const COLORS = [
  { name: 'Red',    bg: '#FF3B30', text: '#fff',      emoji: '🔴' },
  { name: 'Blue',   bg: '#007AFF', text: '#fff',      emoji: '🔵' },
  { name: 'Yellow', bg: '#F4C431', text: '#1A1A2E',   emoji: '🟡' },
  { name: 'Green',  bg: '#34C759', text: '#fff',      emoji: '🟢' },
  { name: 'Orange', bg: '#FF9500', text: '#fff',      emoji: '🟠' },
  { name: 'Purple', bg: '#AF52DE', text: '#fff',      emoji: '🟣' },
] as const;

type GameColor = typeof COLORS[number];
type Phase     = 'playing' | 'over' | 'won';

interface Platform {
  id:    number;
  color: GameColor;
  animX: Animated.Value;
}

type NavProp   = NativeStackNavigationProp<RootStackParamList, 'ColorHop'>;
type RouteType = RouteProp<RootStackParamList, 'ColorHop'>;

function randColor(): GameColor {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ColorHopScreen() {
  const navigation = useNavigation<NavProp>();
  const route      = useRoute<RouteType>();
  const t          = useTranslation();
  const { profileId } = route.params;

  // ── Visible state (triggers re-renders) ──────────────────────────────────
  const [score,     setScore]     = useState(0);
  const [hearts,    setHearts]    = useState(HEARTS_START);
  const [target,    setTarget]    = useState<GameColor>(randColor);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [phase,     setPhase]     = useState<Phase>('playing');
  const [feedback,  setFeedback]  = useState<'ok' | 'no' | null>(null);

  // ── Refs (no re-render) ───────────────────────────────────────────────────
  const platCounter = useRef(0);
  const platsRef    = useRef<Platform[]>([]);
  const isJumping   = useRef(false);
  const phaseRef    = useRef<Phase>('playing');
  const scoreRef    = useRef(0);
  const heartsRef   = useRef(HEARTS_START);
  const targetRef   = useRef<GameColor>(target);
  const inZoneRef   = useRef<Platform | null>(null);
  const spawnTimer  = useRef<ReturnType<typeof setInterval> | null>(null);
  const zoneTimers  = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Animated values ───────────────────────────────────────────────────────
  const charY     = useRef(new Animated.Value(0)).current;
  const charScale = useRef(new Animated.Value(1)).current;
  const cloud1X   = useRef(new Animated.Value(SW * 0.65)).current;
  const cloud2X   = useRef(new Animated.Value(SW * 0.2)).current;

  // Keep targetRef in sync
  useEffect(() => { targetRef.current = target; }, [target]);

  // ── Drifting cloud decoration ─────────────────────────────────────────────
  useEffect(() => {
    const drift = (anim: Animated.Value, startX: number, ms: number) => {
      anim.setValue(startX);
      Animated.loop(
        Animated.timing(anim, { toValue: -110, duration: ms, useNativeDriver: true }),
      ).start();
    };
    drift(cloud1X, SW * 0.65, 14000);
    drift(cloud2X, SW * 0.25, 20000);
  }, [cloud1X, cloud2X]);

  // ── End game ──────────────────────────────────────────────────────────────
  const endGame = useCallback((result: 'over' | 'won') => {
    phaseRef.current = result;
    setPhase(result);
    if (spawnTimer.current) {
      clearInterval(spawnTimer.current);
      spawnTimer.current = null;
    }
    zoneTimers.current.forEach(clearTimeout);
    zoneTimers.current = [];
  }, []);

  // ── Jump ──────────────────────────────────────────────────────────────────
  const jump = useCallback(() => {
    if (isJumping.current || phaseRef.current !== 'playing') return;
    isJumping.current = true;

    // Check if a platform is in the collision zone right now
    if (inZoneRef.current) {
      const hit     = inZoneRef.current;
      inZoneRef.current = null;
      const correct = hit.color.name === targetRef.current.name;

      if (correct) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
        setFeedback('ok');
        setTimeout(() => setFeedback(null), 700);

        if (scoreRef.current >= SCORE_WIN) {
          setTimeout(() => endGame('won'), 900);
        } else {
          // Pick a new target that's different from the current one
          const pool = COLORS.filter(c => c.name !== targetRef.current.name);
          const nt   = pool[Math.floor(Math.random() * pool.length)];
          targetRef.current = nt;
          setTarget(nt);
        }
      } else {
        heartsRef.current -= 1;
        setHearts(heartsRef.current);
        setFeedback('no');
        setTimeout(() => setFeedback(null), 700);
        if (heartsRef.current <= 0) {
          setTimeout(() => endGame('over'), 900);
        }
      }
    }

    // Jump arc animation
    Animated.sequence([
      Animated.timing(charY, {
        toValue: -JUMP_DIST,
        duration: JUMP_UP_MS,
        useNativeDriver: true,
      }),
      Animated.timing(charY, {
        toValue: 0,
        duration: JUMP_DOWN_MS,
        useNativeDriver: true,
      }),
    ]).start(() => { isJumping.current = false; });

    // Squash & stretch
    Animated.sequence([
      Animated.timing(charScale, { toValue: 1.3, duration: JUMP_UP_MS / 2,                       useNativeDriver: true }),
      Animated.timing(charScale, { toValue: 1,   duration: JUMP_UP_MS / 2 + JUMP_DOWN_MS,        useNativeDriver: true }),
    ]).start();
  }, [charY, charScale, endGame]);

  // ── Spawn a platform ──────────────────────────────────────────────────────
  const spawnPlatform = useCallback(() => {
    if (phaseRef.current !== 'playing') return;

    const id    = ++platCounter.current;
    const color = randColor();
    const animX = new Animated.Value(SW);
    const plat: Platform = { id, color, animX };

    platsRef.current = [...platsRef.current, plat];
    setPlatforms([...platsRef.current]);

    // Scroll across screen
    Animated.timing(animX, {
      toValue: -(PLAT_W + 20),
      duration: PLAT_SPEED_MS,
      useNativeDriver: true,
    }).start(() => {
      platsRef.current = platsRef.current.filter(p => p.id !== id);
      setPlatforms([...platsRef.current]);
    });

    // Open and close the collision window
    const t1 = setTimeout(() => {
      if (phaseRef.current !== 'playing') return;
      inZoneRef.current = plat;
    }, ZONE_ENTRY_MS);

    const t2 = setTimeout(() => {
      if (inZoneRef.current?.id === id) inZoneRef.current = null;
    }, ZONE_EXIT_MS);

    zoneTimers.current.push(t1, t2);
  }, []);

  // ── Spawn loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;

    const first = setTimeout(spawnPlatform, 1000);
    spawnTimer.current = setInterval(spawnPlatform, SPAWN_MS);

    return () => {
      clearTimeout(first);
      if (spawnTimer.current) clearInterval(spawnTimer.current);
      zoneTimers.current.forEach(clearTimeout);
      zoneTimers.current = [];
    };
  }, [phase, spawnPlatform]);

  // ── Restart ───────────────────────────────────────────────────────────────
  const restart = useCallback(() => {
    platsRef.current  = [];
    setPlatforms([]);
    platCounter.current = 0;
    isJumping.current   = false;
    inZoneRef.current   = null;
    charY.setValue(0);
    charScale.setValue(1);

    const nt = randColor();
    scoreRef.current  = 0;
    heartsRef.current = HEARTS_START;
    targetRef.current = nt;
    phaseRef.current  = 'playing';

    setScore(0);
    setHearts(HEARTS_START);
    setTarget(nt);
    setFeedback(null);
    setPhase('playing'); // triggers spawn loop via useEffect
  }, [charY, charScale]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <LinearGradient colors={['#42A5F5', '#90CAF9', '#E3F2FD']} style={S.gradient}>
      <SafeAreaView style={S.safeArea}>

        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <View style={S.topBar}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ModuleSelect', { profileId })}
            style={S.backBtn}
          >
            <Text style={S.backText}>{t.back}</Text>
          </TouchableOpacity>

          <View style={S.heartsRow}>
            {Array.from({ length: HEARTS_START }).map((_, i) => (
              <Text key={i} style={S.heart}>{i < hearts ? '❤️' : '🖤'}</Text>
            ))}
          </View>

          <View style={S.scoreBadge}>
            <Text style={S.scoreText}>⭐ {score}/{SCORE_WIN}</Text>
          </View>
        </View>

        {/* ── Target color prompt ──────────────────────────────────────────── */}
        <View style={[S.targetBubble, { backgroundColor: target.bg }]}>
          <Text style={[S.targetText, { color: target.text }]}>
            {target.emoji}  {t.jumpOn(t.colorNames[target.name] ?? target.name)}
          </Text>
        </View>

        {/* ── Game area — tap anywhere to jump ─────────────────────────────── */}
        <TouchableWithoutFeedback onPress={jump}>
          <View style={S.gameArea}>

            {/* Drifting clouds */}
            <Animated.Text style={[S.cloud, { top: 18, transform: [{ translateX: cloud1X }] }]}>
              ☁️
            </Animated.Text>
            <Animated.Text style={[S.cloud, { top: 58, transform: [{ translateX: cloud2X }] }]}>
              ⛅
            </Animated.Text>

            {/* Scrolling platforms */}
            {platforms.map(p => (
              <Animated.View
                key={p.id}
                style={[S.platform, { backgroundColor: p.color.bg, transform: [{ translateX: p.animX }] }]}
              >
                <Text style={[S.platLabel, { color: p.color.text }]}>
                  {t.colorNames[p.color.name] ?? p.color.name}
                </Text>
              </Animated.View>
            ))}

            {/* Feedback flash */}
            {feedback ? (
              <View style={[S.feedPill, feedback === 'ok' ? S.feedOk : S.feedNo]}>
                <Text style={S.feedText}>{feedback === 'ok' ? t.feedbackYes : t.feedbackNo}</Text>
              </View>
            ) : null}

            {/* Frog character */}
            <Animated.Text
              style={[S.char, { transform: [{ translateY: charY }, { scale: charScale }] }]}
            >
              🐸
            </Animated.Text>

            {/* Ground */}
            <LinearGradient colors={['#66BB6A', '#388E3C']} style={S.ground} />

            <Text style={S.tapHint}>{t.tapToJump}</Text>
          </View>
        </TouchableWithoutFeedback>

        {/* ── Game over / win overlay ──────────────────────────────────────── */}
        {phase !== 'playing' ? (
          <View style={S.overlayBg}>
            <View style={S.overlayCard}>
              <Text style={S.overlayEmoji}>{phase === 'won' ? '🎉' : '😢'}</Text>
              <Text style={S.overlayTitle}>{phase === 'won' ? t.youWin : t.gameOver}</Text>
              <Text style={S.overlaySub}>
                {phase === 'won' ? t.winMessage(SCORE_WIN) : t.loseMessage(score)}
              </Text>
              <TouchableOpacity style={S.playAgainBtn} onPress={restart} activeOpacity={0.85}>
                <Text style={S.playAgainText}>{t.playAgain}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('ModuleSelect', { profileId })}
                activeOpacity={0.7}
              >
                <Text style={S.backHomeText}>{t.backToMenu}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

      </SafeAreaView>
    </LinearGradient>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  backBtn:  { paddingHorizontal: 4, paddingVertical: 6 },
  backText: { fontSize: 18, fontWeight: '700', color: '#0D47A1' },
  heartsRow: { flexDirection: 'row', gap: 3 },
  heart:    { fontSize: 22 },
  scoreBadge: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  scoreText: { fontSize: 15, fontWeight: '800', color: '#0D47A1' },

  targetBubble: {
    marginHorizontal: 18,
    marginBottom: 6,
    borderRadius: 20,
    paddingVertical: 11,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
  },
  targetText: { fontSize: 22, fontWeight: '900', letterSpacing: 0.2 },

  gameArea: { flex: 1, overflow: 'hidden' },

  cloud: {
    position: 'absolute',
    fontSize: 40,
  },

  platform: {
    position: 'absolute',
    bottom: PLAT_BOTTOM,
    left: 0,
    width: PLAT_W,
    height: PLAT_H,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  platLabel: { fontSize: 14, fontWeight: '900' },

  feedPill: {
    position: 'absolute',
    top: '30%',
    left: SW / 2 - 58,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  feedOk:   { backgroundColor: '#2ECC71' },
  feedNo:   { backgroundColor: '#E74C3C' },
  feedText: { fontSize: 18, fontWeight: '900', color: '#fff' },

  char: {
    position: 'absolute',
    bottom: GROUND_H,
    left: CHAR_LEFT,
    fontSize: CHAR_FS,
    lineHeight: CHAR_FS + 8,
  },

  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: GROUND_H,
    borderTopWidth: 5,
    borderTopColor: '#2E7D32',
  },

  tapHint: {
    position: 'absolute',
    bottom: GROUND_H + 6,
    right: 14,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(13,71,161,0.45)',
  },

  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.52)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 32,
    alignItems: 'center',
    gap: 12,
    width: SW * 0.82,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 18,
  },
  overlayEmoji: { fontSize: 64 },
  overlayTitle: { fontSize: 32, fontWeight: '900', color: '#1A1A2E' },
  overlaySub:   { fontSize: 18, fontWeight: '600', color: '#555', textAlign: 'center' },
  playAgainBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 24,
    marginTop: 4,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  playAgainText: { fontSize: 20, fontWeight: '900', color: '#fff' },
  backHomeText:  { fontSize: 16, fontWeight: '600', color: '#007AFF', marginTop: 4 },
});
