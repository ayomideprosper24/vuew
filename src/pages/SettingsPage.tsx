import React, { useState, useEffect } from 'react';
import {
  Settings,
  User as UserIcon,
  Bell,
  Shield,
  Sliders,
  Database,
  Check,
  RotateCcw,
  Download,
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Lock,
  Smartphone,
  CheckCircle,
  Sparkles,
  Wifi,
  Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from '../components/pwa/PWAInstallModal';
import { pushNotificationService } from '../services/pushNotification';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';

export const SettingsPage: React.FC = () => {
  const { currentUser, allUsers, setMemberPin, updateProfile, refreshUsers } = useAuth();
  const { tasks, projects, resetDemoData } = useData();
  const { isInstalled, isInstallable, platform, install } = usePWAInstall();
  const [installModalOpen, setInstallModalOpen] = useState(false);

  // Push notification state
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(() =>
    pushNotificationService.getPermission()
  );
  const [pushStatusMessage, setPushStatusMessage] = useState<string>('');

  const [activeTab, setActiveTab] = useState<
    'PROFILE' | 'PIN_SECURITY' | 'INSTALL_APP' | 'NOTIFICATIONS' | 'ACCOUNTABILITY' | 'ROLES' | 'DATA'
  >('PROFILE');

  // Local state for profile form
  const [name, setName] = useState(currentUser.name);
  const [jobTitle, setJobTitle] = useState(currentUser.jobTitle);
  const [phone, setPhone] = useState(currentUser.phone || '+1 (555) 019-2834');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // PIN security states
  const [showOwnPin, setShowOwnPin] = useState(false);
  const [adminNewPin, setAdminNewPin] = useState('');
  const [adminPinFeedback, setAdminPinFeedback] = useState<{ success?: string; error?: string }>({});
  const [selectedMemberPinId, setSelectedMemberPinId] = useState<string>('');
  const [memberNewPinInput, setMemberNewPinInput] = useState<string>('');
  const [memberPinFeedback, setMemberPinFeedback] = useState<{ success?: string; error?: string }>({});

  // Notification toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(true);
  const [dailyStandupDigest, setDailyStandupDigest] = useState(true);
  const [blockerImmediatePing, setBlockerImmediatePing] = useState(true);

  // Accountability thresholds
  const [staleThresholdDays, setStaleThresholdDays] = useState(2);
  const [atRiskBufferDays, setAtRiskBufferDays] = useState(3);
  const [requireBlockerExplanation, setRequireBlockerExplanation] = useState(true);

  const teamMembers = allUsers.filter((u) => u.role === 'TEAM_MEMBER');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      jobTitle,
      phone,
      bio,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleUpdateAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNewPin || adminNewPin.length < 4) {
      setAdminPinFeedback({ error: 'Admin PIN must be at least 4 digits long.' });
      return;
    }

    updateProfile({ pin: adminNewPin.trim() });
    setAdminPinFeedback({ success: 'Admin security PIN updated successfully!' });
    setAdminNewPin('');
    setTimeout(() => setAdminPinFeedback({}), 3000);
  };

  const handleUpdateMemberPin = (memberId: string, pinValue: string) => {
    if (!pinValue || pinValue.length < 4) {
      setMemberPinFeedback({ error: 'PIN must be at least 4 digits.' });
      return;
    }

    const ok = setMemberPin(memberId, pinValue);
    if (ok) {
      setMemberPinFeedback({ success: 'Member PIN updated successfully!' });
      setSelectedMemberPinId('');
      setMemberNewPinInput('');
      setTimeout(() => setMemberPinFeedback({}), 3000);
    } else {
      setMemberPinFeedback({ error: 'Failed to update PIN.' });
    }
  };

  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      tasks,
      projects,
      users: allUsers,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vuew-accountability-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-400" />
          <span>Platform Settings &amp; Governance</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage user profiles, PIN security authentication, accountability policies, and operational snapshots.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-2 overflow-x-auto">
        {(
          [
            { id: 'PROFILE', label: 'My Profile', icon: UserIcon },
            { id: 'PIN_SECURITY', label: 'PIN Security & Access', icon: KeyRound },
            { id: 'INSTALL_APP', label: 'Install App', icon: Download },
            { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell },
            { id: 'ACCOUNTABILITY', label: 'Accountability Rules', icon: Sliders },
            { id: 'ROLES', label: 'Roles & Permissions', icon: Shield },
            { id: 'DATA', label: 'Data Management', icon: Database },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: PROFILE */}
      {activeTab === 'PROFILE' && (
        <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center gap-4 pb-5 border-b border-slate-800">
            <Avatar name={currentUser.name} avatar={currentUser.avatar} size="xl" />
            <div>
              <h3 className="text-base font-bold text-white">{currentUser.name}</h3>
              <p className="text-xs text-slate-400">{currentUser.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="role" role={currentUser.role} size="sm" />
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  PIN: {showOwnPin ? currentUser.pin : '••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowOwnPin(!showOwnPin)}
                  className="p-1 text-slate-400 hover:text-slate-200"
                >
                  {showOwnPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Job Title / Responsibility
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Work Email (Read Only)
              </label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Focus &amp; Scope Summary
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Primary engineering deliverables, cross-functional dependencies..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {profileSaved ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Profile changes saved successfully
              </span>
            ) : (
              <span className="text-xs text-slate-500">Changes are reflected in local session</span>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
            >
              Save Profile
            </button>
          </div>
        </form>
      )}

      {/* Tab: PIN SECURITY & ACCESS */}
      {activeTab === 'PIN_SECURITY' && (
        <div className="space-y-6">
          {/* Admin PIN Settings */}
          {currentUser.role === 'ADMIN' ? (
            <>
              {/* Change Admin PIN Form */}
              <form onSubmit={handleUpdateAdminPin} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <span>Admin Master Security PIN</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Your master administrator PIN unlocks administrative controls and system governance.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400">Current:</span>
                    <span className="font-mono text-sm font-bold text-purple-300">
                      {showOwnPin ? currentUser.pin : '••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowOwnPin(!showOwnPin)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      {showOwnPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      New Admin PIN
                    </label>
                    <input
                      type="text"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={adminNewPin}
                      onChange={(e) => setAdminNewPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 4 or 6-digit PIN"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={!adminNewPin}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold transition-colors"
                    >
                      Update Admin PIN
                    </button>
                  </div>
                </div>

                {adminPinFeedback.error && (
                  <p className="text-xs text-rose-400">{adminPinFeedback.error}</p>
                )}
                {adminPinFeedback.success && (
                  <p className="text-xs text-emerald-400 font-semibold">{adminPinFeedback.success}</p>
                )}
              </form>

              {/* Team Member PIN Management Directory */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-blue-400" />
                      <span>Team Member PIN Directory</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      As Admin, you set and manage login PINs for every team member in the workspace.
                    </p>
                  </div>
                </div>

                {memberPinFeedback.error && (
                  <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                    {memberPinFeedback.error}
                  </div>
                )}
                {memberPinFeedback.success && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                    {memberPinFeedback.success}
                  </div>
                )}

                <div className="divide-y divide-slate-800/80">
                  {teamMembers.map((member) => {
                    const isEditing = selectedMemberPinId === member.id;
                    return (
                      <div
                        key={member.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={member.name} avatar={member.avatar} size="md" />
                          <div>
                            <span className="text-xs font-bold text-white block">{member.name}</span>
                            <span className="text-[11px] text-slate-400 block">{member.jobTitle}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={memberNewPinInput}
                                onChange={(e) => setMemberNewPinInput(e.target.value.replace(/\D/g, ''))}
                                placeholder="New PIN"
                                className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateMemberPin(member.id, memberNewPinInput)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMemberPinId('');
                                  setMemberNewPinInput('');
                                }}
                                className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-emerald-400 font-bold">
                                PIN: {member.pin}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMemberPinId(member.id);
                                  setMemberNewPinInput(member.pin);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                              >
                                Change PIN
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Team Member View of PIN Security */
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Team Member Access PIN
                  </h3>
                  <p className="text-xs text-slate-400">
                    Your login credentials for the VUEW platform.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Assigned Security PIN</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-emerald-400">
                      {showOwnPin ? currentUser.pin : '••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowOwnPin(!showOwnPin)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      {showOwnPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-right max-w-xs">
                  <span className="text-[11px] text-slate-400 leading-relaxed block">
                    Your access PIN is set and maintained by your workspace Administrator. Contact your Admin to update or reset your PIN.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: INSTALL APP (PWA) */}
      {activeTab === 'INSTALL_APP' && (
        <div className="space-y-6">
          {/* Main Install Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/30 border border-blue-500/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-[0_0_25px_rgba(59,130,246,0.4)] flex-shrink-0">
                  V
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Install Vuew</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Install Vuew on your device for quick access.
                  </p>
                </div>
              </div>

              <div>
                {isInstalled ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    <span>App Installed (Standalone Mode)</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      if (isInstallable) {
                        const outcome = await install();
                        if (outcome === 'manual_instructions') {
                          setInstallModalOpen(true);
                        }
                      } else {
                        setInstallModalOpen(true);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install App</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <p className="font-semibold text-white mb-1">Seamless Launch</p>
                <p className="text-[11px] text-slate-400">
                  Runs in an exclusive standalone window without browser toolbars or tabs.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <p className="font-semibold text-white mb-1">Offline Resilience</p>
                <p className="text-[11px] text-slate-400">
                  Static assets precached for instantaneous startup and network drop protection.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <p className="font-semibold text-white mb-1">Session &amp; PIN Preserved</p>
                <p className="text-[11px] text-slate-400">
                  Your secure PIN credentials and active workspace context stay intact.
                </p>
              </div>
            </div>
          </div>

          {/* Device & Platform Capabilities */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Target Device Support &amp; Installation Instructions
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span>Android &amp; Chrome Mobile</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Clicking &ldquo;Install App&rdquo; prompts Chrome for Android to place VUEW onto your home screen and app drawer.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  <span>iPhone &amp; iPad (iOS Safari)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Tap Safari&apos;s Share icon, then select &ldquo;Add to Home Screen&rdquo;. VUEW launches in full standalone mode with custom touch icons.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Windows &amp; macOS Desktop</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Install as a desktop application via Chrome or Edge. Adds VUEW to your Windows Start Menu or macOS Applications folder.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <Wifi className="w-4 h-4 text-amber-400" />
                  <span>Offline Storage Status</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Service Worker actively precaches application assets. Local task and project storage is kept in sync.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: NOTIFICATIONS */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
            Notification &amp; Digest Dispatch Rules
          </h3>

          <div className="space-y-4 divide-y divide-slate-800">
            <div className="flex items-center justify-between pt-3 first:pt-0">
              <div>
                <p className="text-xs font-semibold text-white">Instant Blocker Escalations</p>
                <p className="text-[11px] text-slate-400">
                  Immediately notify project leads when an assignee flags a blocker.
                </p>
              </div>
              <input
                type="checkbox"
                checked={blockerImmediatePing}
                onChange={() => setBlockerImmediatePing(!blockerImmediatePing)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-semibold text-white">Task Assignment Notifications</p>
                <p className="text-[11px] text-slate-400">
                  Notify team members automatically when a new task is assigned to them.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={() => setEmailAlerts(!emailAlerts)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-semibold text-white">Daily Standup Digest</p>
                <p className="text-[11px] text-slate-400">
                  Automated morning briefing summarizing tasks due today, at-risk deadlines, and pending reviews.
                </p>
              </div>
              <input
                type="checkbox"
                checked={dailyStandupDigest}
                onChange={() => setDailyStandupDigest(!dailyStandupDigest)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-semibold text-white">Admin Review Requests</p>
                <p className="text-[11px] text-slate-400">
                  Ping administrator when a task progress reaches 100% and requires official approval.
                </p>
              </div>
              <input
                type="checkbox"
                checked={slackAlerts}
                onChange={() => setSlackAlerts(!slackAlerts)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0"
              />
            </div>
          </div>

          {/* Web Push Notification Section for PWA */}
          <div className="mt-6 pt-5 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Web Push Device Notifications (PWA)
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      pushPermission === 'granted'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : pushPermission === 'denied'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    Permission: {pushPermission}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Deliver urgent task updates, blocker alerts, and approvals directly to your device lock screen even when VUEW is running in the background.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={async () => {
                  const perm = await pushNotificationService.requestPermission();
                  setPushPermission(perm);
                  if (perm === 'granted') {
                    setPushStatusMessage('Push notifications enabled for this device!');
                    setTimeout(() => setPushStatusMessage(''), 4000);
                  } else {
                    setPushStatusMessage('Notification permission not granted.');
                    setTimeout(() => setPushStatusMessage(''), 4000);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{pushPermission === 'granted' ? 'Notification Status: Active' : 'Enable Web Push Alerts'}</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (pushPermission !== 'granted') {
                    const perm = await pushNotificationService.requestPermission();
                    setPushPermission(perm);
                    if (perm !== 'granted') return;
                  }
                  await pushNotificationService.sendLocalNotification({
                    title: 'VUEW: Task Blocker Flagged',
                    body: 'Assignee reported an urgent blocker on Cloud Run API Migration.',
                    category: 'TASK_BLOCKED',
                  });
                  setPushStatusMessage('Test notification sent to device notification center.');
                  setTimeout(() => setPushStatusMessage(''), 4000);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
              >
                <Send className="w-3.5 h-3.5 text-blue-400" />
                <span>Dispatch Test Push Alert</span>
              </button>
            </div>

            {pushStatusMessage && (
              <p className="text-xs text-blue-400 font-medium animate-in fade-in">
                {pushStatusMessage}
              </p>
            )}

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Push Notification Architecture Note:</p>
              <p>
                The PWA service worker supports Web Push subscriptions. Notifications are scrubbed of sensitive internal strings to maintain lock-screen privacy. In cloud environments, configure server-side VAPID keys (<code className="text-blue-300 font-mono">VITE_VAPID_PUBLIC_KEY</code>) to dispatch remote automated cron pings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: ACCOUNTABILITY RULES */}
      {activeTab === 'ACCOUNTABILITY' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
            Automated Accountability Health Engine
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Stale Task Inactivity Threshold (Days)
              </label>
              <p className="text-[11px] text-slate-400 mb-2">
                If an active task receives no progress update for this number of days, its health automatically degrades to &ldquo;Needs Attention&rdquo;.
              </p>
              <input
                type="number"
                min="1"
                max="7"
                value={staleThresholdDays}
                onChange={(e) => setStaleThresholdDays(Number(e.target.value))}
                className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                At-Risk Proximity Buffer (Days Before Due Date)
              </label>
              <p className="text-[11px] text-slate-400 mb-2">
                Tasks with progress under 60% with this number of days remaining automatically trigger &ldquo;At Risk&rdquo; status.
              </p>
              <input
                type="number"
                min="1"
                max="14"
                value={atRiskBufferDays}
                onChange={(e) => setAtRiskBufferDays(Number(e.target.value))}
                className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Require Blocker Justification</p>
                <p className="text-[11px] text-slate-400">
                  Assignees cannot flag a task as BLOCKED without typing the exact reason.
                </p>
              </div>
              <input
                type="checkbox"
                checked={requireBlockerExplanation}
                onChange={() => setRequireBlockerExplanation(!requireBlockerExplanation)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: ROLES & PERMISSIONS */}
      {activeTab === 'ROLES' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
            Role-Based Access Control (RBAC) Matrix
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            VUEW strictly enforces two specialized roles: Administrator and Team Member.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Permission / Capability</th>
                  <th className="py-2.5 px-3">Admin</th>
                  <th className="py-2.5 px-3">Team Member</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Login Authentication</td>
                  <td className="py-3 px-3 text-purple-300 font-mono font-semibold">Admin Security PIN</td>
                  <td className="py-3 px-3 text-blue-300 font-mono font-semibold">PIN Set by Admin</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Set &amp; Manage Member PINs</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">✓ (Full Control)</td>
                  <td className="py-3 px-3 text-slate-600">—</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Create Projects &amp; Initiatives</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">✓</td>
                  <td className="py-3 px-3 text-slate-600">—</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Create &amp; Assign Tasks</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">✓</td>
                  <td className="py-3 px-3 text-slate-600">—</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Update Progress &amp; Flag Blockers</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">✓ (All Tasks)</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">✓ (Assigned Tasks)</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Approve / Request Changes on Work</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">✓</td>
                  <td className="py-3 px-3 text-slate-600">—</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">View Team Overview &amp; Analytics</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">✓</td>
                  <td className="py-3 px-3 text-slate-600">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: DATA MANAGEMENT */}
      {activeTab === 'DATA' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Workspace Persistence &amp; Backups
            </h3>
            <p className="text-xs text-slate-400">
              VUEW local relational storage stores all tasks, comments, audits, and timelines in browser storage.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">Export Workspace Snapshot (JSON)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Download a clean machine-readable archive of all tasks, projects, and users.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-rose-300">Reset to Default Seed Data</h4>
              <p className="text-[11px] text-rose-400/80 mt-0.5">
                Restore initial seed database containing default Admin and Team Member accounts with PIN credentials.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all tasks and projects back to initial demo data?')) {
                  resetDemoData();
                  window.location.reload();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      )}

      {/* PWA Install Modal Guide */}
      <PWAInstallModal isOpen={installModalOpen} onClose={() => setInstallModalOpen(false)} />
    </div>
  );
};
