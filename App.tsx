import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { C } from './src/theme';
import {
  announcements,
  calendarItems,
  contact,
  events,
  EventItem,
  lostItems,
  programmeGroups,
  programmes,
  rooms,
  societies,
  staff,
} from './src/data';
import {
  AssistantFab,
  Badge,
  BottomNav,
  Header,
  ListCard,
  MotionPressable,
  PrimaryButton,
  QuickTile,
  ScreenEnter,
  SearchBox,
  SectionTitle,
  Segmented,
  Stagger,
  UclLogo,
} from './src/components';

type Screen =
  | 'splash'
  | 'login'
  | 'role'
  | 'home'
  | 'announcements'
  | 'events'
  | 'event-detail'
  | 'calendar'
  | 'programme'
  | 'academic-support'
  | 'directory'
  | 'services'
  | 'rooms'
  | 'lost-found'
  | 'societies'
  | 'ai'
  | 'profile'
  | 'admin';

type Role = 'Student' | 'Staff' | 'Society Representative';
type ChatMessage = { id: string; from: 'assistant' | 'me'; text: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [role, setRole] = useState<Role>('Student');
  const [selectedEvent, setSelectedEvent] = useState<EventItem>(events[0]);
  const [interested, setInterested] = useState<string[]>([]);
  const [bookedRooms, setBookedRooms] = useState<string[]>([]);
  const [joinedSocieties, setJoinedSocieties] = useState<string[]>([]);

  const go = (next: Screen) => setScreen(next);
  const openEvent = (event: EventItem) => {
    setSelectedEvent(event);
    go('event-detail');
  };

  if (screen === 'splash') return <Splash onContinue={() => go('login')} />;
  if (screen === 'login') return <Login onLogin={() => go('role')} />;
  if (screen === 'role') return <RoleSelection role={role} setRole={setRole} onContinue={() => go(role === 'Staff' ? 'admin' : 'home')} />;
  if (screen === 'admin') return <AdminDashboard onStudentView={() => go('home')} onLogout={() => go('login')} />;

  let body: React.ReactNode;
  switch (screen) {
    case 'home': body = <Home go={go} openEvent={openEvent} />; break;
    case 'announcements': body = <Announcements onBack={() => go('home')} />; break;
    case 'events': body = <EventsScreen onBack={() => go('home')} onOpen={openEvent} interested={interested} setInterested={setInterested} />; break;
    case 'event-detail': body = <EventDetail event={selectedEvent} onBack={() => go('events')} interested={interested.includes(selectedEvent.id)} toggle={() => setInterested(x => x.includes(selectedEvent.id) ? x.filter(id => id !== selectedEvent.id) : [...x, selectedEvent.id])} />; break;
    case 'calendar': body = <AcademicCalendar onBack={() => go('home')} />; break;
    case 'programme': body = <Programmes onBack={() => go('home')} />; break;
    case 'academic-support': body = <AcademicSupport onBack={() => go('home')} />; break;
    case 'directory': body = <Directory onBack={() => go('home')} />; break;
    case 'services': body = <Services go={go} />; break;
    case 'rooms': body = <RoomBooking onBack={() => go('services')} booked={bookedRooms} setBooked={setBookedRooms} />; break;
    case 'lost-found': body = <LostFound onBack={() => go('services')} />; break;
    case 'societies': body = <Societies onBack={() => go('home')} joined={joinedSocieties} setJoined={setJoinedSocieties} />; break;
    case 'ai': body = <AiAssistant onBack={() => go('home')} />; break;
    case 'profile': body = <Profile role={role} onLogout={() => go('login')} />; break;
    default: body = <Home go={go} openEvent={openEvent} />;
  }

  const hasBottom = ['home', 'events', 'calendar', 'services', 'profile'].includes(screen);
  const showFab = !['ai', 'event-detail'].includes(screen);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style={screen === 'home' ? 'light' : 'dark'} />
      <ScreenEnter screenKey={screen}>{body}</ScreenEnter>
      {hasBottom ? <BottomNav active={screen} go={go} /> : null}
      {showFab ? <AssistantFab onPress={() => go('ai')} /> : null}
    </SafeAreaView>
  );
}

function Splash({ onContinue }: { onContinue: () => void }) {
  const logoScale = useRef(new Animated.Value(0.84)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const line = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 110 }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(line, { toValue: 1, duration: 1200, useNativeDriver: false }),
      Animated.timing(line, { toValue: 0, duration: 1200, useNativeDriver: false }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <SafeAreaView style={s.splash}>
      <StatusBar style="light" />
      <Animated.View style={[s.splashCenter, { opacity, transform: [{ scale: logoScale }] }]}>
        <View style={s.splashLogoCard}><UclLogo size={104} /></View>
        <Text style={s.splashTitle}>UCL Campus Hub</Text>
        <Text style={s.splashSub}>Your Campus.{`\n`}Always with You.</Text>
      </Animated.View>
      <View style={s.splashBottom}>
        <Animated.View style={[s.splashLine, { opacity: line.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) }]} />
        <Text style={s.splashCopy}>One place for your announcements, events, support and student services.</Text>
        <PrimaryButton title="Get Started" onPress={onContinue} />
      </View>
    </SafeAreaView>
  );
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [tab, setTab] = useState('Sign In');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.authPage} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Stagger delay={30}><View style={s.loginLogoWrap}><UclLogo size={75} /></View></Stagger>
          <Stagger delay={80}><Text style={s.authTitle}>Welcome Back</Text><Text style={s.authSub}>Sign in to your UCL account</Text></Stagger>
          <Stagger delay={120} style={{ width: '100%' }}><Segmented items={['Sign In', 'Sign Up']} active={tab} onChange={setTab} /></Stagger>
          {tab === 'Sign In' ? (
            <Stagger delay={160} style={{ width: '100%' }}>
              <View style={s.formCard}>
                <Text style={s.fieldLabel}>Student ID or Email</Text>
                <TextInput value={id} onChangeText={setId} placeholder="Student ID or Email" placeholderTextColor={C.subtle} autoCapitalize="none" style={s.input} />
                <Text style={s.fieldLabel}>Password</Text>
                <View style={s.passwordWrap}>
                  <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={C.subtle} secureTextEntry={!show} style={s.passwordInput} />
                  <MotionPressable onPress={() => setShow(v => !v)} style={s.eyeBtn}><Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={19} color={C.muted} /></MotionPressable>
                </View>
                <Text style={s.forgot}>Forgot password?</Text>
                <PrimaryButton title="Login" onPress={onLogin} />
                <View style={s.orRow}><View style={s.orLine} /><Text style={s.orText}>OR</Text><View style={s.orLine} /></View>
                <MotionPressable onPress={onLogin} style={s.googleButton}>
                  <View style={s.googleG}><Text style={{ fontWeight: '900', color: '#4285F4' }}>G</Text></View>
                  <Text style={s.googleText}>Sign in with Google</Text>
                </MotionPressable>
              </View>
            </Stagger>
          ) : (
            <Stagger delay={160} style={{ width: '100%' }}>
              <View style={s.signupInfo}>
                <Ionicons name="school-outline" size={32} color={C.red} />
                <Text style={s.signupTitle}>New to UCL Campus Hub?</Text>
                <Text style={s.signupText}>Student accounts are created using your university identity. Contact Student Services if you need access.</Text>
                <PrimaryButton title="Contact Student Services" onPress={() => Alert.alert('Student Services', contact.general)} outline />
              </View>
            </Stagger>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RoleSelection({ role, setRole, onContinue }: { role: Role; setRole: (r: Role) => void; onContinue: () => void }) {
  const options: Array<[Role, keyof typeof Ionicons.glyphMap, string]> = [
    ['Student', 'person', 'Access information, events, services and more.'],
    ['Staff', 'briefcase', 'Manage and publish university content.'],
    ['Society Representative', 'shield-checkmark', 'Manage society information and activities.'],
  ];
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />
      <View style={s.rolePage}>
        <Stagger delay={30}><View style={{ alignItems: 'center' }}><UclLogo size={60} /><Text style={s.roleTitle}>Select Your Role</Text><Text style={s.roleSub}>This helps us show the right content for you.</Text></View></Stagger>
        <View style={{ gap: 12, marginTop: 26 }}>
          {options.map(([name, icon, desc], index) => {
            const on = role === name;
            return (
              <Stagger key={name} delay={100 + index * 70}>
                <MotionPressable onPress={() => setRole(name)} style={[s.roleCard, on && s.roleCardActive]}>
                  <View style={[s.roleIcon, on && { backgroundColor: C.redSoft }]}><Ionicons name={icon} size={25} color={on ? C.red : C.navy} /></View>
                  <View style={{ flex: 1 }}><Text style={s.roleName}>{name}</Text><Text style={s.roleDesc}>{desc}</Text></View>
                  <View style={[s.radio, on && s.radioOn]}>{on ? <View style={s.radioDot} /> : null}</View>
                </MotionPressable>
              </Stagger>
            );
          })}
        </View>
        <View style={{ flex: 1 }} />
        <PrimaryButton title="Continue" onPress={onContinue} />
      </View>
    </SafeAreaView>
  );
}

function Home({ go, openEvent }: { go: (s: Screen) => void; openEvent: (e: EventItem) => void }) {
  const tiles: Array<[keyof typeof Ionicons.glyphMap, string, Screen]> = [
    ['megaphone', 'Announcements', 'announcements'],
    ['calendar', 'Events', 'events'],
    ['calendar-outline', 'Calendar', 'calendar'],
    ['school', 'Academic Support', 'academic-support'],
    ['card', 'Payment Portal', 'services'],
    ['rocket', 'LaunchPad', 'services'],
    ['book', 'programme', 'programme'],
    ['people', 'Staff Directory', 'directory'],
    ['sparkles', 'AI Assistant', 'ai'],
  ];
  return (
    <View style={s.flex}>
      <View style={s.homeHero}>
        <View style={s.homeTop}>
          <UclLogo size={38} />
          <View style={{ flex: 1, marginLeft: 10 }}><Text style={s.hello}>Hi, Naween!</Text><Text style={s.studentLine}>Student • CS Year 2</Text></View>
          <MotionPressable onPress={() => Alert.alert('Notifications', 'No new urgent notifications.')} style={s.circleBtn}><Ionicons name="notifications-outline" size={20} color={C.white} /></MotionPressable>
          <MotionPressable onPress={() => go('profile')} style={s.avatar}><Text style={s.avatarText}>NK</Text></MotionPressable>
        </View>
        <SearchBox placeholder="Search anything..." />
      </View>
      <ScrollView style={s.flex} contentContainerStyle={s.pagePadBottom} showsVerticalScrollIndicator={false}>
        <Stagger delay={70}>
          <MotionPressable onPress={() => go('programme')} style={s.banner}>
            <Image source={{ uri: 'https://ucl.lk/wp-content/uploads/2026/01/UCL_Library-768x513.jpg' }} style={s.bannerImage} resizeMode="cover" />
            <View style={s.bannerShade} />
            <View style={s.bannerContent}><Text style={s.bannerTitle}>Welcome to UCL!</Text><Text style={s.bannerSub}>Learn. Grow. Belong.</Text></View>
            <View style={s.dots}><View style={s.dotActive} /><View style={s.dot} /><View style={s.dot} /></View>
          </MotionPressable>
        </Stagger>
        <View style={s.quickGrid}>
          {tiles.map(([icon, title, target], i) => <QuickTile key={title} icon={icon} title={title} onPress={() => go(target)} delay={120 + i * 25} />)}
        </View>
        <SectionTitle title="Latest at UCL" action="View all" onAction={() => go('events')} />
        {events.slice(0, 2).map((event, i) => (
          <Stagger key={event.id} delay={330 + i * 60}>
            <MotionPressable onPress={() => openEvent(event)} style={s.homeEvent}>
              <Image source={event.image} style={s.homeEventImage} resizeMode="cover" />
              <View style={{ flex: 1 }}><Badge tone="red">{event.category}</Badge><Text numberOfLines={2} style={s.homeEventTitle}>{event.title}</Text><Text style={s.homeEventMeta}>{event.date} • {event.location}</Text></View>
              <Ionicons name="chevron-forward" size={18} color={C.subtle} />
            </MotionPressable>
          </Stagger>
        ))}
      </ScrollView>
    </View>
  );
}

function Announcements({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState('All');
  const items = announcements.filter((a, i) => tab === 'All' || (tab === 'Important' ? a.important : tab === 'Faculty' ? i % 2 === 0 : i % 2 === 1));
  return (
    <View style={s.flex}>
      <Header title="Announcements" onBack={onBack} />
      <View style={s.pagePad}><Segmented items={['All', 'Faculty', 'Year', 'Important']} active={tab} onChange={setTab} /></View>
      <ScrollView contentContainerStyle={s.listPage} showsVerticalScrollIndicator={false}>
        {items.map((a, i) => (
          <Stagger key={a.id} delay={i * 45}>
            <ListCard icon={a.icon as any} title={a.title} subtitle={a.body} meta={a.meta} red right={a.important ? <Badge>New</Badge> : undefined} />
          </Stagger>
        ))}
      </ScrollView>
    </View>
  );
}

function EventsScreen({ onBack, onOpen, interested, setInterested }: { onBack: () => void; onOpen: (e: EventItem) => void; interested: string[]; setInterested: React.Dispatch<React.SetStateAction<string[]>> }) {
  const [tab, setTab] = useState('Events');
  const [filter, setFilter] = useState('All');
  const filteredEvents = useMemo(() => {
    if (filter === 'All') return events;
    if (filter === 'Careers') return events.filter(e => e.category === 'Careers');
    if (filter === 'Student Organised') return events.filter(e => e.category === 'Leadership');
    return events.filter(e => e.category !== 'Careers');
  }, [filter]);
  return (
    <View style={s.flex}>
      <Header title="News & Events" onBack={onBack} right={<Ionicons name="search-outline" size={21} color={C.navy} />} />
      <View style={s.pagePad}><Segmented items={['News', 'Events']} active={tab} onChange={setTab} /></View>
      {tab === 'Events' ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
            {['All', 'University', 'Student Organised', 'Careers'].map(x => <MotionPressable key={x} onPress={() => setFilter(x)} style={[s.chip, filter === x && s.chipOn]}><Text style={[s.chipText, filter === x && s.chipTextOn]}>{x}</Text></MotionPressable>)}
          </ScrollView>
          <ScrollView contentContainerStyle={s.listPage} showsVerticalScrollIndicator={false}>
            {filteredEvents.map((e, i) => (
              <Stagger key={e.id} delay={i * 50}>
                <MotionPressable onPress={() => onOpen(e)} style={s.eventCard}>
                  <Image source={e.image} style={s.eventThumb} resizeMode="cover" />
                  <View style={{ flex: 1 }}><Text numberOfLines={2} style={s.eventTitle}>{e.title}</Text><Text style={s.eventMeta}>{e.date}</Text><Text numberOfLines={1} style={s.eventMeta}>{e.location}</Text></View>
                  <MotionPressable onPress={() => setInterested(x => x.includes(e.id) ? x.filter(id => id !== e.id) : [...x, e.id])} style={[s.heartBtn, interested.includes(e.id) && { backgroundColor: C.redSoft }]}>
                    <Ionicons name={interested.includes(e.id) ? 'heart' : 'heart-outline'} size={19} color={C.red} />
                  </MotionPressable>
                </MotionPressable>
              </Stagger>
            ))}
          </ScrollView>
        </>
      ) : (
        <ScrollView contentContainerStyle={s.listPage}>
          <ListCard icon="school-outline" title="UCL Monash Graduation 2026" subtitle="UCL celebrated 211 Monash College programme graduates at Waters Edge." meta="9 Jul 2026 • News" red />
          <ListCard icon="trophy-outline" title="Foundation programme Award Ceremony" subtitle="A milestone celebrating students in Information Technology and Business." meta="8 Jun 2026 • News" red />
          <ListCard icon="code-slash-outline" title="UCL × Xiteb Industry Collaboration" subtitle="Industry collaboration supporting future technology talent." meta="2026 • News" red />
        </ScrollView>
      )}
    </View>
  );
}

function EventDetail({ event, onBack, interested, toggle }: { event: EventItem; onBack: () => void; interested: boolean; toggle: () => void }) {
  return (
    <View style={s.flex}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={s.detailHero}>
          <Image source={event.image} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <View style={s.detailShade} />
          <View style={s.detailTop}><MotionPressable onPress={onBack} style={s.detailCircle}><Ionicons name="chevron-back" size={24} color={C.white} /></MotionPressable><MotionPressable onPress={() => Alert.alert('Share', 'Sharing is a frontend demo action.')} style={s.detailCircle}><Ionicons name="share-outline" size={20} color={C.white} /></MotionPressable></View>
        </View>
        <View style={s.detailBody}>
          <Badge>{event.category}</Badge>
          <Text style={s.detailTitle}>{event.title}</Text>
          <View style={s.detailLine}><Ionicons name="calendar-outline" size={19} color={C.navy} /><Text style={s.detailText}>{event.date}</Text></View>
          <View style={s.detailLine}><Ionicons name="time-outline" size={19} color={C.navy} /><Text style={s.detailText}>{event.time}</Text></View>
          <View style={s.detailLine}><Ionicons name="location-outline" size={19} color={C.navy} /><Text style={s.detailText}>{event.location}</Text></View>
          <Text style={s.detailDescription}>{event.summary}</Text>
          <View style={{ gap: 10, marginTop: 22 }}><PrimaryButton title={interested ? 'Interested ✓' : "I'm Interested"} onPress={toggle} /><PrimaryButton title="Add to Calendar" onPress={() => Alert.alert('Added', 'This event was added to the demo calendar.')} outline icon="calendar-outline" /></View>
        </View>
      </ScrollView>
    </View>
  );
}

function AcademicCalendar({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState('Calendar View');

  // Start with October 2026 to match the app design
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(2026, 9, 1)
  );

  const [selectedDate, setSelectedDate] = useState(
    new Date(2026, 9, 15)
  );

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  // JS starts weeks on Sunday.
  // This converts it so our calendar starts on Monday.
  const firstDayOffset =
    (new Date(year, month, 1).getDay() + 6) % 7;

  const calendarCells = Array.from(
    { length: firstDayOffset + daysInMonth },
    (_, index) => {
      if (index < firstDayOffset) {
        return null;
      }

      return index - firstDayOffset + 1;
    }
  );

  const monthLabel = visibleMonth.toLocaleDateString(
    'en-US',
    {
      month: 'long',
      year: 'numeric',
    }
  );

  const monthShort = visibleMonth.toLocaleDateString(
    'en-US',
    {
      month: 'short',
    }
  );

  // Find which dates contain academic items
  const eventDays = new Set(
    calendarItems
      .filter(([date]) => date.endsWith(monthShort))
      .map(([date]) => Number(date.split(' ')[0]))
  );

  const selectedMonthShort =
    selectedDate.toLocaleDateString('en-US', {
      month: 'short',
    });

  const selectedDateKey =
    `${selectedDate.getDate()} ${selectedMonthShort}`;

  const selectedItems = calendarItems.filter(
    ([date]) => date === selectedDateKey
  );

  const changeMonth = (amount: number) => {
    const nextMonth = new Date(
      year,
      month + amount,
      1
    );

    setVisibleMonth(nextMonth);
    setSelectedDate(nextMonth);
  };

  const selectDay = (day: number) => {
    setSelectedDate(
      new Date(year, month, day)
    );
  };

  return (
    <View style={s.flex}>
      <Header
        title="Academic Calendar"
        onBack={onBack}
      />

      <View style={s.pagePad}>
        <Segmented
          items={[
            'Calendar View',
            'Schedule Changes',
          ]}
          active={tab}
          onChange={setTab}
        />
      </View>

      <ScrollView
        contentContainerStyle={s.listPage}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'Calendar View' ? (
          <>
            {/* MONTH CONTROLS */}
            <View style={s.monthRow}>
              <MotionPressable
                onPress={() => changeMonth(-1)}
                style={{
                  width: 40,
                  height: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons
                  name="chevron-back"
                  size={22}
                  color={C.navy}
                />
              </MotionPressable>

              <Text style={s.monthTitle}>
                {monthLabel}
              </Text>

              <MotionPressable
                onPress={() => changeMonth(1)}
                style={{
                  width: 40,
                  height: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={C.navy}
                />
              </MotionPressable>
            </View>

            {/* CALENDAR */}
            <View style={s.calendarCard}>
              <View style={s.weekRow}>
                {[
                  'Mon',
                  'Tue',
                  'Wed',
                  'Thu',
                  'Fri',
                  'Sat',
                  'Sun',
                ].map(day => (
                  <Text
                    key={day}
                    style={s.weekText}
                  >
                    {day}
                  </Text>
                ))}
              </View>

              <View style={s.daysGrid}>
                {calendarCells.map(
                  (day, index) => {
                    if (day === null) {
                      return (
                        <View
                          key={`empty-${index}`}
                          style={s.dayCell}
                        />
                      );
                    }

                    const isSelected =
                      selectedDate.getFullYear() ===
                      year &&
                      selectedDate.getMonth() ===
                      month &&
                      selectedDate.getDate() ===
                      day;

                    const hasEvent =
                      eventDays.has(day);

                    return (
                      <MotionPressable
                        key={`${year}-${month}-${day}`}
                        onPress={() =>
                          selectDay(day)
                        }
                        style={[
                          s.dayCell,
                          isSelected &&
                          s.dayOn,
                        ]}
                      >
                        <Text
                          style={[
                            s.dayText,
                            isSelected && {
                              color: C.white,
                            },
                          ]}
                        >
                          {day}
                        </Text>

                        {hasEvent && (
                          <View
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: 3,
                              marginTop: 3,
                              backgroundColor:
                                isSelected
                                  ? C.white
                                  : C.red,
                            }}
                          />
                        )}
                      </MotionPressable>
                    );
                  }
                )}
              </View>
            </View>

            {/* SELECTED DATE */}
            <View
              style={{
                marginTop: 18,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: C.navy,
                  fontSize: 18,
                  fontWeight: '900',
                }}
              >
                {selectedDate.toLocaleDateString(
                  'en-US',
                  {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  }
                )}
              </Text>
            </View>

            {/* ITEMS ON SELECTED DATE */}
            {selectedItems.length > 0 ? (
              selectedItems.map(
                ([date, title, type]) => (
                  <ListCard
                    key={title}
                    icon={
                      type === 'Exam'
                        ? 'document-text-outline'
                        : 'calendar-outline'
                    }
                    title={title}
                    subtitle={date}
                    meta={type}
                    red
                  />
                )
              )
            ) : (
              <View
                style={{
                  backgroundColor: C.white,
                  borderWidth: 1,
                  borderColor: C.border,
                  borderRadius: 16,
                  padding: 18,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    color: C.navy,
                    fontWeight: '800',
                    fontSize: 15,
                  }}
                >
                  No academic events
                </Text>

                <Text
                  style={{
                    color: C.subtle,
                    marginTop: 5,
                  }}
                >
                  There are no deadlines or
                  academic events scheduled for
                  this date.
                </Text>
              </View>
            )}

            {/* UPCOMING ITEMS */}
            <SectionTitle
              title="Upcoming"
              action="See All"
            />

            {calendarItems.map(
              ([date, title, type], i) => (
                <ListCard
                  key={title}
                  icon={
                    type === 'Exam'
                      ? 'document-text-outline'
                      : 'calendar-outline'
                  }
                  title={title}
                  subtitle={date}
                  meta={type}
                  red={i === 0}
                />
              )
            )}
          </>
        ) : (
          <>
            <ListCard
              icon="alert-circle-outline"
              title="Room Change"
              subtitle="Software Engineering lecture moved from B203 to A101."
              meta="Today • 2:00 PM"
              red
            />

            <ListCard
              icon="time-outline"
              title="Class Time Updated"
              subtitle="Business tutorial now starts at 11:30 AM."
              meta="Tomorrow"
            />

            <ListCard
              icon="cloudy-outline"
              title="Campus Schedule Notice"
              subtitle="Official changes and closures will appear here when published."
              meta="University notice"
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Programmes({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      programmes.filter(([name, partner]) =>
        `${name} ${partner}`.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  return (
    <View style={s.flex}>
      <Header title="Programmes" onBack={onBack} />
      <ScrollView
        contentContainerStyle={s.listPage}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.programmeHero}>
          <Image
            source={require('./assets/programme-banner.png')}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View style={s.programmeShade} />
          <Text style={s.programmeHeroTitle}>
            World-class programmes{`\n`}for a global future.
          </Text>
        </View>

        <View style={{ marginTop: 14 }}>
          <SearchBox
            value={search}
            onChangeText={setSearch}
            placeholder="Search programmes..."
          />
        </View>

        <SectionTitle title="Explore categories" />
        {programmeGroups.map((p) => (
          <ListCard
            key={p.title}
            icon={p.icon as any}
            title={p.title}
            subtitle={p.subtitle}
            red
          />
        ))}

        <SectionTitle title="Programme list" />
        {filtered.map(([name, partner]) => (
          <ListCard
            key={name}
            icon="book-outline"
            title={name}
            subtitle={partner}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function AcademicSupport({ onBack }: { onBack: () => void }) {
  return (
    <View style={s.flex}>
      <Header title="Academic Support" onBack={onBack} />
      <ScrollView contentContainerStyle={s.listPage} showsVerticalScrollIndicator={false}>
        <ListCard icon="people-outline" title="Find a Study Group" subtitle="Connect with classmates studying the same modules." red />
        <ListCard icon="chatbubbles-outline" title="Peer Tutoring" subtitle="Get help from senior students and peer tutors." red />
        <ListCard icon="person-add-outline" title="Mentorship" subtitle="Connect with mentors for academic guidance." red />
        <ListCard icon="document-text-outline" title="Learning Resources" subtitle="Notes, past papers and useful learning resources." red />
        <ListCard icon="checkmark-done-outline" title="Exam Support" subtitle="Exam tips, timetable guidance and study planning." red />
        <View style={{ marginTop: 12 }}><PrimaryButton title="Request Support" onPress={() => Alert.alert('Request sent', 'Your demo support request has been submitted.')} /></View>
        <SectionTitle title="Recent Study Groups" />
        <View style={s.studyCard}><View><Text style={s.studyTitle}>Data Structures Study Group</Text><Text style={s.studySub}>5 members • CS Year 2</Text></View><MotionPressable onPress={() => Alert.alert('Joined', 'You joined the demo study group.')} style={s.joinSmall}><Text style={s.joinSmallText}>Join</Text></MotionPressable></View>
      </ScrollView>
    </View>
  );
}

function Directory({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState('Academic Staff');
  const [search, setSearch] = useState('');
  const list = staff.filter(([name, role]) => `${name} ${role}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <View style={s.flex}>
      <Header title="Staff Directory" onBack={onBack} />
      <View style={s.pagePad}><Segmented items={['Academic Staff', 'All Staff']} active={tab} onChange={setTab} /><View style={{ marginTop: 11 }}><SearchBox value={search} onChangeText={setSearch} placeholder="Search staff by name or role..." /></View></View>
      <ScrollView contentContainerStyle={s.listPage} showsVerticalScrollIndicator={false}>
        {list.map(([name, role], i) => (
          <Stagger key={name} delay={i * 30}><View style={s.staffCard}><View style={[s.staffAvatar, { backgroundColor: i % 2 === 0 ? C.blueSoft : C.redSoft }]}><Text style={[s.staffInitial, { color: i % 2 === 0 ? C.navy : C.red }]}>{name.replace(/^(Dr\.|Mr\.|Ms\.)\s/, '').split(' ').map(x => x[0]).slice(0, 2).join('')}</Text></View><View style={{ flex: 1 }}><Text style={s.staffName}>{name}</Text><Text numberOfLines={2} style={s.staffRole}>{role}</Text></View><Ionicons name="mail-outline" size={20} color={C.red} /></View></Stagger>
        ))}
        <SectionTitle title="IT Support" />
        <ListCard icon="headset-outline" title="IT Help Desk" subtitle="Get help with your UCL account, systems and technical issues." red />
      </ScrollView>
    </View>
  );
}

function Services({ go }: { go: (s: Screen) => void }) {
  return (
    <View style={s.flex}>
      <Header title="Student Services" />
      <ScrollView contentContainerStyle={s.listPage} showsVerticalScrollIndicator={false}>
        <ListCard icon="card-outline" title="Payment Portal" subtitle="Pay fees and view payment information." red onPress={() => Alert.alert('Payment Portal', 'This frontend button is ready to connect to the UCL payment portal/backend.')} />
        <ListCard icon="document-text-outline" title="My Enrolment" subtitle="Course registration and enrolment details." red />
        <ListCard icon="rocket-outline" title="LaunchPad" subtitle="Entrepreneurship, companies, investors and mentors." red />
        <ListCard icon="people-outline" title="Student Life" subtitle="Clubs, societies and student activities." red onPress={() => go('societies')} />
        <ListCard icon="calendar-outline" title="Classroom Booking" subtitle="Check availability and request a study room." red onPress={() => go('rooms')} />
        <ListCard icon="search-outline" title="Lost & Found" subtitle="Report or search for lost and found items." red onPress={() => go('lost-found')} />
        <ListCard icon="heart-outline" title="Wellbeing & Support" subtitle="Student wellbeing and support information." red />
        <SectionTitle title="Contact UCL" />
        <ListCard icon="call-outline" title="Admission Inquiries" subtitle={contact.admissions} />
        <ListCard icon="mail-outline" title={contact.email} subtitle={contact.officeHours} />
      </ScrollView>
    </View>
  );
}

function RoomBooking({ onBack, booked, setBooked }: { onBack: () => void; booked: string[]; setBooked: React.Dispatch<React.SetStateAction<string[]>> }) {
  return (
    <View style={s.flex}>
      <Header title="Classroom Booking" onBack={onBack} />
      <View style={s.pagePad}><View style={s.filterRow}><View style={s.filterBox}><Ionicons name="calendar-outline" size={17} color={C.red} /><Text style={s.filterText}>15 Oct 2026</Text></View><View style={s.filterBox}><Ionicons name="time-outline" size={17} color={C.red} /><Text style={s.filterText}>Any Time</Text></View></View></View>
      <ScrollView contentContainerStyle={s.listPage}>
        {rooms.map(([room, capacity, features, available]) => {
          const isBooked = booked.includes(room);
          return <View key={room} style={s.roomCard}><View style={s.roomIcon}><Ionicons name="business-outline" size={24} color={C.navy} /></View><View style={{ flex: 1 }}><Text style={s.roomName}>{room}</Text><Text style={{ color: available ? C.green : C.red, fontWeight: '800', fontSize: 11.5 }}>{available ? 'Available' : 'Occupied'}</Text><Text style={s.roomMeta}>Capacity: {capacity}</Text><Text style={s.roomMeta}>{features}</Text></View><MotionPressable disabled={!available} onPress={() => setBooked(x => x.includes(room) ? x.filter(r => r !== room) : [...x, room])} style={[s.bookBtn, isBooked && { backgroundColor: C.navy }, !available && { backgroundColor: '#C7CED8' }]}><Text style={s.bookText}>{isBooked ? 'Booked' : 'Book'}</Text></MotionPressable></View>
        })}
      </ScrollView>
    </View>
  );
}

function LostFound({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState('Found Items');
  return (
    <View style={s.flex}>
      <Header title="Lost & Found" onBack={onBack} right={<MotionPressable onPress={() => Alert.alert('Report item', 'A report form would open here.')} style={s.plusBtn}><Ionicons name="add" size={20} color={C.white} /></MotionPressable>} />
      <View style={s.pagePad}><Segmented items={['Found Items', 'Lost Items']} active={tab} onChange={setTab} /></View>
      <ScrollView contentContainerStyle={s.listPage}>{lostItems.map(([name, meta, icon]) => <ListCard key={name} icon={icon as any} title={name} subtitle={meta} red />)}</ScrollView>
    </View>
  );
}

function Societies({ onBack, joined, setJoined }: { onBack: () => void; joined: string[]; setJoined: React.Dispatch<React.SetStateAction<string[]>> }) {
  return (
    <View style={s.flex}>
      <Header title="Student Life" onBack={onBack} />
      <ScrollView contentContainerStyle={s.listPage}>
        {societies.map(([name, desc, icon]) => {
          const on = joined.includes(name);
          return <View key={name} style={s.societyCard}><View style={s.societyIcon}><Ionicons name={icon as any} size={25} color={C.red} /></View><View style={{ flex: 1 }}><Text style={s.societyName}>{name}</Text><Text style={s.societyDesc}>{desc}</Text></View><MotionPressable onPress={() => setJoined(x => x.includes(name) ? x.filter(n => n !== name) : [...x, name])} style={[s.followBtn, on && { backgroundColor: C.navy, borderColor: C.navy }]}><Text style={[s.followText, on && { color: C.white }]}>{on ? 'Joined' : 'Join'}</Text></MotionPressable></View>
        })}
      </ScrollView>
    </View>
  );
}

function AiAssistant({ onBack }: { onBack: () => void }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 'a0', from: 'assistant', text: "Hello! I'm your UCL Assistant. How can I help you today?" }]);
  const suggestions = ['When is my next exam?', 'Show upcoming events', 'Find a study group', 'How do I pay my fees?', 'Contact IT support'];
  const send = (text = input) => {
    const q = text.trim(); if (!q) return;
    const reply = q.toLowerCase().includes('event') ? 'You can open News & Events from Explore. Current UCL event examples include Career Fair ’26 and the Future Leaders Forum 2026.' : q.toLowerCase().includes('pay') ? 'Open Student Services and choose Payment Portal. The final app can connect this to the university payment system.' : q.toLowerCase().includes('study') ? 'Academic Support includes study groups, peer tutoring and mentorship.' : q.toLowerCase().includes('it') ? `For IT support, open Staff Directory & IT Support. General UCL enquiries: ${contact.general}.` : 'I can help you find announcements, events, academic support, programme, staff and student services.';
    setMessages(m => [...m, { id: `m${Date.now()}`, from: 'me', text: q }, { id: `a${Date.now() + 1}`, from: 'assistant', text: reply }]);
    setInput('');
  };
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.flex}>
      <Header title="UCL Assistant" onBack={onBack} right={<Ionicons name="ellipsis-horizontal" size={21} color={C.navy} />} />
      <View style={s.aiBrand}><View style={s.botCircle}><Ionicons name="sparkles" size={21} color={C.white} /></View><Text style={s.aiName}>UCL Assistant</Text></View>
      <ScrollView contentContainerStyle={s.chatPage} showsVerticalScrollIndicator={false}>
        {messages.map(m => <View key={m.id} style={[s.bubble, m.from === 'me' ? s.meBubble : s.aiBubble]}><Text style={[s.bubbleText, m.from === 'me' && { color: C.white }]}>{m.text}</Text></View>)}
        <View style={s.suggestions}>{suggestions.map(q => <MotionPressable key={q} onPress={() => send(q)} style={s.suggestChip}><Text style={s.suggestText}>{q}</Text></MotionPressable>)}</View>
      </ScrollView>
      <View style={s.chatComposer}><TextInput value={input} onChangeText={setInput} placeholder="Type your question..." placeholderTextColor={C.subtle} style={s.chatInput} onSubmitEditing={() => send()} /><Ionicons name="mic-outline" size={20} color={C.muted} /><MotionPressable onPress={() => send()} style={s.sendBtn}><Ionicons name="arrow-up" size={20} color={C.white} /></MotionPressable></View>
    </KeyboardAvoidingView>
  );
}

function Profile({ role, onLogout }: { role: Role; onLogout: () => void }) {
  const items: Array<[keyof typeof Ionicons.glyphMap, string]> = [
    ['document-text-outline', 'My Enrolment'], ['calendar-outline', 'My Bookings'], ['heart-outline', 'My Event Interests'], ['notifications-outline', 'Notifications'], ['settings-outline', 'Settings'], ['help-circle-outline', 'Help & Contact']
  ];
  return (
    <View style={s.flex}>
      <Header title="Profile" right={<Ionicons name="settings-outline" size={21} color={C.navy} />} />
      <ScrollView contentContainerStyle={s.listPage}>
        <View style={s.profileTop}><View style={s.profileAvatar}><Text style={s.profileInitial}>NK</Text></View><View><Text style={s.profileName}>Naween</Text><Text style={s.profileMeta}>{role}</Text><Text style={s.profileMeta}>Student ID: UCL12345</Text></View></View>
        {items.map(([icon, title]) => <ListCard key={title} icon={icon} title={title} />)}
        <MotionPressable onPress={onLogout} style={s.logout}><Ionicons name="log-out-outline" size={20} color={C.red} /><Text style={s.logoutText}>Logout</Text></MotionPressable>
      </ScrollView>
    </View>
  );
}

function AdminDashboard({ onStudentView, onLogout }: { onStudentView: () => void; onLogout: () => void }) {
  const stats = [['12', 'Announcements'], ['8', 'Upcoming Events'], ['1,245', 'Active Users'], ['4', 'Pending Approvals']];
  return (
    <SafeAreaView style={s.adminSafe}>
      <StatusBar style="light" />
      <View style={s.adminHeader}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}><UclLogo size={34} /><Text style={s.adminBrand}>UCL Admin</Text></View><MotionPressable onPress={onLogout} style={s.adminLogout}><Ionicons name="log-out-outline" size={20} color={C.white} /></MotionPressable></View>
      <ScrollView contentContainerStyle={s.adminPage}>
        <View style={s.adminTitleRow}><View><Text style={s.adminTitle}>Dashboard</Text><Text style={s.adminSub}>Content Management</Text></View><MotionPressable onPress={() => Alert.alert('New Post', 'Post composer would open here.')} style={s.newPost}><Ionicons name="add" size={18} color={C.white} /><Text style={s.newPostText}>New Post</Text></MotionPressable></View>
        <View style={s.statsGrid}>{stats.map(([n, l]) => <View key={l} style={s.statCard}><Text style={s.statNum}>{n}</Text><Text style={s.statLabel}>{l}</Text></View>)}</View>
        <SectionTitle title="Content tools" />
        <ListCard icon="megaphone-outline" title="Announcements" subtitle="Create, update and target official announcements." red />
        <ListCard icon="calendar-outline" title="Events" subtitle="Manage university and student events." red />
        <ListCard icon="people-outline" title="Societies" subtitle="Manage society information and activity." red />
        <ListCard icon="folder-open-outline" title="Content Management" subtitle="Keep student information accurate and current." red />
        <SectionTitle title="Recent activity" />
        <ListCard icon="briefcase-outline" title="Career Fair ’26 updated" meta="2 hours ago" />
        <ListCard icon="megaphone-outline" title="Announcement published" meta="4 hours ago" />
        <ListCard icon="person-add-outline" title="Student access request" meta="6 hours ago" />
        <View style={{ marginTop: 10 }}><PrimaryButton title="Preview Student App" onPress={onStudentView} outline /></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg }, flex: { flex: 1 }, pagePad: { paddingHorizontal: 16, paddingTop: 13 }, pagePadBottom: { paddingHorizontal: 16, paddingBottom: 92 }, listPage: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 100 },
  splash: { flex: 1, backgroundColor: C.navy, paddingHorizontal: 24, justifyContent: 'space-between' }, splashCenter: { alignItems: 'center', marginTop: 120 }, splashLogoCard: { width: 128, height: 134, borderRadius: 20, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } }, splashTitle: { color: C.white, fontWeight: '900', fontSize: 25, marginTop: 24 }, splashSub: { color: '#E7EEF8', fontSize: 16, lineHeight: 23, textAlign: 'center', marginTop: 7 }, splashBottom: { gap: 14, paddingBottom: 30 }, splashLine: { width: 52, height: 4, borderRadius: 2, backgroundColor: C.red, alignSelf: 'center' }, splashCopy: { color: '#D5E0EE', fontSize: 12.5, lineHeight: 18, textAlign: 'center', paddingHorizontal: 20 },
  authPage: { padding: 22, paddingTop: 36, alignItems: 'center', paddingBottom: 44 }, loginLogoWrap: { width: 95, height: 100, alignItems: 'center', justifyContent: 'center' }, authTitle: { color: C.navy, fontSize: 24, fontWeight: '900', textAlign: 'center', marginTop: 10 }, authSub: { color: C.muted, fontSize: 12.5, textAlign: 'center', marginTop: 5, marginBottom: 22 }, formCard: { width: '100%', marginTop: 18 }, fieldLabel: { color: C.text, fontSize: 12, fontWeight: '800', marginBottom: 7, marginTop: 12 }, input: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, paddingHorizontal: 13, color: C.text }, passwordWrap: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, flexDirection: 'row', alignItems: 'center' }, passwordInput: { flex: 1, paddingHorizontal: 13, color: C.text }, eyeBtn: { width: 44, height: 46, alignItems: 'center', justifyContent: 'center' }, forgot: { color: C.red, fontSize: 11.5, fontWeight: '800', textAlign: 'right', marginVertical: 12 }, orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 18 }, orLine: { height: 1, backgroundColor: C.border, flex: 1 }, orText: { color: C.subtle, fontSize: 10, fontWeight: '800' }, googleButton: { height: 50, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }, googleG: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F5F8FC', alignItems: 'center', justifyContent: 'center' }, googleText: { color: C.text, fontSize: 13, fontWeight: '800' }, signupInfo: { width: '100%', marginTop: 22, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 22, alignItems: 'center', gap: 12 }, signupTitle: { color: C.navy, fontSize: 17, fontWeight: '900' }, signupText: { color: C.muted, fontSize: 12.5, lineHeight: 19, textAlign: 'center', marginBottom: 4 },
  rolePage: { flex: 1, padding: 22, paddingTop: 34, backgroundColor: C.bg }, roleTitle: { color: C.navy, fontSize: 23, fontWeight: '900', marginTop: 17 }, roleSub: { color: C.muted, fontSize: 12, textAlign: 'center', marginTop: 5 }, roleCard: { minHeight: 88, borderRadius: 15, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 }, roleCardActive: { borderColor: C.red, borderWidth: 1.5, backgroundColor: '#FFF9F9' }, roleIcon: { width: 46, height: 46, borderRadius: 13, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center' }, roleName: { color: C.text, fontSize: 14, fontWeight: '900' }, roleDesc: { color: C.muted, fontSize: 11, lineHeight: 15, marginTop: 3 }, radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: C.subtle, alignItems: 'center', justifyContent: 'center' }, radioOn: { borderColor: C.red }, radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: C.red },
  homeHero: { backgroundColor: C.navy, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 18 }, homeTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 13 }, hello: { color: C.white, fontSize: 18, fontWeight: '900' }, studentLine: { color: '#D4DFEC', fontSize: 10.5, marginTop: 2 }, circleBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 7, backgroundColor: 'rgba(255,255,255,0.08)' }, avatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: 'rgba(255,255,255,.35)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,.12)' }, avatarText: { color: C.white, fontSize: 11, fontWeight: '900' }, banner: { height: 132, borderRadius: 18, overflow: 'hidden', marginTop: 16, backgroundColor: C.navy, shadowColor: C.shadow, shadowOpacity: .08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 }, bannerImage: { width: '100%', height: '100%' }, bannerShade: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(2,24,50,0.32)' }, bannerContent: { position: 'absolute', left: 18, top: 28, right: 18 }, bannerTitle: { color: C.white, fontSize: 22, fontWeight: '900', textShadowColor: 'rgba(0,0,0,.2)', textShadowRadius: 4 }, bannerSub: { color: '#F4F7FB', fontSize: 12.5, marginTop: 4, fontWeight: '600' }, dots: { position: 'absolute', bottom: 11, left: 0, right: 0, flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center' }, dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,.65)' }, dotActive: { width: 18, height: 6, borderRadius: 3, backgroundColor: C.red }, quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, marginTop: 14 }, homeEvent: { minHeight: 108, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, padding: 10, flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 11, overflow: 'hidden' }, homeEventImage: { width: 82, height: 82, borderRadius: 12, backgroundColor: C.blueSoft }, homeEventTitle: { color: C.text, fontSize: 13.5, fontWeight: '900', marginTop: 6, lineHeight: 18 }, homeEventMeta: { color: C.muted, fontSize: 10.5, marginTop: 5 },
  chipsRow: { paddingHorizontal: 16, paddingTop: 2, paddingBottom: 10, gap: 8 }, chip: { paddingHorizontal: 14, height: 36, borderRadius: 18, backgroundColor: '#F0F3F7', alignItems: 'center', justifyContent: 'center' }, chipOn: { backgroundColor: C.redSoft, borderWidth: 1, borderColor: '#FFD7D9' }, chipText: { color: C.muted, fontSize: 11, fontWeight: '800' }, chipTextOn: { color: C.red }, eventCard: { minHeight: 118, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, padding: 10, flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12, overflow: 'hidden', shadowColor: C.shadow, shadowOpacity: .025, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 1 }, eventThumb: { width: 96, height: 96, borderRadius: 13, backgroundColor: C.blueSoft }, eventTitle: { color: C.text, fontSize: 14, fontWeight: '900', lineHeight: 19 }, eventMeta: { color: C.muted, fontSize: 11, marginTop: 4, lineHeight: 15 }, heartBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 2 },
  detailHero: { height: 265, backgroundColor: C.navy }, detailShade: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,16,34,.22)' }, detailTop: { position: 'absolute', left: 16, right: 16, top: 14, flexDirection: 'row', justifyContent: 'space-between' }, detailCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(3,29,61,.65)', alignItems: 'center', justifyContent: 'center' }, detailBody: { padding: 18 }, detailTitle: { color: C.navy, fontSize: 24, lineHeight: 30, fontWeight: '900', marginTop: 12 }, detailLine: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 13 }, detailText: { color: C.text, fontSize: 13, fontWeight: '700' }, detailDescription: { color: C.muted, fontSize: 13, lineHeight: 20, marginTop: 20 },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, marginBottom: 12 }, monthTitle: { color: C.navy, fontSize: 16, fontWeight: '900' }, calendarCard: { backgroundColor: C.white, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 10 }, weekRow: { flexDirection: 'row' }, weekText: { flex: 1, textAlign: 'center', color: C.subtle, fontSize: 9.5, fontWeight: '800', paddingVertical: 8 }, daysGrid: { flexDirection: 'row', flexWrap: 'wrap' }, dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 20 }, dayOn: { backgroundColor: C.red }, dayText: { color: C.text, fontSize: 11, fontWeight: '700' },
  programmeHero: { height: 112, borderRadius: 16, overflow: 'hidden', justifyContent: 'center', paddingHorizontal: 16 }, programmeShade: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(2,28,58,.48)' }, programmeHeroTitle: { color: C.white, fontSize: 20, fontWeight: '900', lineHeight: 25 },
  studyCard: { backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, studyTitle: { color: C.navy, fontSize: 13, fontWeight: '900' }, studySub: { color: C.muted, fontSize: 10.5, marginTop: 4 }, joinSmall: { paddingHorizontal: 15, height: 34, borderRadius: 9, borderWidth: 1, borderColor: C.red, alignItems: 'center', justifyContent: 'center' }, joinSmallText: { color: C.red, fontSize: 11, fontWeight: '900' },
  staffCard: { minHeight: 76, borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, padding: 11, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 11 }, staffAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' }, staffInitial: { fontSize: 12, fontWeight: '900' }, staffName: { color: C.text, fontSize: 13.5, fontWeight: '900' }, staffRole: { color: C.muted, fontSize: 10.5, lineHeight: 14, marginTop: 3 },
  filterRow: { flexDirection: 'row', gap: 10 }, filterBox: { flex: 1, height: 44, borderRadius: 11, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11 }, filterText: { color: C.text, fontSize: 11.5, fontWeight: '700' }, roomCard: { minHeight: 100, borderRadius: 15, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 10 }, roomIcon: { width: 52, height: 52, borderRadius: 13, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center' }, roomName: { color: C.navy, fontSize: 15, fontWeight: '900' }, roomMeta: { color: C.muted, fontSize: 10.5, marginTop: 3 }, bookBtn: { minWidth: 64, height: 36, borderRadius: 9, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center' }, bookText: { color: C.white, fontSize: 11, fontWeight: '900' }, plusBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center' },
  societyCard: { minHeight: 88, borderRadius: 15, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 10 }, societyIcon: { width: 46, height: 46, borderRadius: 13, backgroundColor: C.redSoft, alignItems: 'center', justifyContent: 'center' }, societyName: { color: C.text, fontSize: 13.5, fontWeight: '900' }, societyDesc: { color: C.muted, fontSize: 10.5, lineHeight: 15, marginTop: 3 }, followBtn: { minWidth: 58, height: 34, borderRadius: 9, borderWidth: 1, borderColor: C.red, alignItems: 'center', justifyContent: 'center' }, followText: { color: C.red, fontSize: 10.5, fontWeight: '900' },
  aiBrand: { alignItems: 'center', paddingVertical: 12, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border }, botCircle: { width: 43, height: 43, borderRadius: 22, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' }, aiName: { color: C.navy, fontSize: 12, fontWeight: '900', marginTop: 5 }, chatPage: { padding: 16, paddingBottom: 20 }, bubble: { maxWidth: '84%', padding: 12, borderRadius: 16, marginBottom: 10 }, aiBubble: { alignSelf: 'flex-start', backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderTopLeftRadius: 5 }, meBubble: { alignSelf: 'flex-end', backgroundColor: C.navy, borderTopRightRadius: 5 }, bubbleText: { color: C.text, fontSize: 12.5, lineHeight: 18 }, suggestions: { alignItems: 'flex-end', gap: 8, marginTop: 8 }, suggestChip: { borderRadius: 18, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, paddingHorizontal: 13, paddingVertical: 9 }, suggestText: { color: C.navy, fontSize: 11, fontWeight: '700' }, chatComposer: { minHeight: 66, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.white, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 }, chatInput: { flex: 1, height: 44, borderRadius: 22, backgroundColor: C.bg, paddingHorizontal: 14, color: C.text }, sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center' },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10, marginBottom: 10 }, profileAvatar: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#8491A2', alignItems: 'center', justifyContent: 'center' }, profileInitial: { color: C.white, fontSize: 18, fontWeight: '900' }, profileName: { color: C.navy, fontSize: 17, fontWeight: '900' }, profileMeta: { color: C.muted, fontSize: 11, marginTop: 3 }, logout: { height: 52, borderRadius: 13, borderWidth: 1, borderColor: '#FFD8DA', backgroundColor: '#FFF8F8', flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 14, marginTop: 6 }, logoutText: { color: C.red, fontSize: 13, fontWeight: '900' },
  adminSafe: { flex: 1, backgroundColor: C.bg }, adminHeader: { height: 64, backgroundColor: C.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 }, adminBrand: { color: C.white, fontSize: 17, fontWeight: '900' }, adminLogout: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,.1)', alignItems: 'center', justifyContent: 'center' }, adminPage: { padding: 16, paddingBottom: 40 }, adminTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }, adminTitle: { color: C.navy, fontSize: 24, fontWeight: '900' }, adminSub: { color: C.muted, fontSize: 11, marginTop: 3 }, newPost: { height: 40, borderRadius: 10, backgroundColor: C.red, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13 }, newPostText: { color: C.white, fontSize: 11.5, fontWeight: '900' }, statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, statCard: { width: '48.5%', minHeight: 78, borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, padding: 12 }, statNum: { color: C.navy, fontSize: 22, fontWeight: '900' }, statLabel: { color: C.muted, fontSize: 10.5, marginTop: 5 },
});
