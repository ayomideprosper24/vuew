import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  ExternalLink,
  Shield,
  KeyRound,
  RefreshCw,
  Sparkles,
  Server,
  Zap,
  Code2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Lock,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA,
} from '../../services/supabase';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { pushToSupabase, pullFromSupabase, clearAndLinkToSupabase } from '../../services/supabaseSync';

export const SupabaseSettings: React.FC = () => {
  const config = getSupabaseConfig();
  const [url, setUrl] = useState(config.url);
  const [anonKey, setAnonKey] = useState(config.anonKey);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedPinSql, setCopiedPinSql] = useState(false);
  const [showSqlPreview, setShowSqlPreview] = useState(false);
  const [syncingData, setSyncingData] = useState(false);
  const [syncResult, setSyncResult] = useState<string>('');
  const [adminPinInput, setAdminPinInput] = useState('1234');
  const [adminPinMessage, setAdminPinMessage] = useState('');

  const { tasks, projects, refreshData, clearAndLinkSupabase } = useData();
  const { allUsers, refreshUsers, setMemberPin } = useAuth();

  // Test on mount if configured
  useEffect(() => {
    if (config.url && config.anonKey) {
      testSupabaseConnection(config.url, config.anonKey).then((res) => {
        setTestResult(res);
      });
    }
  }, []);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setSaveMessage('');
    try {
      const res = await testSupabaseConnection(url, anonKey);
      setTestResult(res);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    saveSupabaseConfig(url, anonKey);
    setSaveMessage('Database credentials saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
    handleTest();
  };

  const handleClear = () => {
    setUrl('');
    setAnonKey('');
    saveSupabaseConfig('', '');
    setTestResult(null);
    setSaveMessage('Database credentials cleared.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleCopyAdminPinSql = () => {
    const pinSql = `UPDATE public.profiles \nSET pin = '${adminPinInput}' \nWHERE email = 'ayomideprosper24@gmail.com' OR role = 'ADMIN';`;
    navigator.clipboard.writeText(pinSql);
    setCopiedPinSql(true);
    setTimeout(() => setCopiedPinSql(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SUPABASE_SQL_SCHEMA], { type: 'text/sql' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'vuew-supabase-schema.sql';
    a.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const handlePushWorkspace = async () => {
    if (!url || !anonKey) {
      setSyncResult('Error: Configure and save your credentials first.');
      return;
    }
    setSyncingData(true);
    setSyncResult('');
    try {
      const res = await pushToSupabase();
      setSyncResult(res.message);
      if (res.success) {
        refreshData();
        refreshUsers();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSyncResult(`Notice: ${msg}`);
    } finally {
      setSyncingData(false);
    }
  };

  const handleClearAndLink = async () => {
    if (!url || !anonKey) {
      setSyncResult('Error: Configure and save your credentials first.');
      return;
    }
    if (!window.confirm('This will clear local demo tasks and connect your app directly to your cloud Supabase database. Continue?')) {
      return;
    }

    setSyncingData(true);
    setSyncResult('');
    try {
      const res = await clearAndLinkSupabase();
      setSyncResult(res.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSyncResult(`Error linking: ${msg}`);
    } finally {
      setSyncingData(false);
    }
  };

  const handleQuickUpdateAdminPin = () => {
    if (!adminPinInput.trim()) {
      setAdminPinMessage('Please enter a valid PIN.');
      return;
    }
    const adminUser = allUsers.find((u) => u.role === 'ADMIN');
    if (adminUser) {
      setMemberPin(adminUser.id, adminPinInput.trim());
      setAdminPinMessage(`Admin PIN successfully set to ${adminPinInput.trim()}`);
      setTimeout(() => setAdminPinMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center flex-shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Cloud Database &amp; Workspace Sync
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  PostgreSQL &amp; Realtime
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Connect your database to persist tasks, team PINs, and real-time updates across all devices.
              </p>
            </div>
          </div>

          {/* Connection Status Pill */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {testResult?.success ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Connected ({testResult.latencyMs}ms)
              </span>
            ) : testResult && !testResult.success ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <AlertCircle className="w-3.5 h-3.5" />
                Disconnected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800">
                <Server className="w-3.5 h-3.5" />
                Not Connected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Live Credentials */}
      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
          Database Credentials
        </h4>

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Project URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project-ref.supabase.co"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-300">
                Anon / Public Key
              </label>
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-[11px] text-zinc-400 hover:text-white transition-colors"
              >
                {showKey ? 'Hide key' : 'Show key'}
              </button>
            </div>
            <input
              type={showKey ? 'text' : 'password'}
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !url || !anonKey}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-[0.98]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing Connection...' : 'Test Connection'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!url || !anonKey}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-zinc-200 border border-zinc-800 text-xs font-semibold transition-all active:scale-[0.98]"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save Credentials</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 rounded-xl bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-rose-400 text-xs font-medium transition-colors"
            >
              Clear
            </button>
          </div>

          {saveMessage && (
            <p className="text-xs text-emerald-400 font-semibold animate-in fade-in">
              {saveMessage}
            </p>
          )}

          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-in fade-in ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-start gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block">
                    {testResult.success ? 'Connection Verified' : 'Connection Unsuccessful'}
                  </span>
                  <span>{testResult.message}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cloud Linking & Data Clear Actions */}
      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
          Database Synchronization &amp; Reset
        </h4>
        <p className="text-xs text-zinc-400">
          Clear local demo data and link everything directly to your cloud tables, or push your current tasks to the database.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleClearAndLink}
            disabled={syncingData || !url || !anonKey}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-[0.98]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Info &amp; Link to Supabase</span>
          </button>

          <button
            type="button"
            onClick={handlePushWorkspace}
            disabled={syncingData || !url || !anonKey}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 disabled:opacity-50 text-white text-xs font-semibold transition-all active:scale-[0.98]"
          >
            <Server className="w-3.5 h-3.5 text-orange-400" />
            <span>Push Current Data to Supabase</span>
          </button>
        </div>

        {syncResult && (
          <p
            className={`text-xs font-medium animate-in fade-in p-3 rounded-xl border ${
              syncResult.includes('Success') || syncResult.includes('cleared')
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            {syncResult}
          </p>
        )}
      </div>

      {/* SQL Migration Script & Admin Password Setup */}
      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            SQL Database Schema &amp; Admin Setup
          </h4>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-bold text-xs transition-all active:scale-95"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy Full SQL'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadSql}
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
              title="Download .sql file"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Admin Password/PIN setup helper */}
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
            <Lock className="w-4 h-4" />
            <span>Admin Password / PIN Setup</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Set or update your Admin PIN below. You can either apply it directly or copy the SQL query to run in Supabase.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              placeholder="e.g. 1234 or your PIN"
              className="w-44 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white text-center tracking-widest focus:outline-none focus:border-orange-500"
            />
            <button
              type="button"
              onClick={handleQuickUpdateAdminPin}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
            >
              Apply to Workspace
            </button>
            <button
              type="button"
              onClick={handleCopyAdminPinSql}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-orange-500/50 text-zinc-300 text-xs font-mono transition-colors"
            >
              {copiedPinSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>Copy SQL Update</span>
            </button>
          </div>
          {adminPinMessage && (
            <p className="text-xs text-emerald-400 font-semibold">{adminPinMessage}</p>
          )}
        </div>

        {/* Toggle SQL schema view */}
        <div>
          <button
            type="button"
            onClick={() => setShowSqlPreview(!showSqlPreview)}
            className="text-zinc-400 hover:text-white text-xs inline-flex items-center gap-1.5 font-mono"
          >
            <Code2 className="w-3.5 h-3.5 text-orange-400" />
            <span>{showSqlPreview ? 'Hide SQL Code' : 'View Full SQL Schema'}</span>
            {showSqlPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showSqlPreview && (
            <pre className="mt-2.5 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-300 max-h-72 overflow-y-auto leading-relaxed select-all">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

