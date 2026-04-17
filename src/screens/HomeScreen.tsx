import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Ellipse, Line, G, Rect } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';
import { RootStackParamList } from '../navigation/AppNavigator';
import AvatarCircle from '../components/AvatarCircle';

const { width: W, height: H } = Dimensions.get('window');

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Landscape SVG occupies the bottom 46% of the screen
const SH = H * 0.46;

// Smooth bezier hill paths within the landscape SVG
const BACK_HILL  = `M 0 ${SH} C ${W * 0.25} ${SH * 0.05} ${W * 0.75} ${SH * 0.05} ${W} ${SH} Z`;
const MID_HILL   = `M -10 ${SH} C ${W * 0.1} ${SH * 0.28} ${W * 0.45} ${SH * 0.18} ${W * 0.68} ${SH * 0.4} C ${W * 0.85} ${SH * 0.56} ${W * 0.96} ${SH * 0.38} ${W + 10} ${SH} Z`;
const FRONT_HILL = `M -10 ${SH} C ${W * 0.12} ${SH * 0.5} ${W * 0.32} ${SH * 0.42} ${W * 0.54} ${SH * 0.5} C ${W * 0.73} ${SH * 0.58} ${W * 0.87} ${SH * 0.44} ${W + 10} ${SH * 0.48} L ${W + 10} ${SH} Z`;

// Tree trunk + canopy at a given x, ground y
function Tree({ x, groundY, scale = 1 }: { x: number; groundY: number; scale?: number }) {
  const th = 28 * scale;
  const tw = 7 * scale;
  const cr = 22 * scale;
  return (
    <G>
      <Rect x={x - tw / 2} y={groundY - th} width={tw} height={th} rx={3} fill="#795548" />
      <Circle cx={x} cy={groundY - th - cr * 0.6} r={cr} fill="#2E7D32" />
      <Circle cx={x - cr * 0.5} cy={groundY - th - cr * 0.3} r={cr * 0.7} fill="#388E3C" />
      <Circle cx={x + cr * 0.5} cy={groundY - th - cr * 0.2} r={cr * 0.65} fill="#388E3C" />
    </G>
  );
}

// Flower at a given position
function Flower({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <G>
      <Circle cx={x} cy={y} r={6} fill={color} opacity={0.95} />
      <Circle cx={x} cy={y} r={2.5} fill="#FFF9C4" />
    </G>
  );
}

// Cloud made of overlapping circles inside an Animated.View
function Cloud({ y, width: cw, duration, delay }: {
  y: number; width: number; duration: number; delay: number;
}) {
  const ch = cw * 0.52;
  const x = useRef(new Animated.Value(-cw - 10)).current;

  useEffect(() => {
    const loop = () => {
      x.setValue(-cw - 10);
      Animated.timing(x, { toValue: W + 10, duration, useNativeDriver: true }).start(
        ({ finished }) => { if (finished) loop(); }
      );
    };
    const t = setTimeout(loop, delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View style={{ position: 'absolute', top: y, transform: [{ translateX: x }] }}>
      <Svg width={cw} height={ch}>
        <Ellipse cx={cw * 0.5} cy={ch * 0.75} rx={cw * 0.46} ry={ch * 0.3} fill="rgba(255,255,255,0.92)" />
        <Circle cx={cw * 0.26} cy={ch * 0.52} r={ch * 0.33} fill="rgba(255,255,255,0.92)" />
        <Circle cx={cw * 0.52} cy={ch * 0.36} r={ch * 0.4} fill="rgba(255,255,255,0.92)" />
        <Circle cx={cw * 0.77} cy={ch * 0.5} r={ch * 0.28} fill="rgba(255,255,255,0.92)" />
      </Svg>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { profiles, setActiveProfile, loaded, language, setLanguage } = useApp();
  const insets = useSafeAreaInsets();
  const t = useTranslation();

  const titleScale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const listOpacity = useRef(new Animated.Value(0)).current;
  const mascotY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(titleScale, { toValue: 1, friction: 4, tension: 150, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(listOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(mascotY, { toValue: -14, duration: 1000, useNativeDriver: true }),
        Animated.timing(mascotY, { toValue: 0, duration: 850, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSelectProfile = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      setActiveProfile(profile);
      navigation.navigate('ModuleSelect', { profileId });
    }
  };

  if (!loaded) {
    return (
      <LinearGradient colors={['#4FC3F7', '#81D4FA']} style={styles.fill}>
        <Text style={styles.loadingText}>🌟</Text>
      </LinearGradient>
    );
  }

  // Ground surface y within the landscape SVG (where trees/flowers sit on front hill)
  const groundY = SH * 0.62;

  return (
    <View style={styles.fill}>
      {/* Sky gradient */}
      <LinearGradient
        colors={['#1E90FF', '#56C8F5', '#AEE8FF']}
        style={StyleSheet.absoluteFill}
      />

      {/* Sun with rays */}
      <View style={styles.sunWrap}>
        <Svg width={110} height={110}>
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return (
              <Line
                key={i}
                x1={55 + Math.cos(a) * 40} y1={55 + Math.sin(a) * 40}
                x2={55 + Math.cos(a) * 52} y2={55 + Math.sin(a) * 52}
                stroke="#FFE066" strokeWidth={5} strokeLinecap="round"
              />
            );
          })}
          <Circle cx={55} cy={55} r={32} fill="#FFD740" />
          <Circle cx={55} cy={55} r={26} fill="#FFE566" />
          {/* Cute face on sun */}
          <Circle cx={47} cy={51} r={3} fill="#F9A825" />
          <Circle cx={63} cy={51} r={3} fill="#F9A825" />
          <Path d="M 48 61 Q 55 67 62 61" stroke="#F9A825" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        </Svg>
      </View>

      {/* Drifting clouds */}
      <Cloud y={H * 0.06} width={150} duration={24000} delay={0} />
      <Cloud y={H * 0.13} width={110} duration={32000} delay={8000} />
      <Cloud y={H * 0.03} width={85}  duration={28000} delay={4000} />

      {/* Illustrated landscape */}
      <View style={[styles.landscapeWrap, { height: SH }]}>
        <Svg width={W} height={SH}>
          {/* Hills: back → mid → front */}
          <Path d={BACK_HILL}  fill="#A5D6A7" />
          <Path d={MID_HILL}   fill="#66BB6A" />
          <Path d={FRONT_HILL} fill="#43A047" />

          {/* Ground strip */}
          <Rect x={0} y={SH * 0.82} width={W} height={SH * 0.18} fill="#388E3C" />

          {/* Trees on mid-ground */}
          <Tree x={W * 0.08}  groundY={groundY} scale={0.9} />
          <Tree x={W * 0.18}  groundY={groundY * 0.92} scale={1.1} />
          <Tree x={W * 0.82}  groundY={groundY * 0.94} scale={1.0} />
          <Tree x={W * 0.91}  groundY={groundY} scale={0.85} />

          {/* Flowers scattered on front hill */}
          <Flower x={W * 0.30} y={SH * 0.56} color="#FF80AB" />
          <Flower x={W * 0.38} y={SH * 0.52} color="#FFFFFF" />
          <Flower x={W * 0.46} y={SH * 0.54} color="#FFD740" />
          <Flower x={W * 0.54} y={SH * 0.57} color="#FF80AB" />
          <Flower x={W * 0.62} y={SH * 0.53} color="#FFFFFF" />
          <Flower x={W * 0.70} y={SH * 0.55} color="#FFD740" />
          <Flower x={W * 0.22} y={SH * 0.60} color="#CE93D8" />
          <Flower x={W * 0.78} y={SH * 0.52} color="#CE93D8" />

          {/* Little birds in the sky */}
          <Path d={`M ${W*0.3} ${SH*0.1} Q ${W*0.32} ${SH*0.07} ${W*0.34} ${SH*0.1}`} stroke="rgba(255,255,255,0.7)" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <Path d={`M ${W*0.35} ${SH*0.08} Q ${W*0.37} ${SH*0.05} ${W*0.39} ${SH*0.08}`} stroke="rgba(255,255,255,0.7)" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <Path d={`M ${W*0.58} ${SH*0.14} Q ${W*0.60} ${SH*0.11} ${W*0.62} ${SH*0.14}`} stroke="rgba(255,255,255,0.7)" strokeWidth={2} fill="none" strokeLinecap="round" />
        </Svg>
      </View>

      {/* UI content layered on top */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.langButton}
            onPress={() => setLanguage(language === 'en' ? 'es' : 'en')}
            activeOpacity={0.8}
          >
            <Text style={styles.langText}>{language === 'en' ? '🇪🇸 ES' : '🇺🇸 EN'}</Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[styles.titleContainer, { transform: [{ scale: titleScale }], opacity: titleOpacity }]}
        >
          <Animated.Text style={[styles.mascot, { transform: [{ translateY: mascotY }] }]}>
            🦉
          </Animated.Text>
          <Text style={styles.titleText}>Wonce World</Text>
          <View style={styles.subtitleBubble}>
            <Text style={styles.subtitleText}>{t.whoLearning}</Text>
          </View>
        </Animated.View>

        {profiles.length === 0 ? (
          <Animated.View style={[styles.emptyState, { opacity: listOpacity }]}>
            <Text style={styles.emptyAnimals}>🐱 🐶 🐰</Text>
            <View style={styles.emptyBubble}>
              <Text style={styles.emptyBubbleText}>{t.tapToStart}</Text>
            </View>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => navigation.navigate('ProfileSetup', {})}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyAddIcon}>＋</Text>
              <Text style={styles.emptyAddText}>{t.addKid}</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View style={[styles.profilesSection, { opacity: listOpacity }]}>
            <ScrollView
              contentContainerStyle={styles.profilesGrid}
              showsVerticalScrollIndicator={false}
            >
              {profiles.map((profile) => (
                <TouchableOpacity
                  key={profile.id}
                  onPress={() => handleSelectProfile(profile.id)}
                  activeOpacity={0.88}
                >
                  <View style={styles.profileCard}>
                    <View style={[styles.profileCardTop, { backgroundColor: profile.avatarColor }]}>
                      <AvatarCircle name={profile.name} color={profile.avatarColor} size={62} />
                    </View>
                    <View style={styles.profileCardBottom}>
                      <Text style={styles.profileName} numberOfLines={1}>{profile.name}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => navigation.navigate('ProfileSetup', {})}
                activeOpacity={0.88}
              >
                <View style={[styles.profileCard, styles.addCard]}>
                  <View style={styles.addCardTop}>
                    <Text style={styles.addIcon}>+</Text>
                  </View>
                  <View style={styles.addCardBottom}>
                    <Text style={styles.addText}>{t.addKid}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        )}

        <View style={[styles.bottomBar, { bottom: insets.bottom + 12 }]}>
          <TouchableOpacity
            style={styles.parentButton}
            onPress={() => navigation.navigate('ParentDashboard')}
            activeOpacity={0.8}
          >
            <Text style={styles.parentButtonIcon}>🔒</Text>
            <Text style={styles.parentButtonLabel}>{t.parentsLabel}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  loadingText: { fontSize: 80, alignSelf: 'center', marginTop: 'auto', marginBottom: 'auto' },
  landscapeWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sunWrap: {
    position: 'absolute',
    top: H * 0.04,
    right: W * 0.04,
  },
  safeArea: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  langButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  langText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0D47A1',
  },
  parentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  parentButtonIcon: { fontSize: 18 },
  parentButtonLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0D47A1',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  mascot: {
    fontSize: 76,
    lineHeight: 90,
  },
  titleText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,50,140,0.35)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    letterSpacing: 1,
    marginTop: -2,
  },
  subtitleBubble: {
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderRadius: 22,
    paddingVertical: 6,
    paddingHorizontal: 20,
    marginTop: 6,
  },
  subtitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0D47A1',
  },
  profilesSection: {
    flex: 1,
  },
  profilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    paddingBottom: H * 0.5,
    paddingTop: 4,
  },
  profileCard: {
    width: 118,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0D47A1',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 7,
  },
  profileCardTop: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCardBottom: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A2E',
    textAlign: 'center',
  },
  addCard: {
    borderWidth: 2.5,
    borderColor: 'rgba(13,71,161,0.25)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  addCardTop: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13,71,161,0.15)',
  },
  addCardBottom: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 46,
    color: '#FFFFFF',
    fontWeight: '300',
    lineHeight: 56,
  },
  addText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0D47A1',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 28,
    gap: 20,
  },
  emptyAnimals: {
    fontSize: 52,
    letterSpacing: 8,
  },
  emptyBubble: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
    maxWidth: W * 0.75,
  },
  emptyBubbleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0D47A1',
    textAlign: 'center',
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 30,
    shadowColor: '#0D47A1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  emptyAddIcon: {
    fontSize: 28,
    fontWeight: '300',
    color: '#0D47A1',
    lineHeight: 34,
  },
  emptyAddText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0D47A1',
  },
});
