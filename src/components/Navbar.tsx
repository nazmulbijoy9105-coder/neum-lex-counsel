import React from 'react';
import { ShieldCheck, Scale, FileText, LogOut, Sparkles, BookOpen } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpgradeModal: () => void;
}

export default function Navbar({ user, onLogout, activeTab, setActiveTab, onOpenUpgradeModal }: NavbarProps) {
  return (
    <aside className="w-full md:w-64 bg-[#0F172A] text-slate-150 border-b md:border-b-0 md:border-r border-slate-800/80 p-5 shrink-0 flex flex-col justify-between sticky top-0 md:h-screen z-45">
      <div className="flex flex-col gap-6">
        
        {/* Brand layout styled nicely */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 shrink-0">
            <Scale className="h-6 w-6 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h1 id="brand-title" className="font-sans text-lg font-bold tracking-tight text-white flex items-center gap-1">
              NEUM<span className="text-emerald-400">LEX</span>
              <span className="text-[8px] bg-slate-800/80 text-[#38BDF8] px-1 py-0.5 rounded border border-slate-700/60 font-mono scale-95 origin-left">
                SOVEREIGN
              </span>
            </h1>
            <p className="text-[9px] text-slate-400 font-sans tracking-wide">Bangladesh RMG & Trade Compliance</p>
          </div>
        </div>

        {/* Tab Selection: Horizontal scroll list on mobile, Vertical stack list on desktop */}
        {user ? (
          <nav className="flex md:flex-col items-stretch bg-slate-950/40 md:bg-transparent p-1 md:p-0 rounded-lg border border-slate-800 md:border-0 overflow-x-auto md:overflow-visible gap-1.5 scrollbar-none">
            <button
              id="tab-btn-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-[#38BDF8]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
              }`}
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Sovereign Console
            </button>
            <button
              id="tab-btn-research"
              onClick={() => setActiveTab('research')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'research'
                  ? 'bg-slate-800 text-[#38BDF8]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
              }`}
            >
              <Scale className="h-4 w-4 shrink-0" />
              Legal Search & Statutes
            </button>
            <button
              id="tab-btn-contracts"
              onClick={() => setActiveTab('contracts')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'contracts'
                  ? 'bg-slate-800 text-[#38BDF8]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
              }`}
            >
              <FileText className="h-4 w-4 shrink-0" />
              Contract NLP Audit
            </button>
            
            <button
              id="tab-btn-guidelines"
              onClick={() => setActiveTab('guidelines')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'guidelines'
                  ? 'bg-slate-800 text-[#38BDF8]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
              }`}
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              About & Guidelines
            </button>
            
            {user.role === 'admin' && (
              <button
                id="tab-btn-admin"
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                    : 'text-rose-400 hover:text-rose-300 hover:bg-slate-900/40'
                }`}
              >
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Governance & Audit
              </button>
            )}
          </nav>
        ) : (
          <div className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Access Clearance Pending</div>
        )}
      </div>

      {/* User profile controls & session details inside sidebar footer */}
      {user && (
        <div className="border-t border-slate-800/80 pt-4 mt-6 md:mt-auto space-y-4">
          <div className="flex items-center gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/40">
            <div className="w-8 h-8 rounded-full bg-[#38BDF8] text-slate-950 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {user.name.substring(0, 2)}
            </div>
            
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white block truncate flex items-center gap-1">
                {user.name}
                {user.role === 'admin' && (
                  <span className="bg-rose-500/20 text-rose-300 text-[8px] px-1 rounded font-extrabold uppercase font-mono">
                    Host
                  </span>
                )}
              </span>
              <span className="text-[9px] text-slate-400 block truncate leading-tight mt-0.5">{user.email}</span>
              
              <div className="mt-1">
                {user.subscription === 'premium' ? (
                  <span className="text-[9px] text-[#38BDF8] font-mono tracking-wider font-extrabold block">
                    ✦ {user.planType === 'corporate_advisory' ? 'CORPORATE ADVISORY' : 'EXPORT ELITE'}
                  </span>
                ) : (
                  <button 
                    id="upgrade-trigger-nav" 
                    onClick={onOpenUpgradeModal}
                    className="text-[9px] text-amber-400 font-bold underline cursor-pointer hover:text-amber-300 block text-left"
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            id="logout-btn"
            onClick={onLogout}
            className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white py-1.5 px-3 rounded-lg border border-slate-700/30 flex items-center justify-center gap-2 text-xs font-medium transition cursor-pointer"
          >
            <LogOut id="logout-icon" className="h-3.5 w-3.5" />
            Logout Session
          </button>
        </div>
      )}
    </aside>
  );
}
