import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, R } from './theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function UclLogo({ size = 58 }: { size?: number }) {
  return <Image source={require('../assets/UCL-Logo.png')} style={{ width: size, height: size * 1.07 }} resizeMode="contain" />;
}

export function ScreenEnter({ children, screenKey }: { children: React.ReactNode; screenKey: string }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateX.setValue(14);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 240, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [screenKey]);

  return <Animated.View style={{ flex: 1, opacity, transform: [{ translateX }] }}>{children}</Animated.View>;
}

export function Stagger({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.spring(y, { toValue: 0, useNativeDriver: true, damping: 16, stiffness: 150, mass: 0.7 }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);
  return <Animated.View style={[style, { opacity, transform: [{ translateY: y }] }]}>{children}</Animated.View>;
}

export function MotionPressable({ children, onPress, style, disabled = false }:{
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const down = () => Animated.spring(scale, { toValue: 0.965, useNativeDriver: true, damping: 18, stiffness: 400 }).start();
  const up = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 16, stiffness: 380 }).start();
  return (
    <AnimatedPressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={down}
      onPressOut={up}
      style={[style as any, { transform: [{ scale }], opacity: disabled ? 0.5 : 1 }]}
    >
      {children}
    </AnimatedPressable>
  );
}

export function Header({ title, onBack, right, dark = false }:{ title: string; onBack?: () => void; right?: React.ReactNode; dark?: boolean }) {
  return (
    <View style={[s.header, dark && s.headerDark]}>
      <View style={s.headerSide}>
        {onBack ? (
          <MotionPressable onPress={onBack} style={s.headerIconBtn}>
            <Ionicons name="chevron-back" size={24} color={dark ? C.white : C.navy} />
          </MotionPressable>
        ) : (
          <UclLogo size={33} />
        )}
      </View>
      <Text numberOfLines={1} style={[s.headerTitle, dark && { color: C.white }]}>{title}</Text>
      <View style={[s.headerSide, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}

export function SearchBox({ placeholder = 'Search anything...', value, onChangeText }:{ placeholder?: string; value?: string; onChangeText?: (v:string)=>void }) {
  return (
    <View style={s.search}>
      <Ionicons name="search-outline" size={19} color={C.muted} />
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={C.subtle} style={s.searchInput} />
    </View>
  );
}

export function PrimaryButton({ title, onPress, outline = false, icon }:{ title: string; onPress: () => void; outline?: boolean; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <MotionPressable onPress={onPress} style={[s.button, outline && s.buttonOutline]}>
      {icon ? <Ionicons name={icon} size={18} color={outline ? C.red : C.white} /> : null}
      <Text style={[s.buttonText, outline && { color: C.red }]}>{title}</Text>
    </MotionPressable>
  );
}

export function Segmented({ items, active, onChange }:{ items: string[]; active: string; onChange: (v:string)=>void }) {
  return (
    <View style={s.segmented}>
      {items.map(item => {
        const on = item === active;
        return (
          <MotionPressable key={item} onPress={() => onChange(item)} style={[s.segment, on && s.segmentActive]}>
            <Text style={[s.segmentText, on && s.segmentTextActive]}>{item}</Text>
          </MotionPressable>
        );
      })}
    </View>
  );
}

export function QuickTile({ icon, title, onPress, delay = 0 }:{ icon: keyof typeof Ionicons.glyphMap; title: string; onPress: () => void; delay?: number }) {
  return (
    <Stagger delay={delay} style={{ width: '31.2%' }}>
      <MotionPressable onPress={onPress} style={s.quickTile}>
        <View style={s.quickIcon}><Ionicons name={icon} size={22} color={C.red} /></View>
        <Text style={s.quickText}>{title}</Text>
      </MotionPressable>
    </Stagger>
  );
}

export function ListCard({ icon, title, subtitle, meta, onPress, right, red = false }:{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  meta?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  red?: boolean;
}) {
  return (
    <MotionPressable onPress={onPress} style={s.listCard}>
      <View style={[s.listIcon, red && { backgroundColor: C.redSoft }]}><Ionicons name={icon} size={22} color={red ? C.red : C.navy} /></View>
      <View style={{ flex: 1 }}>
        <Text style={s.listTitle}>{title}</Text>
        {subtitle ? <Text style={s.listSub}>{subtitle}</Text> : null}
        {meta ? <Text style={s.listMeta}>{meta}</Text> : null}
      </View>
      {right ?? <Ionicons name="chevron-forward" size={18} color={C.subtle} />}
    </MotionPressable>
  );
}

export function SectionTitle({ title, action, onAction }:{ title:string; action?:string; onAction?:()=>void }) {
  return (
    <View style={s.sectionRow}>
      <Text style={s.sectionTitle}>{title}</Text>
      {action ? <Pressable onPress={onAction}><Text style={s.action}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function Badge({ children, tone='red' }:{ children: React.ReactNode; tone?: 'red'|'green'|'navy'|'gray' }) {
  const bg = tone === 'green' ? C.greenSoft : tone === 'navy' ? C.blueSoft : tone === 'gray' ? '#EEF1F5' : C.redSoft;
  const fg = tone === 'green' ? C.green : tone === 'navy' ? C.navy : tone === 'gray' ? C.muted : C.red;
  return <View style={[s.badge, { backgroundColor: bg }]}><Text style={[s.badgeText, { color: fg }]}>{children}</Text></View>;
}

export function BottomNav({ active, go }:{ active:string; go:(s:any)=>void }) {
  const items = [
    ['home','home-outline','Home'],
    ['events','compass-outline','Explore'],
    ['services','grid-outline','Services'],
    ['profile','person-outline','Profile'],
  ] as const;
  return (
    <View style={s.bottomNav}>
      {items.map(([key, icon, label]) => {
        const on = active === key || (key === 'events' && active === 'calendar');
        return (
          <MotionPressable key={key} onPress={() => go(key)} style={s.bottomItem}>
            <Ionicons name={on ? (icon.replace('-outline','') as any) : icon} size={21} color={on ? C.red : C.muted} />
            <Text style={[s.bottomText, on && { color: C.red, fontWeight: '800' }]}>{label}</Text>
            {on ? <View style={s.bottomDot} /> : null}
          </MotionPressable>
        );
      })}
    </View>
  );
}

export function AssistantFab({ onPress }:{ onPress:()=>void }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.05, duration: 900, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Pressable onPress={onPress} style={s.fabHit}>
      <Animated.View style={[s.fab, { transform: [{ scale: pulse }] }]}>
        <Ionicons name="sparkles" size={20} color={C.white} />
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  header: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  headerDark: { backgroundColor: C.navy, borderBottomColor: C.navy },
  headerSide: { width: 52, justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', color: C.navy, fontSize: 17, fontWeight: '900' },
  headerIconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  search: { height: 46, backgroundColor: C.white, borderRadius: R.sm, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, color: C.text },
  button: { minHeight: 50, borderRadius: R.sm, backgroundColor: C.red, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18, shadowColor: C.red, shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  buttonOutline: { backgroundColor: C.white, borderWidth: 1.5, borderColor: C.red, shadowOpacity: 0 },
  buttonText: { color: C.white, fontSize: 15, fontWeight: '900' },
  segmented: { width: '100%', flexDirection: 'row', backgroundColor: '#F0F3F7', borderRadius: 14, padding: 4, gap: 4 },
  segment: { flex: 1, minWidth: 0, minHeight: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  segmentActive: { backgroundColor: C.white, shadowColor: C.shadow, shadowOpacity: 0.07, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  segmentText: { color: C.muted, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  segmentTextActive: { color: C.red, fontWeight: '900' },
  quickTile: { minHeight: 88, borderRadius: 15, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', padding: 9, gap: 7, shadowColor: C.shadow, shadowOpacity: 0.035, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  quickIcon: { width: 37, height: 37, borderRadius: 11, backgroundColor: C.redSoft, alignItems: 'center', justifyContent: 'center' },
  quickText: { color: C.navy, fontSize: 10.5, fontWeight: '800', textAlign: 'center' },
  listCard: { minHeight: 74, backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 12, marginBottom: 10, flexDirection: 'row', gap: 11, alignItems: 'center' },
  listIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center' },
  listTitle: { color: C.text, fontSize: 14, fontWeight: '900' },
  listSub: { color: C.muted, fontSize: 11.5, lineHeight: 16, marginTop: 3 },
  listMeta: { color: C.subtle, fontSize: 10.5, marginTop: 5 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 10 },
  sectionTitle: { color: C.navy, fontSize: 17, fontWeight: '900' },
  action: { color: C.red, fontSize: 11.5, fontWeight: '900' },
  badge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10.5, fontWeight: '900' },
  bottomNav: { width: '100%', minHeight: 72, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border, flexDirection: 'row', alignItems: 'stretch', paddingHorizontal: 10, paddingTop: 6, paddingBottom: 6 },
  bottomItem: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 3 },
  bottomText: { color: C.muted, fontSize: 10, lineHeight: 13, fontWeight: '700', textAlign: 'center' },
  bottomDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.red, marginTop: 1 },
  fabHit: { position: 'absolute', right: 18, bottom: 82, zIndex: 10 },
  fab: { width: 50, height: 50, borderRadius: 25, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center', shadowColor: C.red, shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
});
