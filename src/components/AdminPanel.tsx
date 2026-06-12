import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, Key, List, Scale, FileText, Database, 
  RefreshCw, CheckSquare, Clock, UserCheck, Server, Search, User, 
  CreditCard, Landmark, Smartphone, ArrowUpRight, ChevronRight, X, 
  Users, Layers, DollarSign, Activity, Settings, UserPlus
} from 'lucide-react';
import { User as UserType, GovernanceLog, LegalCase } from '../types';

interface AdminPanelProps {
  user: UserType;
}

export default function AdminPanel({ user }: AdminPanelProps) {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [logs, setLogs] = useState<GovernanceLog[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [defaultCases, setDefaultCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search and view states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userContracts, setUserContracts] = useState<any[]>([]);
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [updatingUser, setUpdatingUser] = useState(false);

  const fetchAdminMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/metrics?userEmail=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Permission Denied: Admin role needed.');
      }
      setMetrics(data.metrics);
      setLogs(data.logs);
      setUsersList(data.users);
      setTransactionsList(data.transactions || []);
      setDefaultCases(data.defaultCases || []);
    } catch (err: any) {
      setError(err.message || 'Connecting to secure admin metrics failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.role === 'admin') {
      fetchAdminMetrics();
    }
  }, [user.role, user.email]);

  // View individual users' specific telemetry (Agreements metadata & logs)
  const handleInspectUser = async (targetUser: any) => {
    setSelectedUser(targetUser);
    setLoadingUserDetails(true);
    try {
      // 1. Fetch user specific contracts list from server
      const contractsRes = await fetch(`/api/agreements/list?userEmail=${encodeURIComponent(targetUser.email)}`);
      const contractsData = await contractsRes.json();
      setUserContracts(Array.isArray(contractsData) ? contractsData : []);

      // 2. Fetch user's individual telemetry action logs
      const activityRes = await fetch(`/api/agreements/activity?userEmail=${encodeURIComponent(targetUser.email)}`);
      const activityData = await activityRes.json();
      setUserLogs(Array.isArray(activityData) ? activityData : []);
    } catch (err) {
      console.error("Failed to load full telemetry for inspected user", err);
    } finally {
      setLoadingUserDetails(false);
    }
  };

  // Promote, demote, or modify profile types
  const handleUpdateUserProfile = async (targetUserId: string, updates: { role?: string; subscription?: string; planType?: string }) => {
    setUpdatingUser(true);
    try {
      const response = await fetch('/api/admin/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: user.email,
          targetUserId,
          ...updates
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user profile parameters.');
      }
      
      // Refresh metrics state
      await fetchAdminMetrics();
      
      // Update local inspected user state if currently viewed
      if (selectedUser && selectedUser.id === targetUserId) {
        const updated = { ...selectedUser, ...updates };
        setSelectedUser(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Error executing action.');
    } finally {
      setUpdatingUser(false);
    }
  };

  // Convert USD amounts to BDT elegantly (1 USD = 117 BDT as specified in server.ts rule)
  const formatDualCurrency = (usdAmount: number) => {
    const bdtAmount = Math.round(usdAmount * 117);
    return {
      usd: `$${usdAmount} USD`,
      bdt: `৳${bdtAmount.toLocaleString()} BDT`
    };
  };

  // Filter users
  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.planType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (user.role !== 'admin') {
    return (
      <div className="bg-slate-900 border border-slate-850 rounded-2xl p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="text-rose-500 bg-rose-500/10 p-3 rounded-full inline-flex border border-rose-500/20">
          <ShieldAlert className="h-8 w-8 animate-bounce" />
        </div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Sovereign Gate Clearance Failed</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2">
          This system console is strictly restricted to authenticated platform Administrators. Your current role is <span className="text-rose-400 font-bold font-mono">USER</span>.
        </p>
        <div className="p-3 bg-slate-950 rounded-lg text-[11px] text-slate-500 border border-slate-900 font-mono">
          * Decrypting credential headers refused for: {user.email}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
      
      {/* Intro info header */}
      <div className="relative overflow-hidden bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <Server className="h-4 w-4 text-rose-500 animate-pulse" />
              Sovereign Governance Administration &amp; Audit Suite
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Supervise regional trade accounts, mobile bKash tranches, local bank integrations, and document encryptions for NeumLex Bangladesh.
            </p>
          </div>
          
          <button
            onClick={fetchAdminMetrics}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white px-4 py-2 border border-slate-800 rounded-xl transition cursor-pointer text-xs font-mono font-bold"
            title="Refresh metrics"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            REFRESH AUDIT SYSTEM
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-mono">
          ❌ {error}
        </div>
      )}

      {/* Main Stats Rows */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="bg-slate-100 p-2 text-slate-850 border border-slate-200 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider">Corporate Vaults</span>
              <span className="text-lg font-bold text-slate-900 block font-mono">{metrics.userCount}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="bg-slate-100 p-2 text-slate-850 border border-slate-200 rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider">Encrypted Agreements</span>
              <span className="text-lg font-bold text-slate-900 block font-mono">{metrics.docCount}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="bg-slate-100 p-2 text-slate-850 border border-slate-200 rounded-lg">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider">Stored Footprint</span>
              <span className="text-md font-bold text-slate-900 block font-mono">{(metrics.encryptedBytesTotal / 1024).toFixed(2)} KB</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="bg-emerald-50 border border-emerald-250 rounded-xl p-4 shadow-sm flex flex-1 items-center gap-3">
              <div className="bg-emerald-100 p-2 text-emerald-600 border border-emerald-200 rounded-lg">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-650 block font-mono uppercase tracking-wider">Premium Licences</span>
                <span className="text-lg font-bold text-emerald-700 block font-mono">{metrics.premiumUserCount} Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Columns Table & Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Registered Counterparties (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* USER MANAGEMENT CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-1">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-slate-800" />
                  Registered Corporate Counterparties &amp; Profile Services
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select a legal profile to view active licenses, raw contract counts, and billing history.
                </p>
              </div>

              {/* Search user list */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Filter name, email or tier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-8.5 pr-3 py-1.5 border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-150 text-slate-500 font-mono text-[10px] uppercase bg-slate-50/50">
                    <th className="p-2.5">Corporation/Name</th>
                    <th className="p-2.5">Access Scope</th>
                    <th className="p-2.5">Sovereign Tier</th>
                    <th className="p-2.5">Activation Date</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-440 italic">
                        No registered system records found matching reference scope.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((item) => {
                      const isInspected = selectedUser?.id === item.id;
                      return (
                        <tr 
                          key={item.id} 
                          className={`hover:bg-slate-50 transition cursor-pointer ${isInspected ? 'bg-slate-50/80 font-medium' : ''}`}
                          onClick={() => handleInspectUser(item)}
                        >
                          <td className="p-2.5">
                            <div className="font-semibold text-slate-900">{item.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.email}</div>
                          </td>
                          <td className="p-2.5">
                            <span className={`inline-block px-1.5 py-0.5 rounded font-mono text-[9px] font-bold uppercase ${
                              item.role === 'admin' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}>
                              {item.role}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <span className={`inline-block px-1.5 py-0.5 rounded font-mono text-[9px] font-bold uppercase ${
                              item.planType === 'corporate_advisory' 
                                ? 'bg-[#ECFDF5] text-[#047857] border border-emerald-200' 
                                : item.planType === 'export_elite'
                                ? 'bg-slate-100 text-[#38BDF8] border border-slate-300'
                                : 'bg-slate-50 text-slate-550 border border-slate-200'
                            }`}>
                              {item.planType === 'corporate_advisory' ? 'Corporate Advisory' : item.planType === 'export_elite' ? 'Export Elite' : 'Free Tier'}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-500 font-mono">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInspectUser(item);
                              }}
                              className="text-slate-500 hover:text-slate-905 p-1 bg-slate-100 hover:bg-slate-200 rounded transition duration-150 inline-flex items-center gap-1 text-[10px]"
                            >
                              Inspect <ChevronRight className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* DUAL CURRENCY TRANSACTIONS & PAYMENT METHODS LOG */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-slate-800" />
                Regional Financial Auditing Ledger (Dual Currency Converter)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Real-time review of bKash, Rocket, Nagad tranches and statutory Bangladesh bank routes. Standard rates locked of <strong>1 USD = 117 BDT</strong>.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-150 text-slate-500 font-mono text-[10px] uppercase bg-slate-50/50">
                    <th className="p-2.5">Licence Reference</th>
                    <th className="p-2.5">User Account</th>
                    <th className="p-2.5">Audit Clearance Scope</th>
                    <th className="p-2.5">Payment Method / Routing</th>
                    <th className="p-2.5">Convert Amount (BDT &amp; USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {transactionsList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-440 italic">
                        No financial transactions catalogued in the secure warehouse.
                      </td>
                    </tr>
                  ) : (
                    transactionsList.map((txn) => {
                      const currency = formatDualCurrency(txn.amount);
                      return (
                        <tr key={txn.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-2.5">
                            <span className="font-mono text-slate-900 font-bold block">{txn.reference}</span>
                            <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                              {new Date(txn.date).toLocaleString()}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-700 font-mono">
                            {txn.userEmail || "user@neumlex.com"}
                          </td>
                          <td className="p-2.5 font-bold text-slate-800">
                            {txn.plan || "Export Elite"}
                          </td>
                          <td className="p-2.5">
                            <div className="flex flex-col space-y-1">
                              {/* Display Method Icon Badge */}
                              {txn.paymentMethod === 'bank' ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-mono w-min font-bold uppercase">
                                  <Landmark className="h-2.5 w-2.5" /> Bank Transfer
                                </span>
                              ) : txn.paymentMethod === 'mobile' ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-mono w-min font-bold uppercase">
                                  <Smartphone className="h-2.5 w-2.5" /> Mobile Wallet
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 text-[9px] font-mono w-min font-bold">
                                  <CreditCard className="h-2.5 w-2.5" /> credit Card
                                </span>
                              )}

                              {/* Display specific payment details */}
                              {txn.paymentMethod === 'bank' && txn.details && (
                                <div className="text-[9px] text-slate-500 font-mono space-y-0.5 pl-1 border-l border-slate-200">
                                  <span className="block">Sender: {txn.details.bankSenderName || 'N/A'}</span>
                                  <span className="block">A/C: {txn.details.bankAccountNo || 'N/A'}</span>
                                  <span className="block">Ref ID: {txn.details.bankRefId || 'N/A'}</span>
                                </div>
                              )}

                              {txn.paymentMethod === 'mobile' && txn.details && (
                                <div className="text-[9px] text-slate-500 font-mono space-y-0.5 pl-1 border-l border-slate-200">
                                  <span className="block text-emerald-600 font-bold uppercase">{txn.details.mobileProvider || 'bkash'}</span>
                                  <span className="block">No: {txn.details.senderMobileNo || 'N/A'}</span>
                                  <span className="block text-slate-800 font-bold">Txn ID: {txn.details.mobileTxnId || 'N/A'}</span>
                                </div>
                              )}

                              {txn.paymentMethod === 'card' && txn.details && (
                                <div className="text-[9px] text-slate-500 font-mono pl-1 border-l border-slate-200">
                                  <span className="block">{txn.details.cardHolder || 'Card Owner'} ({txn.details.cardNumber || '•••• 4242'})</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2.5 text-right font-mono">
                            <span className="text-slate-900 block font-bold">{currency.bdt}</span>
                            <span className="text-[10px] text-slate-450 block">{currency.usd}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive User Inspector Deep-Dive (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {selectedUser ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-6 relative">
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedUser(null)}
                className="absolute right-4 top-4 hover:bg-slate-800 p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Title Header */}
              <div className="space-y-1.5 border-b border-slate-800 pb-4">
                <span className="text-[10px] text-rose-400 font-mono uppercase font-bold tracking-wider block">Live Profile Telemetry</span>
                <h4 className="text-sm font-extrabold text-white font-mono flex items-center gap-2">
                  <User className="h-4 .w-4 text-emerald-400" />
                  {selectedUser.name}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">{selectedUser.email}</p>
                <p className="text-[10px] text-slate-500 font-mono">ID: {selectedUser.id}</p>
              </div>

              {/* ACTIVE PERMISSIONS & LICENSING PANEL TABS */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase">
                  <Settings className="h-3.5 w-3.5 text-slate-400" /> Administrative Access Configuration
                </div>

                <div className="space-y-3 pt-1">
                  
                  {/* Scope Controls */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-mono font-bold text-slate-500">Security Access Scope:</label>
                    <div className="flex gap-2">
                      <button
                        disabled={updatingUser}
                        onClick={() => handleUpdateUserProfile(selectedUser.id, { role: 'user' })}
                        className={`flex-1 text-[10px] py-1 px-2 rounded font-mono font-bold uppercase transition border ${
                          selectedUser.role === 'user' 
                            ? 'bg-slate-800 text-white border-slate-700' 
                            : 'bg-slate-950 text-slate-500 border-slate-900 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        USER Role
                      </button>
                      <button
                        disabled={updatingUser}
                        onClick={() => handleUpdateUserProfile(selectedUser.id, { role: 'admin' })}
                        className={`flex-1 text-[10px] py-1 px-2 rounded font-mono font-bold uppercase transition border ${
                          selectedUser.role === 'admin' 
                            ? 'bg-rose-950 text-rose-400 border-rose-900/50' 
                            : 'bg-slate-950 text-slate-500 border-slate-900 hover:text-rose-400 hover:bg-slate-900'
                        }`}
                      >
                        ADMIN Role
                      </button>
                    </div>
                  </div>

                  {/* Pricing Tiers Controls */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-mono font-bold text-slate-500">Licensing Tier &amp; Active Services:</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        disabled={updatingUser}
                        onClick={() => handleUpdateUserProfile(selectedUser.id, { subscription: 'free', planType: 'free' })}
                        className={`text-[9px] py-1.5 px-1 rounded font-mono font-bold uppercase transition text-center border ${
                          selectedUser.subscription === 'free'
                            ? 'bg-slate-800 text-white border-slate-700'
                            : 'bg-slate-950 text-slate-500 border-slate-900 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        Free Preset
                      </button>
                      
                      <button
                        disabled={updatingUser}
                        onClick={() => handleUpdateUserProfile(selectedUser.id, { subscription: 'premium', planType: 'export_elite' })}
                        className={`text-[9px] py-1.5 px-1 rounded font-mono font-bold uppercase transition text-center border ${
                          selectedUser.planType === 'export_elite'
                            ? 'bg-[#0f172a] text-[#38BDF8] border-[#38BDF8]/35'
                            : 'bg-slate-950 text-slate-500 border-slate-900 hover:text-[#38BDF8] hover:bg-slate-900'
                        }`}
                      >
                        Export Elite
                      </button>

                      <button
                        disabled={updatingUser}
                        onClick={() => handleUpdateUserProfile(selectedUser.id, { subscription: 'premium', planType: 'corporate_advisory' })}
                        className={`text-[9px] py-1.5 px-1 rounded font-mono font-bold uppercase transition text-center border ${
                          selectedUser.planType === 'corporate_advisory'
                            ? 'bg-[#ECFDF5]/10 text-emerald-400 border-emerald-500/35'
                            : 'bg-slate-950 text-slate-500 border-slate-900 hover:text-emerald-400 hover:bg-slate-900'
                        }`}
                      >
                        Corporate
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* USER AGREEMENTS TELEMETRY METADATA LIST */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-300 uppercase">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-[#38BDF8]" /> Stored Documents ({userContracts.length})
                  </span>
                  {userContracts.length > 0 && (
                    <span className="text-[10px] text-emerald-400">
                      Ø {Math.round(userContracts.reduce((acc, c) => acc + (c.complianceScore || 0), 0) / userContracts.length)}% Score
                    </span>
                  )}
                </div>

                {loadingUserDetails ? (
                  <div className="text-center py-4 text-xs select-none text-slate-500 font-mono animate-pulse">
                    Decrypting directory registry...
                  </div>
                ) : userContracts.length === 0 ? (
                  <div className="bg-slate-950 text-center py-5 border border-slate-850 rounded-lg text-slate-550 leading-relaxed font-sans text-[11px] p-4">
                    🔍 No corporate sourcing contracts decrypted under this account's local storage database files.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {userContracts.map(doc => (
                      <div key={doc.id} className="bg-slate-950 border border-slate-850 rounded p-2.5 space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-[11px] text-slate-200 block truncate max-w-[150px]">{doc.name}</span>
                          <span className={`inline-block px-1 py-0.5 rounded font-mono text-[8px] font-bold ${
                            doc.complianceScore >= 80 ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                          }`}>
                            {doc.complianceScore}% Score
                          </span>
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono pt-1 border-t border-slate-900">
                          <span>IV Size: {doc.encryptedSize || 0}B</span>
                          <span className="text-rose-450 uppercase font-bold">{doc.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RECENT USER ACTIVITY LOG */}
              <div className="space-y-3 pt-1">
                <h5 className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-rose-500" /> Recent Profile Telemetry Logs
                </h5>
                
                {loadingUserDetails ? (
                  <div className="text-center py-2 text-xs text-slate-600 animate-pulse font-mono">Loading telemetry logs...</div>
                ) : userLogs.length === 0 ? (
                  <div className="text-[10px] text-slate-500/80 font-mono italic">No actions registered yet.</div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 font-mono text-[9px]">
                    {userLogs.slice(0, 10).map((act, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-850 rounded p-1.5 flex justify-between gap-2.5">
                        <span className="text-slate-300 truncate">{act.action}</span>
                        <span className="text-[8px] text-emerald-500 uppercase">{act.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 text-white shadow-xl text-center space-y-4">
              <div className="bg-slate-950 p-4 rounded-full border border-slate-800 inline-flex text-rose-500">
                <UserCheck className="h-6 w-6" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono">Profile Audit Scope</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Please click on any corporate counterpart profile inside the user database to check decrypted agreements, transaction history details, or modify their service license parameters.
              </p>
              <div className="text-[9px] text-slate-500 font-mono uppercase bg-slate-950 p-2.5 rounded border border-slate-900 max-w-xs mx-auto">
                * Operational compliance console for Admin
              </div>
            </div>
          )}

          {/* CRYPTOGRAPHIC AUDIT LOGS OVERVIEW */}
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 text-white space-y-4">
            <h4 className="text-xs font-bold text-white tracking-wider font-mono uppercase flex items-center gap-1.5">
              <List className="h-4 w-4 text-rose-500" /> Real-time System Notifications &amp; Alerts
            </h4>
            <p className="text-[10px] text-slate-450 leading-relaxed">
              Maintains cryptographic records of automated alerts. Triggered when trade contracts approach expiring status (30 days threshold per NBR rules).
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto text-[10px] font-mono">
              {logs.slice(0, 5).map((log, idx) => (
                <div key={idx} className="p-2 border border-slate-850 bg-slate-900/50 rounded flex justify-between gap-1 items-start">
                  <span className="text-slate-205 leading-normal block max-w-[150px] truncate">{log.action}</span>
                  <span className="text-emerald-500 shrink-0 uppercase font-bold text-[8px]">{log.status}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
