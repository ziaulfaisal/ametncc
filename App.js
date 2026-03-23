import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert, ActivityIndicator,
  SafeAreaView, StatusBar, Image
} from 'react-native';
import * as Updates from 'expo-updates';

const BASE_URL = 'https://ametncc.pythonanywhere.com';
const AMET_LOGO = 'https://ametncc.pythonanywhere.com/uploads/photos/amet-logo-9.png';
const NCC_LOGO  = 'https://ametncc.pythonanywhere.com/uploads/photos/ncclogo.png';

// ── HELPER: build full image URL ──────────────────────────
function getImageUrl(path, subfolder = 'photos') {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}/uploads/${subfolder}/${path}`;
}

function pad(n) { return String(n).padStart(2, '0'); }

// ── AUTO UPDATE — shows banner, user taps to apply ────────
async function checkForUpdates(setUpdateReady) {
  try {
    if (__DEV__) return;
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      setUpdateReady(true);
    }
  } catch (e) {
    console.log('Update check:', e);
  }
}

// ── UPDATE BANNER ─────────────────────────────────────────
function UpdateBanner({ visible }) {
  if (!visible) return null;
  return (
    <TouchableOpacity
      style={s.updateBanner}
      onPress={async () => {
        try { await Updates.reloadAsync(); } catch (e) {}
      }}
      activeOpacity={0.85}
    >
      <View style={s.updateBannerLeft}>
        <Text style={{ fontSize: 20 }}>🔄</Text>
        <View>
          <Text style={s.updateBannerTitle}>New Update Available!</Text>
          <Text style={s.updateBannerSub}>Tap here to update the app now</Text>
        </View>
      </View>
      <Text style={s.updateBannerBtn}>Update →</Text>
    </TouchableOpacity>
  );
}

// ── LOGIN SCREEN ──────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [reg,     setReg]     = useState('');
  const [day,     setDay]     = useState('');
  const [month,   setMonth]   = useState('');
  const [year,    setYear]    = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!reg.trim()) { Alert.alert('Error', 'Enter regimental number'); return; }
    if (!day || !month || !year || year.length < 4) {
      Alert.alert('Error', 'Enter your complete date of birth (DD MM YYYY)');
      return;
    }
    // Try multiple password formats like the website does
    const d = pad(day);
    const m = pad(month);
    const y = year;
    const password = `${d}${m}${y}`; // DDMMYYYY format
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/api/student/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ regimental_number: reg.trim(), password }),
      });
      const data = await res.json();
      if (data.success) { onLogin(data.data); }
      else { Alert.alert('Login Failed', data.message || 'Invalid credentials. Use your date of birth as DD MM YYYY'); }
    } catch (e) {
      Alert.alert('Error', 'Cannot connect to server. Check internet.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView contentContainerStyle={s.loginBg}>

        {/* Title with logos */}
        <View style={s.loginTitleWrap}>
          <View style={s.loginLogosAbove}>
            <Image source={{ uri: AMET_LOGO }} style={s.loginLogoBig} resizeMode="contain" />
            <View style={s.loginLogoDividerBig} />
            <Image source={{ uri: NCC_LOGO }}  style={s.loginLogoBig} resizeMode="contain" />
          </View>
          <Text style={s.loginTitle}>NCC Student Portal</Text>
          <Text style={s.loginSub}>AMET University &amp; AMET IST1 d</Text>
        </View>

        {/* Card */}
        <View style={s.loginCard}>
          <Text style={s.label}>Regimental Number</Text>
          <View style={s.inputRow}>
            <Text style={s.inputIcon}>🪪</Text>
            <TextInput
              style={s.inputField}
              value={reg}
              onChangeText={setReg}
              placeholder="e.g. TN-NCC-001"
              placeholderTextColor="#aaa"
              autoCapitalize="characters"
            />
          </View>

          <Text style={[s.label, { marginTop: 16 }]}>
            Date of Birth
            <Text style={s.labelHint}> (your password)</Text>
          </Text>
          <View style={s.dobRow}>
            <TextInput
              style={s.dobInput}
              value={day} onChangeText={setDay}
              placeholder="DD" placeholderTextColor="#aaa"
              keyboardType="numeric" maxLength={2} />
            <TextInput
              style={s.dobInput}
              value={month} onChangeText={setMonth}
              placeholder="MM" placeholderTextColor="#aaa"
              keyboardType="numeric" maxLength={2} />
            <TextInput
              style={[s.dobInput, { flex: 2 }]}
              value={year} onChangeText={setYear}
              placeholder="YYYY" placeholderTextColor="#aaa"
              keyboardType="numeric" maxLength={4} />
          </View>

          <TouchableOpacity style={s.loginBtn} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <><Text style={s.loginBtnText}>Login to Portal</Text><Text style={s.loginBtnArrow}> →</Text></>
            }
          </TouchableOpacity>

          <View style={s.infoBox}>
            <Text style={s.infoText}>ℹ️  Enter your date of birth as DD / MM / YYYY</Text>
          </View>
        </View>

        <Text style={s.loginFooter}>
          © {new Date().getFullYear()} AMET NCC Student Management
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── TOP NAV BAR ───────────────────────────────────────────
function TopNavBar({ regNo, onLogout }) {
  return (
    <View style={s.topNav}>
      <Image source={{ uri: AMET_LOGO }} style={s.navLogo} resizeMode="contain" />
      <View style={s.navLogoDivider} />
      <Image source={{ uri: NCC_LOGO }}  style={s.navLogo} resizeMode="contain" />
      <View style={{ flex: 1 }} />
      <View style={s.navUserChip}>
        <Text style={s.navUserText} numberOfLines={1}>{regNo}</Text>
      </View>
      <TouchableOpacity onPress={onLogout} style={s.logoutBtn}>
        <Text style={s.logoutBtnText}>Exit</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── TAB BAR ───────────────────────────────────────────────
function TabBar({ active, onTab, unread, pendingComp }) {
  const tabs = [
    { id: 'dashboard',     icon: '🏠', label: 'Home' },
    { id: 'profile',       icon: '👤', label: 'Profile' },
    { id: 'attendance',    icon: '📅', label: 'Attend' },
    { id: 'notifications', icon: '🔔', label: 'Alerts',  badge: unread },
    { id: 'complaints',    icon: '💬', label: 'Help',    badge: pendingComp },
    { id: 'fund',          icon: '💰', label: 'Fund' },
  ];
  return (
    <View style={s.tabBar}>
      {tabs.map(t => (
        <TouchableOpacity key={t.id} style={s.tabItem} onPress={() => onTab(t.id)}>
          <View style={{ position: 'relative' }}>
            <Text style={s.tabIcon}>{t.icon}</Text>
            {t.badge > 0 && (
              <View style={s.tabBadge}>
                <Text style={s.tabBadgeText}>{t.badge > 9 ? '9+' : t.badge}</Text>
              </View>
            )}
          </View>
          <Text style={[s.tabLabel, active === t.id && s.tabLabelActive]}>{t.label}</Text>
          {active === t.id && <View style={s.tabActiveBar} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── SECTION HEADER ────────────────────────────────────────
function SectionHeader({ title, color, rightElement }) {
  return (
    <View style={[s.sectionHeader, { backgroundColor: color || '#1a73e8' }]}>
      <Text style={s.sectionHeaderTitle}>{title}</Text>
      {rightElement}
    </View>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────
function Dashboard({ student, data, onTab }) {
  const att    = data?.attendance_stats || {};
  const pct    = att.percentage ? att.percentage.toFixed(1) : '0.0';
  const unread = (data?.notifications || []).filter(n => !n.is_read).length;
  const fund   = data?.fund?.total || 0;

  return (
    <ScrollView style={s.screen}>
      <View style={s.welcomeBanner}>
        <View style={{ flex: 1 }}>
          <Text style={s.welcomeGreeting}>Welcome back 👋</Text>
          <Text style={s.welcomeName} numberOfLines={1}>{data?.name || student.name}</Text>
          <Text style={s.welcomeSub}>{student.regimental_number} · {data?.wing} Wing</Text>
        </View>
        <Text style={{ fontSize: 40, opacity: 0.3 }}>🛡️</Text>
      </View>

      <View style={s.statsGrid}>
        <TouchableOpacity style={[s.statCard, { backgroundColor: '#1a73e8' }]} onPress={() => onTab('attendance')}>
          <Text style={s.statBgIcon}>📅</Text>
          <Text style={s.statVal}>{pct}%</Text>
          <Text style={s.statLbl}>Attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.statCard, { backgroundColor: '#34a853' }]} onPress={() => onTab('fund')}>
          <Text style={s.statBgIcon}>💰</Text>
          <Text style={s.statVal}>₹{fund.toFixed(0)}</Text>
          <Text style={s.statLbl}>Fund</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.statCard, { backgroundColor: '#fbbc04' }]} onPress={() => onTab('notifications')}>
          <Text style={s.statBgIcon}>🔔</Text>
          <Text style={s.statVal}>{unread}</Text>
          <Text style={s.statLbl}>Unread</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.statCard, { backgroundColor: '#ea4335' }]} onPress={() => onTab('complaints')}>
          <Text style={s.statBgIcon}>💬</Text>
          <Text style={s.statVal}>{(data?.complaints || []).filter(c => c.status === 'pending').length}</Text>
          <Text style={s.statLbl}>Pending</Text>
        </TouchableOpacity>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>📊 Attendance Overview</Text>
        <View style={s.attRow}>
          <View style={s.attBox}><Text style={[s.attNum, { color: '#34a853' }]}>{att.present_days || 0}</Text><Text style={s.attLbl}>Present</Text></View>
          <View style={s.attBox}><Text style={[s.attNum, { color: '#ea4335' }]}>{att.absent_days  || 0}</Text><Text style={s.attLbl}>Absent</Text></View>
          <View style={s.attBox}><Text style={[s.attNum, { color: '#fbbc04' }]}>{att.leave_days   || 0}</Text><Text style={s.attLbl}>Leave</Text></View>
          <View style={s.attBox}><Text style={[s.attNum, { color: '#1a73e8' }]}>{att.total_days   || 0}</Text><Text style={s.attLbl}>Total</Text></View>
        </View>
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: `${Math.min(parseFloat(pct), 100)}%` }]} />
        </View>
        <Text style={s.progressLbl}>
          {pct}% · {parseFloat(pct) >= 75 ? '✅ Excellent' : parseFloat(pct) >= 50 ? '⚠️ Average' : '❌ Low'}
        </Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>⚡ Quick Access</Text>
        <View style={s.quickGrid}>
          {[
            { icon: '📅', label: 'Attendance', tab: 'attendance',    color: '#e8f0fe', tc: '#1a73e8' },
            { icon: '👤', label: 'Profile',    tab: 'profile',       color: '#e6f4ea', tc: '#2e7d32' },
            { icon: '🔔', label: 'Alerts',     tab: 'notifications', color: '#fff8e1', tc: '#f57c00' },
            { icon: '💬', label: 'Complaints', tab: 'complaints',    color: '#fce8e6', tc: '#c62828' },
            { icon: '💰', label: 'Fund',       tab: 'fund',          color: '#e6f4ea', tc: '#2e7d32' },
            { icon: '🏅', label: 'Certs',      tab: 'profile',       color: '#f3e5f5', tc: '#6a1b9a' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={[s.quickBtn, { backgroundColor: item.color }]} onPress={() => onTab(item.tab)}>
              <Text style={{ fontSize: 24 }}>{item.icon}</Text>
              <Text style={[s.quickBtnText, { color: item.tc }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>👤 Profile Summary</Text>
        {[
          ['Institution', data?.institution],
          ['Department',  data?.department],
          ['NCC Batch',   data?.ncc_batch_no],
          ['Phone',       data?.phone],
          ['Blood Group', data?.blood_group],
        ].map(([l, v], i) => (
          <View key={i} style={s.infoRow}>
            <Text style={s.infoLbl}>{l}</Text>
            <Text style={s.infoVal}>{v || '—'}</Text>
          </View>
        ))}
        <TouchableOpacity style={s.viewMoreBtn} onPress={() => onTab('profile')}>
          <Text style={s.viewMoreText}>View Full Profile →</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

// ── CERTIFICATE MODAL ─────────────────────────────────────
function CertModal({ cert, studentId, onClose }) {
  if (!cert) return null;
  const isImage = /\.(jpg|jpeg|png|gif)$/i.test(cert.filename || '');
  const fileUrl = `${BASE_URL}/uploads/certificates/${studentId}/${cert.filename}`;
  return (
    <View style={s.modalOverlay}>
      <View style={s.modalBox}>
        <View style={s.modalHeader}>
          <Text style={s.modalTitle} numberOfLines={1}>{cert.title}</Text>
          <TouchableOpacity onPress={onClose} style={s.modalClose}>
            <Text style={{ fontSize: 20, color: '#666' }}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ maxHeight: 400 }}>
          {isImage
            ? <Image source={{ uri: fileUrl }} style={s.certModalImg} resizeMode="contain" />
            : <View style={s.certModalPdf}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>📄</Text>
                <Text style={{ fontSize: 14, color: '#333', fontWeight: '600', textAlign: 'center' }}>{cert.title}</Text>
                <Text style={{ fontSize: 12, color: '#666', marginTop: 6, textAlign: 'center' }}>PDF Document</Text>
                <Text style={{ fontSize: 11, color: '#999', marginTop: 4, textAlign: 'center' }}>{cert.original_filename}</Text>
              </View>
          }
          <View style={{ padding: 12 }}>
            <Text style={{ fontSize: 12, color: '#666' }}>Uploaded: {cert.upload_date}</Text>
            <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>By: {cert.uploaded_by}</Text>
          </View>
        </ScrollView>
        <TouchableOpacity style={s.modalCloseBtn} onPress={onClose}>
          <Text style={s.modalCloseBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── PROFILE ───────────────────────────────────────────────
function Profile({ data }) {
  const d          = data || {};
  const photoUrl   = getImageUrl(d.photo_path,   'photos');
  const aadhaar    = getImageUrl(d.aadhaar_path, 'aadhaar');
  const [selCert, setSelCert] = useState(null);

  const sections = [
    { title: '👤 Personal', rows: [
      ['Full Name',    d.name_aadhaar || d.name],
      ["Father's Name", d.father_name_aadhaar],
      ["Mother's Name", d.mother_name_aadhaar],
      ['Date of Birth', d.dob],
      ['Blood Group',  d.blood_group],
      ['Food Pref.',   d.food_preference],
      ['Medical',      d.medical_conditions],
    ]},
    { title: '🎓 Academic', rows: [
      ['Institution',  d.institution],
      ['Department',   d.department],
      ['Register No.', d.register_number],
      ['Enrollment',   d.enrollment_number],
      ['NCC Batch',    d.ncc_batch_no],
      ['Inst. Batch',  d.institution_batch_no],
    ]},
    { title: '📞 Contact', rows: [
      ['Phone',        d.phone],
      ['Email',        d.email],
      ['Parent Phone', d.parent_phone],
      ['Emergency',    d.emergency_contact],
      ['Address',      d.address],
    ]},
    { title: '🛡️ NCC', rows: [
      ['Wing',         d.wing],
      ['Date Joined',  d.date_joined],
      ['Camp',         d.camp_attended ? 'Yes ✅' : 'No'],
      ['Scholarship',  d.scholarship],
      ['Achievement',  d.social_achievement],
      ['Status',       d.status],
    ]},
  ];

  return (
    <ScrollView style={s.screen}>
      {/* Hero with photo */}
      <View style={s.profileHero}>
        <View style={s.avatarCircle}>
          {photoUrl
            ? <Image source={{ uri: photoUrl }} style={s.avatarImg} resizeMode="cover" />
            : <Text style={{ fontSize: 40 }}>👤</Text>
          }
        </View>
        <Text style={s.profileName}>{d.name_aadhaar || d.name}</Text>
        <Text style={s.profileId}>{d.regimental_number}</Text>
        <View style={s.profileChips}>
          <View style={s.chip}><Text style={s.chipText}>{d.wing} Wing</Text></View>
          <View style={[s.chip, { backgroundColor: 'rgba(52,168,83,0.3)' }]}>
            <Text style={s.chipText}>{d.status}</Text>
          </View>
        </View>
      </View>

      {/* Info sections */}
      {sections.map((sec, si) => (
        <View key={si} style={s.card}>
          <Text style={s.cardTitle}>{sec.title}</Text>
          {sec.rows.filter(r => r[1]).map(([l, v], i) => (
            <View key={i} style={s.infoRow}>
              <Text style={s.infoLbl}>{l}</Text>
              <Text style={[s.infoVal, { flex: 2 }]}>{v}</Text>
            </View>
          ))}
        </View>
      ))}

      {/* Aadhaar photo */}
      {aadhaar && (
        <View style={s.card}>
          <Text style={s.cardTitle}>🪪 Aadhaar Document</Text>
          <Image source={{ uri: aadhaar }} style={s.docImage} resizeMode="contain" />
        </View>
      )}

      {/* Certificates */}
      {(d.certificates || []).length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>🏅 Certificates</Text>
          {(d.certificates || []).map((c, i) => (
            <TouchableOpacity key={i} style={s.certItem} onPress={() => setSelCert(c)}>
              <View style={s.certIconWrap}>
                <Text style={{ fontSize: 24 }}>📄</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.certTitle}>{c.title}</Text>
                <Text style={s.certDate}>{c.upload_date}</Text>
              </View>
              <View style={s.certViewBtn}>
                <Text style={s.certViewBtnText}>View</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={{ height: 20 }} />

      {/* Certificate Modal */}
      {selCert && (
        <CertModal
          cert={selCert}
          studentId={d.id}
          onClose={() => setSelCert(null)}
        />
      )}
    </ScrollView>
  );
}

// ── ATTENDANCE ────────────────────────────────────────────
function Attendance({ data }) {
  const att     = data?.attendance_stats || {};
  const pct     = att.percentage ? att.percentage.toFixed(1) : '0.0';
  const records = att.recent_records || [];
  const pctNum  = parseFloat(pct);

  return (
    <ScrollView style={s.screen}>
      <SectionHeader title="📅 My Attendance" />
      <View style={s.statsGrid}>
        {[
          { label: 'Total',   val: att.total_days   || 0, color: '#1a73e8' },
          { label: 'Present', val: att.present_days || 0, color: '#34a853' },
          { label: 'Absent',  val: att.absent_days  || 0, color: '#ea4335' },
          { label: 'Leave',   val: att.leave_days   || 0, color: '#fbbc04' },
        ].map((item, i) => (
          <View key={i} style={[s.miniStat, { borderTopColor: item.color }]}>
            <Text style={[s.miniStatVal, { color: item.color }]}>{item.val}</Text>
            <Text style={s.miniStatLbl}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Attendance Rate</Text>
        <Text style={{ fontSize: 28, fontWeight: '800', color: pctNum >= 75 ? '#34a853' : pctNum >= 50 ? '#fbbc04' : '#ea4335', marginBottom: 8 }}>
          {pct}%
        </Text>
        <View style={s.progressBg}>
          <View style={[s.progressFill, {
            width: `${Math.min(pctNum, 100)}%`,
            backgroundColor: pctNum >= 75 ? '#34a853' : pctNum >= 50 ? '#fbbc04' : '#ea4335',
          }]} />
        </View>
        <Text style={[s.progressLbl, { marginTop: 6 }]}>
          {pctNum >= 75 ? '✅ Excellent — keep it up!' : pctNum >= 50 ? '⚠️ Average — aim for 75%' : '❌ Needs improvement'}
        </Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Recent Records</Text>
        {records.length === 0
          ? <Text style={{ color: '#999', textAlign: 'center', padding: 20 }}>No records yet</Text>
          : records.map((r, i) => (
            <View key={i} style={s.recRow}>
              <View>
                <Text style={s.recDate}>{r.datetime?.slice(0, 10)}</Text>
                <Text style={s.recTime}>🕐 {r.datetime?.slice(11, 19)}</Text>
              </View>
              <View style={[s.statusBadge, {
                backgroundColor: r.status === 'Present' ? '#e6f4ea' : r.status === 'Absent' ? '#fce8e6' : '#fff8e1',
              }]}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: r.status === 'Present' ? '#2e7d32' : r.status === 'Absent' ? '#c62828' : '#f57c00' }}>
                  {r.status === 'Present' ? '✅' : r.status === 'Absent' ? '❌' : '🌤️'} {r.status}
                </Text>
              </View>
            </View>
          ))
        }
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

// ── NOTIFICATIONS ─────────────────────────────────────────
function Notifications({ studentId, notifications, onMarkRead }) {
  const unread = notifications.filter(n => !n.is_read).length;
  return (
    <ScrollView style={s.screen}>
      <SectionHeader
        title="🔔 Notifications"
        rightElement={
          unread > 0
            ? <TouchableOpacity onPress={() => onMarkRead('all')} style={s.markAllBtn}>
                <Text style={s.markAllText}>✓ Mark all read</Text>
              </TouchableOpacity>
            : null
        }
      />
      {notifications.length === 0
        ? <View style={s.empty}><Text style={{ fontSize: 40 }}>🔕</Text><Text style={s.emptyText}>No notifications yet</Text></View>
        : notifications.map(n => (
          <TouchableOpacity key={n.id}
            style={[s.notifItem, !n.is_read && s.notifUnread]}
            onPress={() => !n.is_read && onMarkRead(n.id)}
          >
            <View style={[s.notifIconCircle, {
              backgroundColor: n.type === 'warning' ? '#fff8e1' : n.type === 'success' ? '#e6f4ea' : '#e8f0fe',
            }]}>
              <Text style={{ fontSize: 18 }}>{n.type === 'warning' ? '⚠️' : n.type === 'success' ? '✅' : 'ℹ️'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={s.notifTitle} numberOfLines={1}>{n.title}</Text>
                {!n.is_read && <View style={s.dot} />}
              </View>
              <Text style={s.notifMsg}>{n.message}</Text>
              <Text style={s.notifTime}>{n.created_at?.slice(0, 16)} · {n.sender}</Text>
            </View>
          </TouchableOpacity>
        ))
      }
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

// ── COMPLAINTS ────────────────────────────────────────────
function Complaints({ studentId, complaints, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [selType,  setSelType]  = useState('');
  const [text,     setText]     = useState('');
  const [loading,  setLoading]  = useState(false);

  const TYPES       = ['Academic', 'Attendance', 'Certificate', 'Fund', 'Facility', 'NCC Activity', 'Harassment', 'Other'];
  const STATUS_COLOR = { pending: '#fbbc04', in_progress: '#1a73e8', resolved: '#34a853', closed: '#999' };

  const submit = async () => {
    if (!selType)         { Alert.alert('Error', 'Select complaint type'); return; }
    if (text.length < 20) { Alert.alert('Error', 'Write at least 20 characters'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/api/student/complaint`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ student_id: studentId, complaint_type: selType, complaint_text: text }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('✅ Success', 'Complaint submitted! Admin will respond soon.');
        setShowForm(false); setSelType(''); setText('');
        onRefresh();
      } else Alert.alert('Error', data.message);
    } catch (e) { Alert.alert('Error', 'Connection failed'); }
    setLoading(false);
  };

  return (
    <ScrollView style={s.screen}>
      <SectionHeader
        title="💬 Complaints"
        color="#ea4335"
        rightElement={
          <TouchableOpacity onPress={() => setShowForm(!showForm)} style={s.newBtn}>
            <Text style={s.newBtnText}>{showForm ? '✕ Cancel' : '+ New'}</Text>
          </TouchableOpacity>
        }
      />

      {showForm && (
        <View style={s.card}>
          <Text style={s.cardTitle}>📝 New Complaint</Text>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Select type:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {TYPES.map(t => (
              <TouchableOpacity key={t}
                style={[s.typeChip, selType === t && s.typeChipSel]}
                onPress={() => setSelType(t)}>
                <Text style={[s.typeChipText, selType === t && { color: '#fff' }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput style={s.textArea}
            value={text} onChangeText={setText}
            placeholder="Describe your complaint in detail (min 20 characters)..."
            placeholderTextColor="#aaa"
            multiline numberOfLines={5} textAlignVertical="top" />
          <Text style={{ fontSize: 11, color: '#999', textAlign: 'right', marginBottom: 8 }}>{text.length}/2000</Text>
          <TouchableOpacity style={s.submitBtn} onPress={submit} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.submitBtnText}>📨 Submit Complaint</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      {complaints.length === 0
        ? <View style={s.empty}><Text style={{ fontSize: 40 }}>💬</Text><Text style={s.emptyText}>No complaints yet</Text></View>
        : complaints.map(c => (
          <View key={c.id} style={s.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={[s.statusBadge, { backgroundColor: (STATUS_COLOR[c.status] || '#999') + '25' }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: STATUS_COLOR[c.status] || '#999' }}>
                  {c.status?.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              <Text style={{ fontSize: 11, color: '#999' }}>#{c.id} · {c.created_at?.slice(0, 10)}</Text>
            </View>
            <Text style={s.compType}>{c.type}</Text>
            <Text style={s.compDesc}>{c.description}</Text>
            {(c.replies || []).filter(r => r.is_admin_reply).slice(-1).map(r => (
              <View key={r.id} style={s.adminReply}>
                <Text style={s.adminReplyLbl}>💬 Admin replied:</Text>
                <Text style={s.adminReplyTxt}>{r.reply_text}</Text>
              </View>
            ))}
          </View>
        ))
      }
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

// ── FUND ──────────────────────────────────────────────────
function Fund({ data }) {
  const fund    = data?.fund || {};
  const records = fund.records || [];
  const total   = fund.total  || 0;
  const avg     = records.length > 0 ? (total / records.length).toFixed(0) : '0';

  return (
    <ScrollView style={s.screen}>
      <SectionHeader title="💰 Fund Details" color="#34a853" />
      <View style={s.statsGrid}>
        {[
          { label: 'Total Received', val: `₹${total.toFixed(0)}`, color: '#34a853' },
          { label: 'Transactions',   val: String(records.length), color: '#1a73e8' },
          { label: 'Average',        val: `₹${avg}`,             color: '#fbbc04' },
        ].map((item, i) => (
          <View key={i} style={[s.miniStat, { borderTopColor: item.color, flex: 1 }]}>
            <Text style={[s.miniStatVal, { color: item.color, fontSize: 16 }]}>{item.val}</Text>
            <Text style={s.miniStatLbl}>{item.label}</Text>
          </View>
        ))}
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>All Transactions</Text>
        {records.length === 0
          ? <Text style={{ color: '#999', textAlign: 'center', padding: 20 }}>No transactions yet</Text>
          : records.slice().reverse().map((f, i) => (
            <View key={i} style={s.fundRow}>
              <View style={s.fundIconWrap}><Text style={{ fontSize: 20 }}>⬇️</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.fundDesc}>{f.description || 'Fund Received'}</Text>
                <Text style={s.fundMeta}>{f.transaction} · {f.date_time?.slice(0, 10)}</Text>
              </View>
              <Text style={s.fundAmt}>₹{parseFloat(f.amount || 0).toFixed(0)}</Text>
            </View>
          ))
        }
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

// ── MAIN APP ──────────────────────────────────────────────
export default function App() {
  const [student,     setStudent]     = useState(null);
  const [dashData,    setDashData]    = useState(null);
  const [tab,         setTab]         = useState('dashboard');
  const [loading,     setLoading]     = useState(false);
  const [updateReady, setUpdateReady] = useState(false);

  // Check for OTA update when app opens
  useEffect(() => {
    checkForUpdates(setUpdateReady);
  }, []);

  const handleLogin = async (studentData) => {
    setStudent(studentData);
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/api/student/dashboard/${studentData.student_id}`);
      const data = await res.json();
      if (data.success) setDashData(data.data);
    } catch (e) { Alert.alert('Warning', 'Could not load dashboard data'); }
    setLoading(false);
  };

  const refreshData = async () => {
    if (!student) return;
    try {
      const res  = await fetch(`${BASE_URL}/api/student/dashboard/${student.student_id}`);
      const data = await res.json();
      if (data.success) setDashData(data.data);
    } catch (e) {}
  };

  const markRead = async (id) => {
    if (!dashData) return;
    const url  = id === 'all'
      ? `${BASE_URL}/api/student/notifications/read_all`
      : `${BASE_URL}/api/student/notification/read`;
    const body = id === 'all'
      ? { student_id: student.student_id }
      : { student_id: student.student_id, notification_id: id };
    try {
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      setDashData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          id === 'all' ? { ...n, is_read: true } : n.id === id ? { ...n, is_read: true } : n
        ),
      }));
    } catch (e) {}
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { setStudent(null); setDashData(null); setTab('dashboard'); } },
    ]);
  };

  if (!student) return <LoginScreen onLogin={handleLogin} />;

  if (loading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f7fa' }}>
      <Image source={{ uri: AMET_LOGO }} style={{ width: 120, height: 40, marginBottom: 20 }} resizeMode="contain" />
      <ActivityIndicator size="large" color="#1a73e8" />
      <Text style={{ color: '#666', marginTop: 12 }}>Loading your dashboard...</Text>
    </View>
  );

  const unread      = (dashData?.notifications || []).filter(n => !n.is_read).length;
  const pendingComp = (dashData?.complaints    || []).filter(c => c.status === 'pending').length;

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Update notification banner — tap to apply update */}
      <UpdateBanner visible={updateReady} />

      <TopNavBar regNo={student.regimental_number} onLogout={handleLogout} />

      {tab === 'dashboard'     && <Dashboard    student={student} data={dashData} onTab={setTab} />}
      {tab === 'profile'       && <Profile      data={dashData} />}
      {tab === 'attendance'    && <Attendance   data={dashData} />}
      {tab === 'notifications' && <Notifications studentId={student.student_id} notifications={dashData?.notifications || []} onMarkRead={markRead} />}
      {tab === 'complaints'    && <Complaints   studentId={student.student_id} complaints={dashData?.complaints || []} onRefresh={refreshData} />}
      {tab === 'fund'          && <Fund         data={dashData} />}

      <TabBar active={tab} onTab={setTab} unread={unread} pendingComp={pendingComp} />
    </View>
  );
}

// ── STYLES ────────────────────────────────────────────────
const s = StyleSheet.create({
  safeArea:            { flex: 1, backgroundColor: '#fff' },
  loginBg:             { flexGrow: 1, backgroundColor: '#f5f7fa', paddingBottom: 30 },
  loginLogoBar:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', paddingVertical: 16, paddingHorizontal: 24, gap: 12, borderBottomWidth: 0.5, borderBottomColor: '#e1e5eb' },
  loginLogoImg:        { width: 110, height: 44 },
  loginLogoDivider:    { width: 1, height: 40, backgroundColor: '#e1e5eb' },
  loginTitleWrap:      { alignItems: 'center', paddingVertical: 20 },
  loginLogosAbove:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 },
  loginLogoBig:        { width: 120, height: 50 },
  loginLogoDividerBig: { width: 1, height: 46, backgroundColor: '#e1e5eb' },
  loginShield:         { width: 72, height: 72, borderRadius: 36, backgroundColor: '#1a73e8', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  loginTitle:          { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  loginSub:            { fontSize: 13, color: '#666', marginTop: 4 },
  loginCard:           { backgroundColor: '#fff', borderRadius: 16, padding: 22, marginHorizontal: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  label:               { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  labelHint:           { fontSize: 12, color: '#999', fontWeight: '400' },
  inputRow:            { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#e1e5eb', borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#fafafa' },
  inputIcon:           { fontSize: 18, marginRight: 8 },
  inputField:          { flex: 1, fontSize: 14, color: '#333', paddingVertical: 10 },
  dobRow:              { flexDirection: 'row', gap: 8, marginBottom: 10 },
  dobInput:            { flex: 1, borderWidth: 2, borderColor: '#e1e5eb', borderRadius: 8, padding: 10, fontSize: 14, color: '#333', backgroundColor: '#fafafa' },
  dobPreview:          { backgroundColor: '#e8f0fe', borderRadius: 8, padding: 10, marginBottom: 16, alignItems: 'center' },
  dobPreviewText:      { color: '#1a73e8', fontWeight: '600', fontSize: 14 },
  loginBtn:            { backgroundColor: '#1a73e8', borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  loginBtnText:        { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginBtnArrow:       { color: '#fff', fontSize: 18, fontWeight: '700' },
  infoBox:             { backgroundColor: '#e8f0fe', borderRadius: 8, padding: 10, marginTop: 14 },
  infoText:            { color: '#1a73e8', fontSize: 12, textAlign: 'center' },
  loginFooter:         { textAlign: 'center', color: '#aaa', fontSize: 11, marginTop: 20 },
  updateBanner:        { backgroundColor: '#1a73e8', paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  updateBannerLeft:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  updateBannerTitle:   { color: '#fff', fontWeight: '700', fontSize: 13 },
  updateBannerSub:     { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  updateBannerBtn:     { color: '#fff', fontWeight: '700', fontSize: 14, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  topNav:              { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, paddingTop: 36, borderBottomWidth: 0.5, borderBottomColor: '#e1e5eb', gap: 8 },
  navLogo:             { width: 70, height: 28 },
  navLogoDivider:      { width: 1, height: 24, backgroundColor: '#e1e5eb' },
  navUserChip:         { backgroundColor: '#e8f0fe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, maxWidth: 120 },
  navUserText:         { color: '#1a73e8', fontSize: 11, fontWeight: '600' },
  logoutBtn:           { backgroundColor: '#fce8e6', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  logoutBtnText:       { color: '#ea4335', fontSize: 12, fontWeight: '700' },
  tabBar:              { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#e1e5eb', paddingBottom: 4 },
  tabItem:             { flex: 1, alignItems: 'center', paddingTop: 6, position: 'relative' },
  tabIcon:             { fontSize: 20 },
  tabLabel:            { fontSize: 10, color: '#999', marginTop: 2 },
  tabLabelActive:      { color: '#1a73e8', fontWeight: '600' },
  tabActiveBar:        { position: 'absolute', top: 0, left: '20%', right: '20%', height: 2, backgroundColor: '#1a73e8', borderRadius: 1 },
  tabBadge:            { position: 'absolute', top: -4, right: -8, backgroundColor: '#ea4335', borderRadius: 9, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  tabBadgeText:        { color: '#fff', fontSize: 9, fontWeight: '700' },
  sectionHeader:       { padding: 16, paddingTop: 14, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionHeaderTitle:  { color: '#fff', fontSize: 18, fontWeight: '700' },
  screen:              { flex: 1, backgroundColor: '#f5f7fa' },
  welcomeBanner:       { backgroundColor: '#1a73e8', padding: 20, flexDirection: 'row', alignItems: 'center' },
  welcomeGreeting:     { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  welcomeName:         { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 2 },
  welcomeSub:          { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  statsGrid:           { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 12, paddingBottom: 0 },
  statCard:            { flex: 1, minWidth: '45%', borderRadius: 10, padding: 14, minHeight: 85, position: 'relative', overflow: 'hidden' },
  statBgIcon:          { position: 'absolute', right: 8, top: 8, fontSize: 32, opacity: 0.2 },
  statVal:             { color: '#fff', fontSize: 22, fontWeight: '800' },
  statLbl:             { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 2 },
  quickGrid:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickBtn:            { width: '30%', borderRadius: 10, padding: 12, alignItems: 'center', gap: 4 },
  quickBtnText:        { fontSize: 11, fontWeight: '600' },
  card:                { backgroundColor: '#fff', borderRadius: 12, padding: 16, margin: 12, marginBottom: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  cardTitle:           { fontSize: 14, fontWeight: '700', color: '#1a73e8', marginBottom: 12 },
  attRow:              { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  attBox:              { alignItems: 'center' },
  attNum:              { fontSize: 22, fontWeight: '800' },
  attLbl:              { fontSize: 11, color: '#666', marginTop: 2 },
  progressBg:          { height: 10, backgroundColor: '#e1e5eb', borderRadius: 5, overflow: 'hidden' },
  progressFill:        { height: '100%', backgroundColor: '#34a853', borderRadius: 5 },
  progressLbl:         { fontSize: 11, color: '#666', textAlign: 'right', marginTop: 4 },
  infoRow:             { flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  infoLbl:             { fontSize: 12, color: '#888', width: 95 },
  infoVal:             { fontSize: 12, color: '#333', fontWeight: '500', flex: 1 },
  viewMoreBtn:         { marginTop: 12, alignItems: 'center', paddingTop: 10, borderTopWidth: 0.5, borderTopColor: '#e1e5eb' },
  viewMoreText:        { color: '#1a73e8', fontWeight: '600', fontSize: 13 },
  profileHero:         { backgroundColor: '#1a73e8', alignItems: 'center', paddingTop: 20, paddingBottom: 20 },
  avatarCircle:        { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 3, borderColor: '#fff', overflow: 'hidden' },
  avatarImg:           { width: 84, height: 84, borderRadius: 42 },
  docImage:            { width: '100%', height: 200, borderRadius: 8, marginTop: 8 },
  profileName:         { color: '#fff', fontSize: 18, fontWeight: '700' },
  profileId:           { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  profileChips:        { flexDirection: 'row', gap: 8, marginTop: 10 },
  chip:                { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  chipText:            { color: '#fff', fontSize: 12, fontWeight: '600' },
  miniStat:            { backgroundColor: '#fff', borderRadius: 8, padding: 10, alignItems: 'center', borderTopWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, minWidth: '28%' },
  miniStatVal:         { fontSize: 20, fontWeight: '800', marginTop: 4 },
  miniStatLbl:         { fontSize: 10, color: '#666', marginTop: 2, textAlign: 'center' },
  recRow:              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  recDate:             { fontSize: 13, fontWeight: '600', color: '#333' },
  recTime:             { fontSize: 11, color: '#888', marginTop: 1 },
  statusBadge:         { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  notifItem:           { flexDirection: 'row', gap: 10, padding: 14, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  notifUnread:         { borderLeftWidth: 3, borderLeftColor: '#1a73e8', backgroundColor: '#e8f0fe' },
  notifIconCircle:     { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifTitle:          { fontSize: 13, fontWeight: '700', color: '#333', flex: 1 },
  notifMsg:            { fontSize: 12, color: '#666', marginTop: 2, lineHeight: 16 },
  notifTime:           { fontSize: 10, color: '#999', marginTop: 3 },
  dot:                 { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ea4335' },
  markAllBtn:          { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  markAllText:         { color: '#1a73e8', fontSize: 12, fontWeight: '600' },
  newBtn:              { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  newBtnText:          { color: '#ea4335', fontSize: 13, fontWeight: '700' },
  typeChip:            { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#e1e5eb', marginRight: 8, backgroundColor: '#fff' },
  typeChipSel:         { backgroundColor: '#1a73e8', borderColor: '#1a73e8' },
  typeChipText:        { fontSize: 12, fontWeight: '600', color: '#666' },
  textArea:            { borderWidth: 2, borderColor: '#e1e5eb', borderRadius: 8, padding: 10, fontSize: 13, color: '#333', minHeight: 110, marginBottom: 4 },
  submitBtn:           { backgroundColor: '#1a73e8', borderRadius: 10, padding: 13, alignItems: 'center' },
  submitBtnText:       { color: '#fff', fontSize: 14, fontWeight: '700' },
  compType:            { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  compDesc:            { fontSize: 12, color: '#666', marginBottom: 8, lineHeight: 18 },
  adminReply:          { backgroundColor: '#e8f0fe', borderRadius: 8, padding: 10, marginTop: 4 },
  adminReplyLbl:       { fontSize: 10, fontWeight: '700', color: '#1a73e8', marginBottom: 3 },
  adminReplyTxt:       { fontSize: 12, color: '#333' },
  fundRow:             { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  fundIconWrap:        { width: 36, alignItems: 'center' },
  fundDesc:            { fontSize: 13, fontWeight: '600', color: '#333' },
  fundMeta:            { fontSize: 11, color: '#888', marginTop: 2 },
  fundAmt:             { fontSize: 16, fontWeight: '800', color: '#34a853' },
  empty:               { alignItems: 'center', padding: 50, gap: 10 },
  emptyText:           { color: '#999', fontSize: 14 },
  certItem:            { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  certIconWrap:        { width: 40, alignItems: 'center' },
  certTitle:           { fontSize: 13, fontWeight: '600', color: '#333' },
  certDate:            { fontSize: 11, color: '#888', marginTop: 2 },
  certViewBtn:         { backgroundColor: '#e8f0fe', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  certViewBtnText:     { color: '#1a73e8', fontSize: 12, fontWeight: '600' },
  modalOverlay:        { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 999, padding: 20 },
  modalBox:            { backgroundColor: '#fff', borderRadius: 16, width: '100%', maxHeight: '85%', overflow: 'hidden' },
  modalHeader:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#e1e5eb' },
  modalTitle:          { fontSize: 16, fontWeight: '700', color: '#333', flex: 1, marginRight: 10 },
  modalClose:          { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  certModalImg:        { width: '100%', height: 350 },
  certModalPdf:        { alignItems: 'center', justifyContent: 'center', padding: 40 },
  modalCloseBtn:       { backgroundColor: '#1a73e8', margin: 16, borderRadius: 10, padding: 12, alignItems: 'center' },
  modalCloseBtnText:   { color: '#fff', fontWeight: '700', fontSize: 14 },
});
