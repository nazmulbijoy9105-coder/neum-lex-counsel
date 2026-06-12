import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, ShieldAlert, Award, FileText, CheckCircle, 
  Sparkles, Calendar, Eye, Trash2, Mail, 
  Lock, Key, CheckSquare,
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
    let iconClass = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    let label = action;
    let desc = "System action completed";
    let badgeClass = "bg-slate-800 text-slate-400 border border-slate-700";
    let broadCategory = "OTHER";

    const cleanAction = action.toUpperCase();
    if (cleanAction.includes("CONTRACT_NLP_REVIEW")) {
      icon = <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />;
      iconClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      label = "Contract Audited";
      desc = "AI compliance check successfully completed";
      badgeClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      broadCategory = "AUDIT";
    } else if (cleanAction.includes("LEGAL_QUERY_NLP")) {
      icon = <Search className="h-3.5 w-3.5 text-cyan-400" />;
      iconClass = "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      label = "Legal Research";
      desc = "Case law analysis completed";
      badgeClass = "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      broadCategory = "RESEARCH";
    } else if (cleanAction === "CONTRACT_SAVED_SECURELY") {
      icon = <Lock className="h-3.5 w-3.5 text-emerald-400" />;
      iconClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      label = "Document Secured";
      desc = "Encrypted and saved to vault";
      badgeClass = "bg-teal-500/10 text-teal-400 border border-teal-500/20";
      broadCategory = "VAULT";
    } else if (cleanAction === "SENSITIVE_DOC_DECRYPTED") {
      icon = <Eye className="h-3.5 w-3.5 text-amber-400" />;
      iconClass = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      label = "Document Viewed";
      desc = "Decrypted temporarily for viewing";
      badgeClass = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      broadCategory = "VAULT";
    } else if (cleanAction === "CONTRACT_DELETED") {
      icon = <Trash2 className="h-3.5 w-3.5 text-rose-400" />;
      iconClass = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      label = "Document Deleted";
      desc = "Permanently removed from vault";
      badgeClass = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      broadCategory = "VAULT";
    } else if (cleanAction.includes("NOTIFICATION") || cleanAction.includes("ALERTS")) {
      icon = <Mail className="h-3.5 w-3.5 text-amber-400" />;
      iconClass = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      label = "Expiry Alert Sent";
      desc = "Email notification triggered";
      badgeClass = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      broadCategory = "AUDIT";
    } else if (cleanAction === "SUBSCRIPTION_UPGRADE") {
      icon = <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />;
      iconClass = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      label = "Subscription Upgraded";
      desc = "Premium plan activated successfully";
      badgeClass = "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20";
      broadCategory = "SUBSCRIPTION";
    } else if (cleanAction.includes("USER") || cleanAction.includes("REGISTER")) {
      icon = <Award className="h-3.5 w-3.5 text-slate-400" />;
      iconClass = "bg-slate-500/10 text-slate-400 border border-slate-500/20";
      label = "Account Access";
      desc = "User login or registration";
      badgeClass = "bg-slate-800 text-slate-400 border border-slate-700";
      broadCategory = "SUBSCRIPTION";
    }

    return { icon, iconClass, label, desc, badgeClass, broadCategory };
  };
  
  const [checkoutModal, setCheckoutModal] = useState<boolean>(false);
  const [cardNumber, setCardNumber] = useState('4242 0000 0000 4242');
  const [cardHolder, setCardHolder] = useState(user.name);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<any | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'mobile'>('card');
  const [bankSenderName, setBankSenderName] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankRefId, setBankRefId] = useState('');
  const [mobileProvider, setMobileProvider] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [senderMobileNo, setSenderMobileNo] = useState('');
  const [mobileTxnId, setMobileTxnId] = useState('');

  const [decryptedDocId, setDecryptedDocId] = useState<string | null>(null);
  const [decryptedText, setDecryptedText] = useState<string>('');
  const [decryptingId, setDecryptingId] = useState<string | null>(null);

  const fetchActivityLogs = async () => {
    try {
      setLoadingActivity(true);
      const res = await fetch(`/api/agreements/activity?userEmail=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (Array.isArray(data)) setActivityLogs(data);
    } catch (e) { console.error(e); } 
    finally { setLoadingActivity(false); }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const contrRes = await fetch(`/api/agreements/list?userEmail=${encodeURIComponent(user.email)}`);
      const contrData = await contrRes.json();
      if (Array.isArray(contrData)) setContracts(contrData);

      const txRes = await fetch('/api/subscription/transactions');
      const txData = await txRes.json();
      if (Array.isArray(txData)) setTransactions(txData.filter((t: any) => t.reference));

      const alertRes = await fetch(`/api/notifications/expiring-check?userEmail=${encodeURIComponent(user.email)}`);
      const alertData = await alertRes.json();
      if (alertData && Array.isArray(alertData.allAlerts)) setAlerts(alertData.allAlerts);

      await fetchActivityLogs();
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboardData(); }, [user.email]);

  const runExpiryCheck = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notifications/expiring-check?userEmail=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.allAlerts) setAlerts(data.allAlerts);
      const contrRes = await fetch(`/api/agreements/list?userEmail=${encodeURIComponent(user.email)}`);
      const contrData = await contrRes.json();
      if (Array.isArray(contrData)) setContracts(contrData);
      await fetchActivityLogs();
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upgradePlan) return;
    setSubmittingPayment(true);
    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user.email, planId: upgradePlan, paymentMethod,
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
      if (!response.ok) throw new Error(data.error || 'Upgrade failed');
      setPaymentSuccessData(data.transaction);
      onUpdateUser(data.user);
      const txRes = await fetch('/api/subscription/transactions');
      const txData = await txRes.json();
      if (Array.isArray(txData)) setTransactions(txData);
      await fetchActivityLogs();
    } catch (err) { console.error(err); } 
    finally { setSubmittingPayment(false); }
  };

  const triggerDecryption = async (docId: string) => {
    if (decryptedDocId === docId) { setDecryptedDocId(null); setDecryptedText(''); return; }
    setDecryptingId(docId);
    try {
      const res = await fetch(`/api/agreements/${docId}/decrypt?userEmail=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.decryptedContent) { setDecryptedDocId(docId); setDecryptedText(data.decryptedContent); await fetchActivityLogs(); }
      else { alert(data.error || 'Failed to decrypt document'); }
    } catch (err) { console.error(err); } 
    finally { setDecryptingId(null); }
  };

  const revokeAgreement = async (docId: string) => {
    if (!confirm('Are you sure you want to permanently delete this contract? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/agreements/${docId}?userEmail=${encodeURIComponent(user.email)}`, { method: 'DELETE' });
      if (res.ok) {
        setContracts(contracts.filter(c => c.id !== docId));
        if (decryptedDocId === docId) { setDecryptedDocId(null); setDecryptedText(''); }
        await fetchActivityLogs();
      }
    } catch (e) { console.error(e); }
  };

  const sortedLogs = [...activityLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredLogs = sortedLogs.filter(log => {
    const details = getActivityConfig(log.action, log.status);
    if (activityTypeFilter !== 'ALL' && details.broadCategory !== activityTypeFilter) return false;
    if (activityFilter) {
      const q = activityFilter.toLowerCase();
      return details.label.toLowerCase().includes(q) || details.desc.toLowerCase().includes(q) || log.userEmail?.toLowerCase().includes(q);
    }
    return true;
  });

  const riskDistribution = useMemo(() => {
    let high = 0, medium = 0, low = 0;
    contracts.forEach((doc) => {
      if (doc.risks && doc.risks.some(r => r.severity === 'high')) high++;
      else if (doc.risks && doc.risks.some(r => r.severity === 'medium')) medium++;
      else low++;
    });
    return [
      { name: 'High Risk', value: high, color: '#f43f5e', key: 'high' },
      { name: 'Medium Risk', value: medium, color: '#f59e0b', key: 'medium' },
      { name: 'Low Risk', value: low, color: '#10b981', key: 'low' }
    ];
  }, [contracts]);

  const totalEncryptedBytes = contracts.reduce((acc, c) => acc + (c.encryptedSize || 0), 0);
  const averageCompliance = contracts.length > 0 ? Math.round(contracts.reduce((acc, c) => acc + c.complianceScore, 0) / contracts.length) : 100;

  return (
    <>
      <div className="space-y-6 relative no-print">
      
      {toasts && toasts.length > 0 && (
        <div className="fixed top-24 right-6 z-50 space-y-3 max-w-sm w-full block">
          {toasts.map((toast) => (
            <div key={toast.id} className="bg-slate-900 border border-rose-500/50 border-l-4 border-l-rose-500 rounded-xl p-4 shadow-2xl animate-fade-in">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <span className="font-semibold text-xs text-rose-300 uppercase tracking-wider">{toast.title}</span>
                </div>
                <button onClick={() => removeToast && removeToast(toast.id)} className="text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
              </div>
              <p className="text-xs text-slate-200 mt-2">{toast.message}</p>
              <div className="flex gap-2 mt-3">
                <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-mono">Risk: HIGH</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">Score: {toast.score ?? 0}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Secure Documents</span>
            <span className="text-2xl font-bold text-white block mt-1">{contracts.length}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Stored in vault</span>
          </div>
          <div className="bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 text-emerald-400"><FileText className="h-6 w-6" /></div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Storage Used</span>
            <span className="text-2xl font-bold text-white block mt-1">
              {totalEncryptedBytes > 1024 ? `${(totalEncryptedBytes / 1024).toFixed(1)} KB` : `${totalEncryptedBytes} B`}
            </span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Encrypted</span>
          </div>
          <div className="bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20 text-blue-400"><Lock className="h-6 w-6" /></div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Compliance Score</span>
            <span className="text-2xl font-bold text-white block mt-1">{averageCompliance}%</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">BGMEA guidelines</span>
          </div>
          <div className="bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 text-emerald-400"><Award className="h-6 w-6" /></div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Expiry Alerts</span>
            <span className="text-2xl font-bold text-white block mt-1">{alerts.length}</span>
            <span className="text-[10px] text-amber-400 block mt-0.5">Requires attention</span>
          </div>
          <div className="bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 text-amber-400"><Mail className="h-6 w-6" /></div>
        </div>
      </div>

      <OnboardingGuide />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Documents & Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Document Vault */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="h-4 w-4 text-emerald-400" />
                  Secure Document Vault
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Your documents are securely encrypted. Only you can unlock them.</p>
              </div>
              <button onClick={runExpiryCheck} className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-mono text-[10px] px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer">
                Check Expiries
              </button>
            </div>

            {contracts.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
                <FileText className="h-8 w-8 text-slate-700" />
                <div>
                  <p className="font-semibold text-slate-400">Your vault is empty</p>
                  <p className="text-[10px] text-slate-600 max-w-sm mx-auto mt-1">
                    Go to the <button onClick={() => setActiveTab('contracts')} className="text-emerald-400 underline hover:text-emerald-300">Contract Audit</button> tab to upload and encrypt your first agreement.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {contracts.map((contract) => (
                  <div key={contract.id} className="bg-slate-950/50 border border-slate-800 rounded-lg p-3.5 hover:border-slate-700 transition duration-200">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-sans text-xs font-semibold text-slate-200">{contract.name}</span>
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono uppercase">{contract.type}</span>
                          
                          <span className={`text-[9px] font-bold font-mono px-1.5 rounded uppercase ${
                            contract.complianceScore >= 85 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {contract.complianceScore}% Score
                          </span>

                          <span className={`text-[9px] font-bold font-mono px-1.5 rounded uppercase ${
                            contract.status === 'expired' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' : 
                            contract.status === 'expiring' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {contract.status === 'expired' ? 'EXPIRED' : contract.status === 'expiring' ? 'EXPIRING SOON' : 'ACTIVE'}
                          </span>

                          <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                            <ShieldCheck className="h-2.5 w-2.5" /> Encrypted
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Key className="h-3 w-3 text-slate-600" />
                            ID: <span className="text-emerald-500">{contract.secureCode}</span>
                          </span>
                          <span>|</span>
                          <span>{contract.encryptedSize} bytes</span>
                          <span>|</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-600" />
                            Exp: {contract.expiryDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => triggerDecryption(contract.id)} disabled={decryptingId === contract.id} className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer">
                          <Eye className="h-3 w-3" />
                          {decryptingId === contract.id ? 'Loading...' : decryptedDocId === contract.id ? 'Hide' : 'View'}
                        </button>
                        <button onClick={() => revokeAgreement(contract.id)} className="bg-slate-800 hover:bg-rose-900/30 hover:text-rose-400 hover:border-rose-800 text-slate-500 border border-slate-700 text-[10px] p-1.5 rounded-lg transition cursor-pointer" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {decryptedDocId === contract.id && (
                      <div className="mt-4 bg-slate-950 border border-slate-800 p-4 rounded-lg relative">
                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                          <span className="text-[8px] uppercase tracking-wider font-mono text-emerald-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded">Decrypted Content</span>
                        </div>
                        <p className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap mt-4">{decryptedText}</p>
                        
                        {contract.risks && contract.risks.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-800">
                            <h6 className="font-mono text-[10px] uppercase tracking-wide text-amber-400 block mb-2 font-bold">Compliance Risks Identified</h6>
                            <div className="space-y-1.5">
                              {contract.risks.map((risk, index) => (
                                <div key={index} className="text-[11px] text-slate-400 leading-snug">
                                  <span className="text-rose-400 mr-1">⚠</span> <span className="font-semibold text-slate-200">{risk.title} ({risk.severity})</span> - {risk.recommendation}
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

          {/* Expiry Alerts Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="h-4 w-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white tracking-tight uppercase font-mono">Contract Expiry Alerts</h4>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed mb-4">Automatic alerts are sent when your contracts are close to expiring.</p>

            {alerts.length === 0 ? (
              <div className="py-8 text-center text-slate-600 text-xs bg-slate-950/50 rounded-lg border border-slate-800">
                No alerts yet. Contracts will appear here when they are close to expiring.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {alerts.map((log) => (
                  <div key={log.id} className="bg-slate-950 px-3 py-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-[11px] font-mono hover:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400">📧 Alert Sent</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-slate-200 font-semibold">{log.contractName}</span>
                    </div>
                    <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px]">
                      {log.triggerType === 'expired' ? 'Expired' : log.triggerType === '30_days_before' ? '30 Days Left' : '10 Days Left'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold text-white tracking-tight uppercase font-mono">Recent Activity</h4>
                  <p className="text-[10px] text-slate-500">History of audits, logins, and vault operations</p>
                </div>
              </div>
              <button onClick={fetchActivityLogs} disabled={loadingActivity} className="p-1.5 px-3 text-[10px] bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 cursor-pointer transition font-mono">
                <RefreshCw className={`h-3 w-3 ${loadingActivity ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                <input type="text" placeholder="Search activity..." value={activityFilter} onChange={(e) => setActivityFilter(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-[11px] text-slate-300 placeholder-slate-600 outline-none focus:border-emerald-500 transition" />
              </div>
              <select value={activityTypeFilter} onChange={(e) => setActivityTypeFilter(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-[11px] text-slate-300 focus:border-emerald-500 outline-none font-mono cursor-pointer">
                <option value="ALL">All Types</option>
                <option value="AUDIT">Audits</option>
                <option value="VAULT">Documents</option>
                <option value="RESEARCH">Research</option>
                <option value="SUBSCRIPTION">Billing</option>
              </select>
            </div>

            {sortedLogs.length === 0 ? (
              <div className="py-10 text-center text-slate-600 text-xs bg-slate-950/50 rounded-lg border border-slate-800">No activity yet.</div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-10 text-center text-slate-600 text-xs bg-slate-950/50 rounded-lg border border-slate-800">No matching results.</div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredLogs.slice(0, 25).map((log) => {
                  const details = getActivityConfig(log.action, log.status);
                  return (
                    <div key={log.id} className="bg-slate-950 px-3.5 py-2.5 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono hover:border-slate-700 transition">
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-md border mt-0.5 shrink-0 ${details.iconClass}`}>{details.icon}</div>
                        <div className="space-y-0.5 text-left">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-slate-100 font-bold">{details.label}</span>
                            <span className="text-slate-700">|</span>
                            <span className="text-slate-400 font-sans text-[10px]">{details.desc}</span>
                          </div>
                          <span className="text-slate-500 text-[9.5px] block font-sans">
                            {log.userEmail} &bull; {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-bold uppercase border tracking-wider font-mono shrink-0 ${details.badgeClass}`}>{log.status}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Risk Chart, Pricing, Billing */}
        <div className="space-y-6">
          
          {/* Risk Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-emerald-400" />
                Risk Distribution
              </h3>
              {contracts.length > 0 && (
                <button onClick={() => window.print()} className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-mono text-[10px] px-3 py-1.5 rounded-lg transition cursor-pointer">
                  <Printer className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Export</span>
                </button>
              )}
            </div>

            {contracts.length === 0 ? (
              <div className="py-10 text-center text-slate-600 text-xs italic bg-slate-950/50 rounded-lg border border-slate-800">No contracts audited yet.</div>
            ) : (
              <div className="space-y-4">
                <div className="h-[180px] w-full flex items-center justify-center relative bg-slate-950/50 rounded-lg py-3 border border-slate-800">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={riskDistribution.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                        {riskDistribution.filter(d => d.value > 0).map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', fontFamily: 'monospace', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total</span>
                    <span className="text-2xl font-black font-mono text-white leading-tight mt-0.5">{contracts.length}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {riskDistribution.map((tier) => (
                    <div key={tier.key} className="bg-slate-950/50 border border-slate-800 p-2 rounded-lg flex flex-col items-center text-center">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tier.color }} />
                        <span className="text-[9px] font-mono text-slate-400 font-semibold uppercase">{tier.key}</span>
                      </div>
                      <span className="text-xs font-bold font-mono text-white mt-1">{tier.value}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{contracts.length > 0 ? Math.round((tier.value / contracts.length) * 100) : 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PRICING PLANS (Dark Theme Fixed) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Choose Your Plan</h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">Unlock advanced AI vetting, full compliance reports, and Supreme Court citations.</p>

            <div className={`p-5 rounded-xl border transition-all duration-300 ${user.planType === 'export_elite' ? 'bg-emerald-500/5 border-emerald-500/50' : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'}`}>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Export Elite</h4>
                    <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">Popular</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">For growing factories & merchants.</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-white font-bold font-mono text-lg block">$49<span className="text-[10px] text-slate-500 font-normal">/mo</span></span>
                </div>
              </div>
              <ul className="space-y-2 mt-4 text-[11px] text-slate-300 border-t border-slate-800 pt-3 mb-4">
                <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Unlimited BGMEA Compliance Audits</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Labour Act (Sec 100/45) Checks</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Mushak VAT-6.3 Verification</span></li>
              </ul>
              {user.planType === 'export_elite' ? (
                <div className="text-center text-[10px] font-mono text-emerald-400 font-bold py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 uppercase">✓ Current Plan</div>
              ) : (
                <button id="btn-buy-export-elite" onClick={() => { setUpgradePlan('export_elite'); setCheckoutModal(true); setPaymentSuccessData(null); }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] py-2.5 rounded-lg transition cursor-pointer">Upgrade to Elite</button>
              )}
            </div>

            <div className={`p-5 rounded-xl border transition-all duration-300 ${user.planType === 'corporate_advisory' ? 'bg-blue-500/5 border-blue-500/50' : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'}`}>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Corporate Advisory</h4>
                    <span className="text-[8px] font-mono bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase">Enterprise</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">For major export houses & legal desks.</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-white font-bold font-mono text-lg block">$149<span className="text-[10px] text-slate-500 font-normal">/mo</span></span>
                </div>
              </div>
              <ul className="space-y-2 mt-4 text-[11px] text-slate-300 border-t border-slate-800 pt-3 mb-4">
                <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" /><span>Everything in Export Elite</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" /><span>Double-Taxation (DTAA) Protections</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" /><span>Advanced L/C Arbitration Analysis</span></li>
              </ul>
              {user.planType === 'corporate_advisory' ? (
                <div className="text-center text-[10px] font-mono text-blue-400 font-bold py-2 bg-blue-500/10 rounded-lg border border-blue-500/20 uppercase">✓ Current Plan</div>
              ) : (
                <button id="btn-buy-corporate" onClick={() => { setUpgradePlan('corporate_advisory'); setCheckoutModal(true); setPaymentSuccessData(null); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] py-2.5 rounded-lg transition cursor-pointer">Upgrade to Corporate</button>
              )}
            </div>
          </div>

          {/* Billing History */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h4 className="text-xs font-bold text-white tracking-tight uppercase font-mono mb-3">Billing History</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {transactions.length === 0 ? (
                <div className="py-6 text-center text-slate-600 text-xs bg-slate-950/50 rounded-lg border border-slate-800">No payments yet.</div>
              ) : (
                transactions.map(tx => (
                  <div key={tx.id} className="bg-slate-950 px-3 py-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-[11px] font-mono hover:border-slate-700">
                    <div>
                      <p className="text-slate-200 font-semibold">{tx.plan}</p>
                      <p className="text-slate-500 text-[9px]">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                    <span className="text-emerald-400 font-bold">${tx.amount}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setCheckoutModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
            
            {paymentSuccessData ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Payment Successful</h3>
                <p className="text-sm text-slate-400">Your plan has been upgraded instantly.</p>
                <button onClick={() => setCheckoutModal(false)} className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition">Done</button>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-white">Complete Upgrade</h3>
                
                <div className="flex border border-slate-700 rounded-lg overflow-hidden">
                  {[{m: 'card' as const, icon: CreditCard, l: 'Card'}, {m: 'bank' as const, icon: Landmark, l: 'Bank'}, {m: 'mobile' as const, icon: Smartphone, l: 'bKash/Nagad'}].map(item => (
                    <button key={item.m} type="button" onClick={() => setPaymentMethod(item.m)} className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition ${paymentMethod === item.m ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                      <item.icon className="h-3.5 w-3.5" /> {item.l}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Card Number</label>
                      <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none transition" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Name on Card</label>
                      <input type="text" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none transition" />
                    </div>
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div className="space-y-3">
                    <input type="text" placeholder="Sender Account Name" value={bankSenderName} onChange={(e) => setBankSenderName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500 outline-none transition" required />
                    <input type="text" placeholder="Account Number" value={bankAccountNo} onChange={(e) => setBankAccountNo(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500 outline-none transition" required />
                    <input type="text" placeholder="Reference / TxnID" value={bankRefId} onChange={(e) => setBankRefId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500 outline-none transition" required />
                  </div>
                )}

                {paymentMethod === 'mobile' && (
                  <div className="space-y-3">
                    <select value={mobileProvider} onChange={(e) => setMobileProvider(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none transition">
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="rocket">Rocket</option>
                    </select>
                    <input type="text" placeholder="Sender Mobile Number" value={senderMobileNo} onChange={(e) => setSenderMobileNo(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500 outline-none transition" required />
                    <input type="text" placeholder="Transaction ID (TxnID)" value={mobileTxnId} onChange={(e) => setMobileTxnId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500 outline-none transition" required />
                  </div>
                )}

                <button type="submit" disabled={submittingPayment} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 cursor-pointer">
                  {submittingPayment ? 'Processing...' : `Pay for ${upgradePlan === 'export_elite' ? 'Export Elite' : 'Corporate Advisory'}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}