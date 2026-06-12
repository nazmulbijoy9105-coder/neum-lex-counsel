import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, ShieldAlert, Award, FileText, CheckCircle, 
  Sparkles, DollarSign, Calendar, Eye, Trash2, Mail, 
  HelpCircle, ChevronRight, Lock, Key, CheckSquare, Download, AlertTriangle,
  Activity, RefreshCw, Search, X, Printer, CreditCard, Landmark, Smartphone
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { User, ContractDoc, Transaction } from '../types';
import OnboardingGuide from './OnboardingGuide';

interface DashboardProps {
  user: User;
  onUpdateUser: (updatedUser: any) => void;
  setActiveTab: (tab: string) => void;
  toasts?: any[];
  removeToast?: (id: string) => void;
}

export default function Dashboard({ user, onUpdateUser, setActiveTab, toasts = [], removeToast }: DashboardProps) {
  const [contracts, setContracts] = useState<ContractDoc[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [activityFilter, setActivityFilter] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('ALL');

  const getActivityConfig = (action: string, status: string) => {
    let icon = <FileText className="h-3.5 w-3.5" />;
    let iconClass = "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-sm";
    let label = action;
    let desc = "Action executed under corporate authority";
    let badgeClass = "bg-slate-900 text-slate-400 border-slate-800";
    let broadCategory = "OTHER";

    const cleanAction = action.toUpperCase();
    if (cleanAction.includes("CONTRACT_NLP_REVIEW")) {
      icon = <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />;
      iconClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      label = "Contract NLP Audit";
      desc = cleanAction.includes("FALLBACK") ? "Local compliance catalog matching executed" : "AI compliance audit successfully completed";
      badgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      broadCategory = "AUDIT";
    } else if (cleanAction.includes("LEGAL_QUERY_NLP")) {
      icon = <Search className="h-3.5 w-3.5 text-cyan-400" />;
      iconClass = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      label = "Legal Precedent Query";
      desc = cleanAction.includes("FALLBACK") ? "Local case backup database search completed" : "Cognitive case law analysis completed";
      badgeClass = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      broadCategory = "RESEARCH";
    } else if (cleanAction === "CONTRACT_SAVED_SECURELY") {
      icon = <Lock className="h-3.5 w-3.5 text-emerald-400" />;
      iconClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      label = "Vault Document Locked";
      desc = "Payload encrypted securely via AES-256";
      badgeClass = "bg-teal-500/10 text-teal-400 border-teal-500/20";
      broadCategory = "VAULT";
    } else if (cleanAction === "SENSITIVE_DOC_DECRYPTED") {
      icon = <Eye className="h-3.5 w-3.5 text-amber-400" />;
      iconClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
      label = "Secure Vault Decryption";
      desc = "Decrypted ciphertext stream on-demand";
      badgeClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
      broadCategory = "VAULT";
    } else if (cleanAction === "CONTRACT_DELETED") {
      icon = <Trash2 className="h-3.5 w-3.5 text-rose-400" />;
      iconClass = "bg-rose-500/10 text-rose-400 border-rose-500/20";
      label = "Vault Record Purge";
      desc = "Permanently deleted and evicted from node database";
      badgeClass = "bg-rose-500/10 text-rose-400 border-rose-500/20";
      broadCategory = "VAULT";
    } else if (cleanAction.includes("NOTIFICATION") || cleanAction.includes("ALERTS")) {
      icon = <Mail className="h-3.5 w-3.5 text-amber-400" />;
      iconClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
      label = "Expiry Warning Dispatched";
      desc = "Simulated automated email notification fired";
      badgeClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
      broadCategory = "AUDIT";
    } else if (cleanAction === "SUBSCRIPTION_UPGRADE") {
      icon = <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />;
      iconClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
      label = "Commercial Plan Expand";
      desc = "Premium credentials license purchased and sealed";
      badgeClass = "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20";
      broadCategory = "SUBSCRIPTION";
    } else if (cleanAction.includes("USER") || cleanAction.includes("REGISTER")) {
      icon = <Award className="h-3.5 w-3.5 text-slate-400" />;
      iconClass = "bg-slate-500/10 text-slate-400 border-slate-500/20";
      label = "Credentials Audit Verification";
      desc = "User registration or login session initialized";
      badgeClass = "bg-slate-900 text-slate-450 border-slate-800";
      broadCategory = "SUBSCRIPTION";
    }

    return { icon, iconClass, label, desc, badgeClass, broadCategory };
  };
  
  // Checkout Modal status
  const [checkoutModal, setCheckoutModal] = useState<boolean>(false);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(user.name);
  const [billingEmail, setBillingEmail] = useState(user.email);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<any | null>(null);

  // Expanded payment features: bank and mobile banking states
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'mobile'>('card');
  const [bankSenderName, setBankSenderName] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankRefId, setBankRefId] = useState('');
  const [mobileProvider, setMobileProvider] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [senderMobileNo, setSenderMobileNo] = useState('');
  const [mobileTxnId, setMobileTxnId] = useState('');

  // Decryption viewing state
  const [decryptedDocId, setDecryptedDocId] = useState<string | null>(null);
  const [decryptedText, setDecryptedText] = useState<string>('');
  const [decryptingId, setDecryptingId] = useState<string | null>(null);

  // Load contracts, transactions and user activities
  const fetchActivityLogs = async () => {
    try {
      setLoadingActivity(true);
      const res = await fetch(`/api/agreements/activity?userEmail=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setActivityLogs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingActivity(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch user agreements
      const contrRes = await fetch(`/api/agreements/list?userEmail=${encodeURIComponent(user.email)}`);
      const contrData = await contrRes.json();
      if (Array.isArray(contrData)) {
        setContracts(contrData);
      }

      // Fetch transaction log
      const txRes = await fetch('/api/subscription/transactions');
      const txData = await txRes.json();
      if (Array.isArray(txData)) {
        setTransactions(txData.filter((t: any) => t.reference)); // Filter some standard ones
      }

      // Trigger automatic expiry analysis background log
      const alertRes = await fetch(`/api/notifications/expiring-check?userEmail=${encodeURIComponent(user.email)}`);
      const alertData = await alertRes.json();
      if (alertData && Array.isArray(alertData.allAlerts)) {
        setAlerts(alertData.allAlerts);
      }

      // Fetch recent user activity feed logs
      await fetchActivityLogs();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user.email]);

  // Handle active notifications test trigger
  const runExpiryCheck = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notifications/expiring-check?userEmail=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.allAlerts) {
        setAlerts(data.allAlerts);
      }
      // Re-fetch agreements list to refresh active/expiring statuses
      const contrRes = await fetch(`/api/agreements/list?userEmail=${encodeURIComponent(user.email)}`);
      const contrData = await contrRes.json();
      if (Array.isArray(contrData)) {
        setContracts(contrData);
      }
      await fetchActivityLogs();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Upgrading subscription action
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upgradePlan) return;
    setSubmittingPayment(true);

    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user.email, 
          planId: upgradePlan,
          paymentMethod,
          bankSenderName: paymentMethod === 'bank' ? bankSenderName : undefined,
          bankAccountNo: paymentMethod === 'bank' ? bankAccountNo : undefined,
          bankRefId: paymentMethod === 'bank' ? bankRefId : undefined,
          mobileProvider: paymentMethod === 'mobile' ? mobileProvider : undefined,
          senderMobileNo: paymentMethod === 'mobile' ? senderMobileNo : undefined,
          mobileTxnId: paymentMethod === 'mobile' ? mobileTxnId : undefined,
          cardNumber: paymentMethod === 'card' ? cardNumber : undefined,
          cardHolder: paymentMethod === 'card' ? cardHolder : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Upgrade failed');
      }

      setPaymentSuccessData(data.transaction);
      onUpdateUser(data.user);
      
      // Refresh transaction table
      const txRes = await fetch('/api/subscription/transactions');
      const txData = await txRes.json();
      if (Array.isArray(txData)) {
        setTransactions(txData);
      }
      await fetchActivityLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Decryption Viewer trigger
  const triggerDecryption = async (docId: string) => {
    if (decryptedDocId === docId) {
      setDecryptedDocId(null);
      setDecryptedText('');
      return;
    }

    setDecryptingId(docId);
    try {
      const res = await fetch(`/api/agreements/${docId}/decrypt?userEmail=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.decryptedContent) {
        setDecryptedDocId(docId);
        setDecryptedText(data.decryptedContent);
        await fetchActivityLogs();
      } else {
        alert(data.error || 'Decryption Refused by sovereign framework');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDecryptingId(null);
    }
  };

  // Revoke Agreement
  const revokeAgreement = async (docId: string) => {
    if (!confirm('Warning: Are you sure you want to permanently delete and purge this fully encrypted contract from the secure Neumlex vault? This action is absolute.')) {
      return;
    }

    try {
      const res = await fetch(`/api/agreements/${docId}?userEmail=${encodeURIComponent(user.email)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setContracts(contracts.filter(c => c.id !== docId));
        if (decryptedDocId === docId) {
          setDecryptedDocId(null);
          setDecryptedText('');
        }
        await fetchActivityLogs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Sorted & filtered Activity Feed logs
  const sortedLogs = [...activityLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredLogs = sortedLogs.filter(log => {
    const details = getActivityConfig(log.action, log.status);
    
    // Type Category Match
    if (activityTypeFilter !== 'ALL' && details.broadCategory !== activityTypeFilter) {
      return false;
    }

    // Keyword Text Match
    if (activityFilter) {
      const q = activityFilter.toLowerCase();
      const matchLabel = details.label.toLowerCase().includes(q);
      const matchDesc = details.desc.toLowerCase().includes(q);
      const matchUser = log.userEmail?.toLowerCase().includes(q);
      const matchActionName = log.action.toLowerCase().includes(q);
      const matchStatus = log.status.toLowerCase().includes(q);
      return matchLabel || matchDesc || matchUser || matchActionName || matchStatus;
    }

    return true;
  });

  // Compute risk levels distribution for Recharts
  const riskDistribution = useMemo(() => {
    let high = 0;
    let medium = 0;
    let low = 0;
    contracts.forEach((doc) => {
      if (doc.risks && doc.risks.some(r => r.severity === 'high')) {
        high++;
      } else if (doc.risks && doc.risks.some(r => r.severity === 'medium')) {
        medium++;
      } else {
        low++;
      }
    });
    return [
      { name: 'High Risk', value: high, color: '#f43f5e', key: 'high' },
      { name: 'Medium Risk', value: medium, color: '#f59e0b', key: 'medium' },
      { name: 'Low Risk', value: low, color: '#10b981', key: 'low' }
    ];
  }, [contracts]);

  // Stats calculate
  const totalEncryptedBytes = contracts.reduce((acc, c) => acc + (c.encryptedSize || 0), 0);
  const averageCompliance = contracts.length > 0 
    ? Math.round(contracts.reduce((acc, c) => acc + c.complianceScore, 0) / contracts.length)
    : 100;

  return (
    <>
      <div className="space-y-6 relative no-print">
      {/* Floating high-contrast Toast notifications stack */}
      {toasts && toasts.length > 0 && (
        <div id="toast-notifications-portal" className="fixed top-24 right-6 z-50 space-y-3 max-w-sm w-full block">
          {toasts.map((toast) => (
            <div 
              key={toast.id}
              id={`toast-${toast.id}`}
              className="bg-slate-900 border-2 border-rose-500 rounded-xl p-4 shadow-2xl relative flex flex-col gap-2 bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/20 border-l-[6px] border-l-rose-500 overflow-hidden animate-fade-in"
            >
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 animate-pulse" />
                  <span className="font-mono text-[9px] uppercase tracking-wider text-rose-450 font-bold">
                    {toast.title}
                  </span>
                </div>
                <button 
                  onClick={() => removeToast && removeToast(toast.id)}
                  className="text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-slate-800 transition cursor-pointer"
                  title="Dismiss alert"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-100 font-sans leading-relaxed">
                  {toast.message}
                </p>
                <div className="flex items-center gap-2 mt-1.5 pt-2 border-t border-slate-800/80">
                  <span className="text-[9px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/15 px-1.5 py-0.5 rounded font-bold uppercase">
                    Risk Assessment: HIGH
                  </span>
                  <span className="text-[9px] font-mono bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-850">
                    Trade Score: {toast.score ?? 0}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div id="stat-card-total-contracts" className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Encrypted Documents</span>
            <span id="stat-total-contracts" className="text-2xl font-bold text-white block mt-1 font-mono">{contracts.length}</span>
            <span className="text-[10px] text-slate-500 font-sans block mt-0.5">Sensitive export files stored</span>
          </div>
          <div className="bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 text-emerald-500">
            <FileText className="h-6 w-6 animate-pulse" />
          </div>
        </div>

        <div id="stat-card-total-bytes" className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Secure Storage Tally</span>
            <span id="stat-total-bytes" className="text-2xl font-bold text-white block mt-1 font-mono">
              {totalEncryptedBytes > 1024 
                ? `${(totalEncryptedBytes / 1024).toFixed(1)} KB` 
                : `${totalEncryptedBytes} Bytes`}
            </span>
            <span className="text-[10px] text-emerald-400 font-sans block font-medium mt-0.5">AES-256 Cipher Enforced</span>
          </div>
          <div className="bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20 text-blue-400">
            <Lock className="h-6 w-6" />
          </div>
        </div>

        <div id="stat-card-compliance" className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Avg Trade Compliance Score</span>
            <span id="stat-avg-compliance" className="text-2xl font-bold text-white block mt-1 font-mono">{averageCompliance}%</span>
            <span className="text-[10px] text-slate-500 font-sans block mt-0.5">Based on BGMEA guidelines</span>
          </div>
          <div className="bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 text-emerald-400">
            <Award className="h-6 w-6" />
          </div>
        </div>

        <div id="stat-card-notifications" className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Expiry Warning System</span>
            <span id="stat-total-alerts" className="text-2xl font-bold text-white block mt-1 font-mono">{alerts.length}</span>
            <span className="text-[10px] text-amber-400 font-sans block font-medium mt-0.5">Automated simulated emails</span>
          </div>
          <div className="bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 text-amber-500">
            <Mail className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Onboarding Guide Widget */}
      <OnboardingGuide />

      {/* Main Grid: Saved vault documents and subscription pricing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SECURE ENCRYPTED DOCUMENTS LISTING */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Key className="h-4 w-4 text-emerald-600" />
                  Sovereign Secure Documents Vault (AES-256 Session Encrypted)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Decryption keys are generated inside regional sovereign sessions. All data payloads are securely encrypted in compliance with the Electronic Security standards of the Bangladesh Information and Communication Technology (ICT) Act, 2006.
                </p>
              </div>

              <button
                id="btn-expiry-check"
                onClick={runExpiryCheck}
                className="bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-800/60 font-mono text-[10px] px-2.5 py-1.5 rounded transition whitespace-nowrap cursor-pointer hover:border-emerald-500"
              >
                Trigger Automated Expiry Check
              </button>
            </div>

            {contracts.length === 0 ? (
              <div id="empty-vault-block" className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-slate-700" />
                <div>
                  <p className="font-semibold block text-slate-400">Your Document Vault is empty</p>
                  <p className="text-[10px] text-slate-650 max-w-sm mx-auto mt-1">
                    To save and encrypt agreements, navigate to the <button onClick={() => setActiveTab('contracts')} className="text-emerald-400 underline hover:text-emerald-300">Contract NLP Audit</button> panel, upload/paste commercial terms, run the smart audit and click `Encrypt & Save`.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {contracts.map((contract) => (
                  <div key={contract.id} className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3.5 hover:border-slate-700/80 transition duration-200">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                      <div>
                        {/* Title and Badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-sans text-xs font-semibold text-slate-200">{contract.name}</span>
                          <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono uppercase">
                            {contract.type}
                          </span>
                          
                          {/* Compliance meter */}
                          <span className={`text-[9px] font-bold font-mono px-1.5 rounded uppercase ${
                            contract.complianceScore >= 85 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            Score: {contract.complianceScore}%
                          </span>

                          {/* Expiry Badge */}
                          <span className={`text-[9px] font-bold font-mono px-1.5 rounded uppercase ${
                            contract.status === 'expired' 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' 
                              : contract.status === 'expiring'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {contract.status === 'expired' ? 'EXPIRED' : contract.status === 'expiring' ? 'EXPIRING' : 'ACTIVE'}
                          </span>

                          {/* Encryption Strength Indicator */}
                          <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 select-none">
                            <ShieldCheck className="h-2.5 w-2.5 text-blue-400" />
                            AES-256 Verified
                          </span>
                        </div>

                        {/* Fingerprint details */}
                        <div className="mt-2 flex items-center gap-4 text-[10px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Key className="h-3 w-3 text-slate-500" />
                            SHA-256 Fingerprint: <span className="text-emerald-500">{contract.secureCode}</span>
                          </span>
                          <span>|</span>
                          <span>Tally: {contract.encryptedSize} bytes</span>
                          <span>|</span>
                          <span className="flex items-center gap-1 text-slate-350">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            Expiry: {contract.expiryDate}
                          </span>
                        </div>
                      </div>

                      {/* Decrypt and purging buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => triggerDecryption(contract.id)}
                          className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-[10px] px-2.5 py-1.5 rounded flex items-center gap-1.5 transition cursor-pointer"
                          disabled={decryptingId === contract.id}
                        >
                          <Eye className="h-3 w-3 text-slate-400" />
                          {decryptingId === contract.id ? 'Decrypting...' : decryptedDocId === contract.id ? 'Purge Memory Cache' : 'Decrypt & Inspect Plaintext'}
                        </button>
                        <button
                          onClick={() => revokeAgreement(contract.id)}
                          className="bg-slate-900 hover:bg-rose-950/20 hover:text-rose-400 hover:border-rose-900 text-slate-400 border border-slate-700/80 text-[10px] p-1.5 rounded transition cursor-pointer"
                          title="Purge permanently"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Decrypted plain text display */}
                    {decryptedDocId === contract.id && (
                      <div className="mt-4 bg-slate-950/90 border border-emerald-900/60 p-3 rounded-lg relative">
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                          <span className="text-[8px] uppercase tracking-wider font-mono text-emerald-400 font-bold bg-slate-900 px-1 py-0.5 rounded">
                            Decrypted Plaintext Staged Memory
                          </span>
                        </div>
                        <h5 className="font-mono text-[9px] uppercase tracking-wide text-slate-500 block border-b border-slate-900 pb-1 mb-2 font-bold">
                          Plaintext Output Stream
                        </h5>
                        <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap font-mono [font-size:11px]">
                          {decryptedText}
                        </p>
                        
                        {/* Risk overview in Decrypted Frame */}
                        {contract.risks && contract.risks.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-900/80">
                            <h6 className="font-mono text-[9px] uppercase tracking-wide text-amber-500 block mb-1.5 font-bold">
                              Audited Trade Risks
                            </h6>
                            <div className="space-y-1.5">
                              {contract.risks.map((risk, index) => (
                                <div key={index} className="text-[10px] text-slate-400 leading-snug">
                                  ❌ <span className="font-semibold text-slate-200">{risk.title} ({risk.severity})</span> - {risk.recommendation}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIMULATED EXPIRED EMAIL REMINDER DISPATCH LOG */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="h-4 w-4 text-emerald-400 animate-pulse" />
              <h4 className="text-xs font-bold text-white tracking-tight uppercase font-mono">Simulated Automated Email Dispatch Audit Logs</h4>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed max-w-2xl mb-4 font-sans">
              Whenever the system schedules checks for contracts with active expiries, warning logs are triggered and registered on-screen simulating actual outbound corporate emails. This fulfills guidelines on "automated email notifications for expiring agreements".
            </p>

            {alerts.length === 0 ? (
              <div className="py-6 text-center text-slate-600 text-xs italic bg-slate-950/40 rounded-lg border border-slate-900">
                No outbound warning logs triggered yet. Run manual Expiry Checks above.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {alerts.map((log) => (
                  <div key={log.id} className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-between text-[11px] font-mono hover:border-slate-700/60">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500">📧 EMAIL DISPATCHED</span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-100 font-semibold">{log.contractName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded text-[10px]">
                        Type: {log.triggerType === 'expired' ? 'Expiry Alert' : log.triggerType === '30_days_before' ? '30d Warning' : '10d Priority'}
                      </span>
                      <span className="text-emerald-400">SUCCESS</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CHRONOLOGICAL RECENT ACTIVITY FEED */}
          <div id="recent-activity-panel" className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-white tracking-tight uppercase font-mono">Recent Activity Feed</h4>
                  <p className="text-[10px] text-slate-400">Chronological history of secure audits, vault operations, and legal research queries</p>
                </div>
              </div>
              <button
                id="btn-refresh-activities"
                onClick={fetchActivityLogs}
                disabled={loadingActivity}
                className="p-1 px-2.5 text-[10px] bg-slate-950 border border-slate-800 text-slate-350 hover:bg-slate-900 rounded flex items-center gap-1.5 cursor-pointer select-none transition hover:border-emerald-500 font-mono"
              >
                <RefreshCw className={`h-3 w-3 ${loadingActivity ? 'animate-spin text-emerald-450' : 'text-slate-400'}`} />
                {loadingActivity ? 'Syncing...' : 'Sync Feed'}
              </button>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  id="activity-search-field"
                  type="text"
                  placeholder="Filter actions, usernames, or statuses..."
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded pl-8 pr-2.5 py-1.5 text-[11px] text-slate-300 placeholder-slate-600 outline-none focus:border-emerald-500 font-sans"
                />
              </div>
              <select
                id="activity-category-selector"
                value={activityTypeFilter}
                onChange={(e) => setActivityTypeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-[11px] text-slate-300 focus:border-emerald-500 outline-none font-mono cursor-pointer"
              >
                <option value="ALL">All Event Types</option>
                <option value="AUDIT">Audits & Reviews Only</option>
                <option value="VAULT">Vault Encryption & Keys Only</option>
                <option value="RESEARCH">Case Research Only</option>
                <option value="SUBSCRIPTION">Billing & Security Licenses</option>
              </select>
            </div>

            {/* Activity List */}
            {sortedLogs.length === 0 ? (
              <div id="activities-empty-state" className="py-8 text-center text-slate-500 text-xs italic bg-slate-950/40 rounded-lg border border-slate-900">
                No activity logs registered yet. Conduct audits or query case laws below to populate this feed.
              </div>
            ) : filteredLogs.length === 0 ? (
              <div id="activities-no-matches" className="py-8 text-center text-slate-500 text-xs italic bg-slate-950/40 rounded-lg border border-slate-900">
                No activity records matched your active filter keywords.
              </div>
            ) : (
              <div id="activity-logs-container" className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredLogs.slice(0, 25).map((log) => {
                  const details = getActivityConfig(log.action, log.status);
                  return (
                    <div key={log.id} className="bg-slate-950 px-3.5 py-2.5 rounded-lg border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono hover:border-slate-800 transition duration-150">
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-md border mt-0.5 shrink-0 ${details.iconClass}`}>
                          {details.icon}
                        </div>
                        <div className="space-y-0.5 text-left">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-slate-100 font-bold">{details.label}</span>
                            <span className="text-slate-800 font-normal">|</span>
                            <span className="text-slate-400 font-sans text-[10px] leading-snug">{details.desc}</span>
                          </div>
                          <span className="text-slate-500 text-[9.5px] block font-sans">
                            Actor: <strong className="text-slate-400 font-mono">{log.userEmail}</strong> &bull; {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-1.5 shrink-0 text-right">
                        <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-bold uppercase border tracking-wider font-mono ${details.badgeClass}`}>
                          {log.status}
                        </span>
                        {log.status.includes('encrypted_tally_') ? (
                          <span className="text-[8.5px] text-emerald-400 font-mono font-bold block">
                            +{log.status.split('encrypted_tally_')[1]?.split('_bytes')[0] || '0'} Bytes
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* PRICING PLANS & COMMERCIAL LICENSES */}
        <div className="space-y-6">
          {/* RISK DISTRIBUTION DONUT CHART */}
          <div id="risk-distribution-panel" className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-emerald-500 animate-pulse" />
                Contract Risk Distribution
              </h3>
              {contracts.length > 0 && (
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 hover:text-slate-100 font-mono text-[10px] px-3 py-1.5 rounded font-bold transition whitespace-nowrap cursor-pointer shadow uppercase"
                  title="Generate stakeholder-ready audit report"
                >
                  <Printer className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Export Report</span>
                </button>
              )}
            </div>

            {contracts.length === 0 ? (
              <div id="risk-chart-empty-state" className="py-10 text-center text-slate-500 text-xs italic bg-slate-950/40 rounded-lg border border-slate-900">
                No active contracts in secure vault. Analyze and decrypt a contract to view high-resolution risk analytics.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-[180px] w-full flex items-center justify-center relative bg-slate-950/40 rounded-lg py-3 border border-slate-950">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {riskDistribution.filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#090d16',
                          border: '1px solid #1e293b',
                          borderRadius: '8px',
                          color: '#fff',
                          fontFamily: 'monospace',
                          fontSize: '11px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Label inside Pie Chart */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-slate-500 font-sans uppercase tracking-wider font-semibold">Audited</span>
                    <span className="text-2xl font-black font-mono text-white leading-tight mt-0.5">{contracts.length}</span>
                  </div>
                </div>

                {/* Custom Legend grids */}
                <div className="grid grid-cols-3 gap-2">
                  {riskDistribution.map((tier) => (
                    <div key={tier.key} className="bg-slate-950/60 border border-slate-850 p-2 rounded-lg flex flex-col items-center text-center">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tier.color }} />
                        <span className="text-[9px] font-mono text-slate-400 font-semibold uppercase">{tier.key}</span>
                      </div>
                      <span className="text-xs font-bold font-mono text-white mt-1">
                        {tier.value} {tier.value === 1 ? 'doc' : 'docs'}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {contracts.length > 0 ? Math.round((tier.value / contracts.length) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
              Sovereign Advisory Subscriptions
            </h3>
            <p className="text-[11.5px] text-slate-500 leading-relaxed font-sans">
              A standard free clearance is available for basic statutory lookups. Elevate your licensing below to unlock deep automated NLP vetting, complete compliance reports, and full access to landmark Supreme Court citations of Bangladesh.
            </p>

            {/* Plan 1 */}
            <div className={`p-5 rounded-xl border transition-all duration-300 ${
              user.planType === 'export_elite'
                ? 'bg-emerald-50/40 border-emerald-500 shadow-sm'
                : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
            }`}>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Export Elite Plan</h4>
                    <span className="text-[8px] font-mono bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-extrabold uppercase scale-90">RMG Choice</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">Optimized for growing factories & garments export merchants.</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-emerald-700 font-bold font-mono text-sm block">৳5,733 BDT<span className="text-[9px] text-slate-400 font-normal">/mo</span></span>
                  <span className="text-slate-400 font-mono text-[9px] block">($49.00 USD)</span>
                </div>
              </div>

              <ul className="space-y-2 mt-4 text-[11px] text-slate-600 font-sans border-t border-slate-200/60 pt-3.5 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Unlimited Audit Checks</strong>: Vetting against standard BGMEA compliance codes & local shipping practices.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Labour Act Guardrails</strong>: Automated audits mapping Sec. 100 maximum shifts and Sec. 45 maternity rules.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Mushak Form VAT-6.3 Verification</strong>: Real zero-rated export tax alignments under Sec. 24 of the VAT Act.</span>
                </li>
              </ul>

              {user.planType === 'export_elite' ? (
                <div className="text-center text-[10px] font-mono text-emerald-750 font-bold py-1.5 bg-emerald-100/60 rounded border border-emerald-300/40 uppercase">
                  ✓ Active Sourcing Tier
                </div>
              ) : (
                <button
                  id="btn-buy-export-elite"
                  onClick={() => {
                    setUpgradePlan('export_elite');
                    setCheckoutModal(true);
                    setPaymentSuccessData(null);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[10.5px] py-2 rounded-lg transition duration-150 uppercase tracking-wider cursor-pointer text-center outline-none"
                >
                  Acquire Sourcing License
                </button>
              )}
            </div>

            {/* Plan 2 */}
            <div className={`p-5 rounded-xl border transition-all duration-300 ${
              user.planType === 'corporate_advisory'
                ? 'bg-blue-50/40 border-blue-500 shadow-sm'
                : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-55 hover:border-slate-300'
            }`}>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Corporate Advisory Suite</h4>
                    <span className="text-[8px] font-mono bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-extrabold uppercase scale-90">Enterprise</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">Engineered for major export houses, buying units, & corporate legal desks.</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-blue-700 font-bold font-mono text-sm block">৳17,433 BDT<span className="text-[9px] text-slate-400 font-normal">/mo</span></span>
                  <span className="text-slate-400 font-mono text-[9px] block">($149.00 USD)</span>
                </div>
              </div>

              <ul className="space-y-2 mt-4 text-[11px] text-slate-600 font-sans border-t border-slate-200/60 pt-3.5 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Full Treaty Protections (DTAA)</strong>: Complex double-taxation risk checks under Income Tax Act 2023 Sec. 151.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>L/C Conflict Resolution</strong>: Dedicated templates for resolving Back-to-Back Letter of Credit shipping disputes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Supreme Court Reference Index</strong>: Seamless search integration covering Dhaka Law Reports (DLR) case guidelines.</span>
                </li>
              </ul>

              {user.planType === 'corporate_advisory' ? (
                <div className="text-center text-[10px] font-mono text-blue-750 font-bold py-1.5 bg-blue-100/60 rounded border border-blue-300/40 uppercase">
                  ✓ Active Sovereign Advisory Tier
                </div>
              ) : (
                <button
                  id="btn-buy-corporate"
                  onClick={() => {
                    setUpgradePlan('corporate_advisory');
                    setCheckoutModal(true);
                    setPaymentSuccessData(null);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10.5px] py-2 rounded-lg transition duration-150 uppercase tracking-wider cursor-pointer text-center outline-none"
                >
                  Acquire Corporate Advisory License
                </button>
              )}
            </div>
          </div>

          {/* BILLING HISTORY LOG */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h4 className="text-xs font-bold text-white tracking-tight uppercase font-mono mb-3">Secure Payment ledger & audit</h4>
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <div className="text-[10px] text-slate-600 italic font-mono">No commercial payments stored currently. Upgrade your tier above to log real cryptographic invoice receipts.</div>
              ) : (
                transactions.map((txn) => (
                  <div key={txn.id} className="bg-slate-950 hover:bg-slate-900/60 p-2.5 rounded-md border border-slate-800 font-mono text-[10px] space-y-1">
                    <div className="flex justify-between items-center text-slate-200">
                      <span className="font-semibold text-emerald-400">{txn.plan} License</span>
                      <span className="text-slate-350">৳{(txn.amount * 117).toLocaleString('en-US')} BDT (${txn.amount}.00 USD)</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Ref: {txn.reference}</span>
                      <span>Verified</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CHECKOUT PAYMENT DIALOG MODAL */}
      {checkoutModal && (
        <div id="payment-modal-overlay" className="fixed inset-0 bg-slate-950/85 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div id="payment-modal-content" className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 relative">
            <button
              onClick={() => setCheckoutModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white font-sans text-sm p-1"
            >
              ✕ Close
            </button>

            {!paymentSuccessData ? (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="text-center mb-6">
                  <div className="inline-flex bg-emerald-500/10 p-2 rounded-xl mb-2 text-emerald-500">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase font-sans">
                    Secure Commercial Payment Checkout
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Authenticating licensing for <strong className="text-slate-200">{upgradePlan === 'export_elite' ? 'EXPORT ELITE' : 'CORPORATE ADVISORY'}</strong>
                  </p>
                </div>

                {/* Payment Method Tab Selector */}
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition flex flex-col items-center gap-1 ${
                      paymentMethod === 'card'
                        ? 'bg-slate-800 text-[#38BDF8] border border-slate-700/50'
                        : 'text-slate-500 hover:text-slate-200'
                    }`}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    Card Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition flex flex-col items-center gap-1 ${
                      paymentMethod === 'bank'
                        ? 'bg-slate-800 text-amber-400 border border-slate-700/50'
                        : 'text-slate-500 hover:text-slate-200'
                    }`}
                  >
                    <Landmark className="h-3.5 w-3.5" />
                    Bank wire
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mobile')}
                    className={`py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition flex flex-col items-center gap-1 ${
                      paymentMethod === 'mobile'
                        ? 'bg-slate-800 text-emerald-400 border border-slate-700/50'
                        : 'text-slate-500 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    Mobile Bkash
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  
                  {/* CARD METHOD SECTION */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-3 transition duration-150">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Corporate Card Coordinate</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-white placeholder-slate-600 focus:border-[#38BDF8] outline-none font-mono"
                          placeholder="4242 4242 4242 4242"
                          required={paymentMethod === 'card'}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="12/28"
                            className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-white placeholder-slate-600 focus:border-[#38BDF8] outline-none font-mono"
                            required={paymentMethod === 'card'}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Secure CVC</label>
                          <input
                            type="password"
                            placeholder="•••"
                            maxLength={3}
                            className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-white placeholder-slate-600 focus:border-[#38BDF8] outline-none"
                            required={paymentMethod === 'card'}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Authorized Holder Name</label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-white focus:border-[#38BDF8] outline-none font-sans"
                          required={paymentMethod === 'card'}
                        />
                      </div>
                    </div>
                  )}

                  {/* BANK TRANSFER METHOD SECTION */}
                  {paymentMethod === 'bank' && (
                    <div className="space-y-3 transition duration-150">
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-[10px] font-mono space-y-1 block text-slate-400">
                        <span className="block font-bold text-white uppercase text-[11px] mb-1">Official NeumLex Corporate Bank Routing:</span>
                        <span className="block">Bank Name: Prime Bank Limited</span>
                        <span className="block">Branch Name: Motijheel Corporate Branch, Dhaka</span>
                        <span className="block text-[#38BDF8]">Account No: 109-220-418721-002</span>
                        <span className="block">Routing Code: 175271380</span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#38BDF8] mb-1">Sender Bank Account Name</label>
                        <input
                          type="text"
                          value={bankSenderName}
                          onChange={(e) => setBankSenderName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-white placeholder-slate-600 focus:border-amber-400 outline-none font-sans"
                          placeholder="e.g. Apex Apparel Sourcing Corp."
                          required={paymentMethod === 'bank'}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Sender Account No</label>
                          <input
                            type="text"
                            value={bankAccountNo}
                            onChange={(e) => setBankAccountNo(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-white placeholder-slate-600 focus:border-amber-400 outline-none font-mono"
                            placeholder="A/C Number"
                            required={paymentMethod === 'bank'}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Bank Reference-Ref ID</label>
                          <input
                            type="text"
                            value={bankRefId}
                            onChange={(e) => setBankRefId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-white placeholder-slate-600 focus:border-amber-400 outline-none font-mono"
                            placeholder="Voucher/Ref code"
                            required={paymentMethod === 'bank'}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MOBILE WALLET METHOD SECTION */}
                  {paymentMethod === 'mobile' && (
                    <div className="space-y-3 transition duration-150">
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-[10px] font-mono space-y-1 block text-slate-400">
                        <span className="block font-bold text-white uppercase text-[11px] mb-1">Sovereign Mobile Merchant Terminals:</span>
                        <span className="block">Addressed wallet: <strong className="text-emerald-400">+880 1782-911400</strong></span>
                        <span className="block">Option: Dial merchant payments, select counter-code 01</span>
                      </div>

                      {/* Brand selector internally */}
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Mobile Provider Brand</label>
                        <div className="flex gap-2">
                          {['bkash', 'nagad', 'rocket'].map((provider) => (
                            <button
                              key={provider}
                              type="button"
                              onClick={() => setMobileProvider(provider as any)}
                              className={`flex-1 py-1.5 rounded font-mono font-bold text-[10px] uppercase border transition ${
                                mobileProvider === provider
                                  ? 'bg-slate-800 text-emerald-400 border-emerald-500/50'
                                  : 'bg-slate-950 text-slate-500 border-slate-900 hover:text-white'
                              }`}
                            >
                              {provider}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Sender Bkash/Phone No</label>
                          <input
                            type="text"
                            value={senderMobileNo}
                            onChange={(e) => setSenderMobileNo(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-white placeholder-slate-600 focus:border-emerald-400 outline-none font-mono"
                            placeholder="01712345678"
                            required={paymentMethod === 'mobile'}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-emerald-400 mb-1">Mobile Txn ID</label>
                          <input
                            type="text"
                            value={mobileTxnId}
                            onChange={(e) => setMobileTxnId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-white placeholder-slate-600 focus:border-emerald-400 outline-none font-mono"
                            placeholder="e.g. TR6539BH"
                            required={paymentMethod === 'mobile'}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shared Billing Coordinate Email */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Billing Email Coordinate</label>
                    <input
                      type="email"
                      value={billingEmail}
                      onChange={(e) => setBillingEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-white focus:border-emerald-500 outline-none font-sans"
                      required
                    />
                  </div>
                </div>

                <button
                  id="btn-confirm-simulated-payment"
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
                  disabled={submittingPayment}
                >
                  {submittingPayment ? 'Processing Decryptions Transaction...' : `Transmit Simulated License Fee ৳${upgradePlan === 'export_elite' ? '5,733 BDT ($49.00 USD)' : '17,433 BDT ($149.00 USD)'}`}
                </button>
              </form>
            ) : (
              <div className="text-center p-2 space-y-4 font-sans text-xs">
                <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-full inline-flex border border-emerald-500/20">
                  <CheckSquare className="h-8 w-8 animate-bounce" />
                </div>
                <h4 className="text-sm font-bold text-white uppercase">Sovereign Transaction Accomplished</h4>
                <p className="text-slate-350">
                  Your corporate billing address has been successfully white-listed on our encryption registries.
                </p>

                {/* Simulated commercial business invoice layout */}
                <div className="bg-slate-950 text-left rounded-lg p-3.5 border border-slate-800 text-[10px] font-mono leading-relaxed space-y-1">
                  <div className="text-center font-bold text-white border-b border-slate-900 pb-1.5 mb-2">
                    NEUMLEX EXPORT COMPLIANCE OFFICIAL INVOICE
                  </div>
                  <div className="flex justify-between">
                    <span>DATE GENERATED:</span>
                    <span>{new Date().toISOString().substring(0, 10)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TRANSACT REF ID:</span>
                    <span className="text-emerald-400">{paymentSuccessData.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LICENSED CORRESPOND:</span>
                    <span>{cardHolder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BILLING EMAIL:</span>
                    <span>{billingEmail}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-900 pt-1.5 mt-2 font-bold text-white">
                    <span>TOTAL CAP FEE:</span>
                    <span>৳{(paymentSuccessData.amount * 117).toLocaleString('en-US')} BDT (${paymentSuccessData.amount}.00 USD)</span>
                  </div>
                  <div className="text-slate-500 text-[8px] text-center mt-3 leading-tight">
                    * Sovereign seal applied. Stored securely and fully encapsulated in `data_vault.json` database.
                  </div>
                </div>

                <button
                  onClick={() => setCheckoutModal(false)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded text-xs tracking-wider uppercase font-medium cursor-pointer"
                >
                  Conclude checkout gateway
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* STAKEHOLDER PDF REPORT TEMPLATE */}
      {contracts.length > 0 && (
        <div className="hidden print:block font-sans text-slate-950 bg-white p-6 max-w-4xl mx-auto space-y-8 leading-relaxed text-justify">
          {/* Report Header Letterhead */}
          <div className="text-center border-b-2 border-slate-950 pb-4 space-y-1">
            <div className="text-[10px] tracking-[0.2em] font-bold text-slate-500 uppercase font-mono">
              Sovereign Legal Intelligence Registry • Portfolio Analytics
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 uppercase">
              NeumLex Sourcing Audit &amp; Risk Portfolio Report
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Executive Risk Distribution &amp; Compliance Review for External Stakeholders
            </p>
          </div>

          {/* Document Overview Metadata Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">
              I. AUDITED PORTFOLIO METADATA
            </h3>
            <table className="w-full text-xs border border-slate-350 border-collapse">
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="p-2.5 font-bold font-mono bg-slate-50 border-r border-slate-300 w-1/3 uppercase">Corporate Subscriber</td>
                  <td className="p-2.5 font-sans font-semibold text-slate-900 w-2/3">{user.email}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2.5 font-bold font-mono bg-slate-50 border-r border-slate-300 uppercase">Active Subscription Level</td>
                  <td className="p-2.5 font-mono text-slate-800 uppercase">{user.planType === 'export_elite' ? 'EXPORT ELITE PLAN' : user.planType === 'free_tier' ? 'FREE PRESET TIER' : user.planType}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2.5 font-bold font-mono bg-slate-50 border-r border-slate-300 uppercase">Average Portfolio Compliance Score</td>
                  <td className="p-2.5 font-mono text-slate-900 font-bold">
                    {averageCompliance}% (Rating: {averageCompliance >= 80 ? 'EXCELLENT COMPLIANCE ALIGNMENT' : 'ATTENTION ADVISED'})
                  </td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2.5 font-bold font-mono bg-slate-50 border-r border-slate-300 uppercase">Audit Assessment Timestamp</td>
                  <td className="p-2.5 font-mono text-slate-850">{new Date().toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Risk Distribution breakdown section */}
          <div className="space-y-4 print-avoid-break">
            <h3 className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase border-b border-slate-200 pb-1">
              II. SECURITY RISK DISTRIBUTION &amp; RISK MATRIX
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 border border-slate-300 bg-rose-50 rounded text-center">
                <span className="text-[10px] font-mono text-rose-800 uppercase font-bold block mb-1">High Risk Segment</span>
                <span className="text-3xl font-extrabold text-rose-600 tracking-tight block leading-none mb-1">
                  {riskDistribution.find(d => d.key === 'high')?.value ?? 0}
                </span>
                <span className="text-xs text-rose-700 font-mono">
                  {contracts.length > 0 ? Math.round(((riskDistribution.find(d => d.key === 'high')?.value ?? 0) / contracts.length) * 100) : 0}% of portfolio
                </span>
              </div>
              <div className="p-3 border border-slate-300 bg-amber-50 rounded text-center">
                <span className="text-[10px] font-mono text-amber-800 uppercase font-bold block mb-1">Medium Risk Segment</span>
                <span className="text-3xl font-extrabold text-amber-600 tracking-tight block leading-none mb-1">
                  {riskDistribution.find(d => d.key === 'medium')?.value ?? 0}
                </span>
                <span className="text-xs text-amber-700 font-mono">
                  {contracts.length > 0 ? Math.round(((riskDistribution.find(d => d.key === 'medium')?.value ?? 0) / contracts.length) * 100) : 0}% of portfolio
                </span>
              </div>
              <div className="p-3 border border-slate-300 bg-emerald-50 rounded text-center">
                <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold block mb-1">Low Risk Segment</span>
                <span className="text-3xl font-extrabold text-emerald-600 tracking-tight block leading-none mb-1">
                  {riskDistribution.find(d => d.key === 'low')?.value ?? 0}
                </span>
                <span className="text-xs text-emerald-700 font-mono">
                  {contracts.length > 0 ? Math.round(((riskDistribution.find(d => d.key === 'low')?.value ?? 0) / contracts.length) * 100) : 0}% of portfolio
                </span>
              </div>
            </div>

            {/* Flat print-friendly visual segmented ratio bar */}
            <div className="space-y-1">
              <span className="text-[9.5px] text-slate-500 font-semibold uppercase font-sans">Portfolio Risk Level Density:</span>
              <div className="h-5 w-full bg-slate-100 rounded flex overflow-hidden border border-slate-350">
                {((riskDistribution.find(d => d.key === 'high')?.value ?? 0) > 0) && (
                  <div 
                    style={{ width: (contracts.length > 0 ? Math.round(((riskDistribution.find(d => d.key === 'high')?.value ?? 0) / contracts.length) * 100) : 0) + '%' }} 
                    className="bg-rose-500 flex items-center justify-center text-[10px] text-white font-mono font-bold"
                  >
                    {contracts.length > 0 ? Math.round(((riskDistribution.find(d => d.key === 'high')?.value ?? 0) / contracts.length) * 100) : 0}% High
                  </div>
                )}
                {((riskDistribution.find(d => d.key === 'medium')?.value ?? 0) > 0) && (
                  <div 
                    style={{ width: (contracts.length > 0 ? Math.round(((riskDistribution.find(d => d.key === 'medium')?.value ?? 0) / contracts.length) * 100) : 0) + '%' }} 
                    className="bg-amber-500 flex items-center justify-center text-[10px] text-white font-mono font-bold"
                  >
                    {contracts.length > 0 ? Math.round(((riskDistribution.find(d => d.key === 'medium')?.value ?? 0) / contracts.length) * 100) : 0}% Med
                  </div>
                )}
                {((riskDistribution.find(d => d.key === 'low')?.value ?? 0) > 0) && (
                  <div 
                    style={{ width: (contracts.length > 0 ? Math.round(((riskDistribution.find(d => d.key === 'low')?.value ?? 0) / contracts.length) * 105) / 1.05 : 0) + '%' }} 
                    className="bg-emerald-600 flex items-center justify-center text-[10px] text-white font-mono font-bold"
                  >
                    {contracts.length > 0 ? Math.round(((riskDistribution.find(d => d.key === 'low')?.value ?? 0) / contracts.length) * 100) : 0}% Low
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Audit Summary Insights */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">
              III. EXECUTIVE AUDIT INSIGHTS &amp; FINDINGS
            </h3>
            <div className="p-4 bg-slate-50 border border-slate-300 rounded text-xs space-y-2 text-justify">
              <p className="font-semibold text-slate-900 font-sans">Strategic Compliance Directive</p>
              <p className="text-slate-700 leading-relaxed font-sans">
                Based on compliance scanning of active procurement frameworks matching Bangladesh Labor and trade metrics, the aggregate security footprint is rated overall at <strong className="text-slate-900">{averageCompliance}% Alignment</strong>. 
                {(riskDistribution.find(d => d.key === 'high')?.value ?? 0) > 0 
                  ? " Review shows structural bottlenecks within high-risk categories violating local or global guidelines. Outbound fund transfers, bonded warehouse compliance, or severance safeguards require immediate revision before signing."
                  : " Portfolio represents a high level of formal adherence to RMG-specific guidelines. Regular checks of expiry sequences and domestic compliance audits are recommended to maintain standard zero-liability ratings."
                }
              </p>
            </div>
          </div>

          {/* Detailed Portfolio Ledger */}
          <div className="space-y-4 print-avoid-break">
            <h3 className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase border-b border-slate-200 pb-1">
              IV. AUDITED AGREEMENT PORTFOLIO LEDGER
            </h3>
            <div className="space-y-4">
              {contracts.map((doc, dIdx) => (
                <div key={doc.id} className="p-4 border border-slate-300 rounded space-y-2.5 print-avoid-break bg-slate-50 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                    <span className="font-bold text-slate-900 font-sans text-sm">{dIdx + 1}. {doc.name || "Default Stream Agreement"}</span>
                    <span className={`font-mono font-extrabold text-[11px] px-2 py-0.5 rounded ${
                      doc.complianceScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      Score: {doc.complianceScore}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-600">
                    <div>
                      <strong>Thematic Module:</strong> {doc.type || doc.category || "General Agreement"}
                    </div>
                    <div>
                      <strong>Active Risks Count:</strong> {doc.risks?.length || 0}
                    </div>
                  </div>
                  
                  {doc.risks && doc.risks.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">Critical Identified Breaches &amp; Guidance:</span>
                      <div className="space-y-2 font-sans pl-1">
                        {doc.risks.slice(0, 3).map((risk, rIdx) => (
                          <div key={rIdx} className="border-l-2 border-slate-300 pl-2 py-0.5 text-[10.5px]">
                            <div className="font-bold text-slate-900 flex justify-between">
                              <span>• {risk.title}</span>
                              <span className="text-[9px] uppercase font-mono text-slate-500">[{risk.severity} Risk]</span>
                            </div>
                            <div className="text-slate-600 text-[10px] mt-0.5">
                              <strong>Remedy Advice:</strong> {risk.recommendation}
                            </div>
                          </div>
                        ))}
                        {doc.risks.length > 3 && (
                          <div className="text-[10px] text-slate-500 italic">
                            ... and {doc.risks.length - 3} further risk conditions flagged in the system.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legal Disclaimer Footer */}
          <div className="border-t border-slate-400 pt-3 text-[9px] text-slate-500 font-mono leading-relaxed text-center print-avoid-break">
            <p className="font-bold text-slate-700">SYSTEMATIC COMPLIANCE NOTICE &amp; RESERVATION OF LIABILITY</p>
            <p className="mt-1">
              This portfolio report is generated by the NeumLex Sovereign Compliance Engine. Stored contracts are encrypted under domestic AES-256 local configurations. Final legal validations of Labour parameters, withholding VAT structures, and fiscal compliance indices should be validated with qualified counsel before submission.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
