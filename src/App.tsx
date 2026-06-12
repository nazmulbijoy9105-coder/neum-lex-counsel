import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import LegalResearch from './components/LegalResearch';
import ContractReview from './components/ContractReview';
import AdminPanel from './components/AdminPanel';
import PlatformGuidelines from './components/PlatformGuidelines';
import { User } from './types';
import { Scale, Lock } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sessionLoading, setSessionLoading] = useState(true);
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = (toast: { title: string; message: string; type: string; contractName: string; score: number }) => {
    setToasts(prev => [
      ...prev,
      {
        ...toast,
        id: 'toast-' + Math.random().toString(36).substring(2, 9),
        timestamp: new Date()
      }
    ]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load and verify local credentials on startup
  useEffect(() => {
    const storedToken = localStorage.getItem('neumlex_session_token');
    if (storedToken) {
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error();
          }
          return res.json();
        })
        .then(data => {
          setUser(data.user);
          setToken(storedToken);
        })
        .catch(() => {
          localStorage.removeItem('neumlex_session_token');
        })
        .finally(() => {
          setSessionLoading(false);
        });
    } else {
      setSessionLoading(false);
    }
  }, []);

  const handleLoginSuccess = (usr: User, tok: string) => {
    localStorage.setItem('neumlex_session_token', tok);
    setUser(usr);
    setToken(tok);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('neumlex_session_token');
    setUser(null);
    setToken(null);
    setActiveTab('dashboard');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  // Callback to force dynamic check in dashboard upon saving agreements
  const handleSavedSuccess = () => {
    // Navigate back to the dashboard securely to let user inspect decrypted raw text
    setActiveTab('dashboard');
  };

  if (sessionLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 font-sans text-xs text-slate-400 gap-3">
        <Scale className="h-10 w-10 text-emerald-500 animate-spin" />
        <span className="font-mono tracking-widest uppercase">Decryption Keys Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Dynamic Left Sidebar on Desktop */}
      {user && (
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          onOpenUpgradeModal={() => {
            // Upgrade is handled easily by setting tab to dashboard which displays commercial details
            setActiveTab('dashboard');
            setTimeout(() => {
              const upgradeBtn = document.getElementById('btn-buy-corporate') || document.getElementById('btn-buy-export-elite');
              if (upgradeBtn) {
                upgradeBtn.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          }}
        />
      )}

      {/* Right Content area covering full remaining space */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {user && (
          <header className="bg-white border-b border-slate-205 px-6 py-4 hidden md:flex justify-between items-center shrink-0">
            <div>
              <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Sovereign Compliance Platform</p>
              <h1 className="text-sm font-bold text-slate-800 tracking-tight">
                {activeTab === 'dashboard' ? 'Sovereign Console & Expiry Tracker' : 
                 activeTab === 'research' ? 'AI Legal Research Registry' : 
                 activeTab === 'contracts' ? 'RMG Contract NLP Auditing Suite' : 
                 activeTab === 'guidelines' ? 'Platform Information & User Guidelines' : 
                 'Governance Oversight & Verification Logs'}
              </h1>
            </div>
            <div className="text-xs text-slate-500 font-mono flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Sovereign Node: Active
            </div>
          </header>
        )}

        <main className={`flex-1 p-4 md:p-6 pb-12 w-full max-w-7xl mx-auto ${!user ? 'flex items-center justify-center min-h-[90vh]' : ''}`}>
          {!user ? (
            <div className="py-4 animate-fade-in w-full max-w-5xl">
              <AuthPage onLoginSuccess={handleLoginSuccess} />
            </div>
          ) : (
            <div className="animate-fade-in">
              {activeTab === 'dashboard' && (
                <Dashboard 
                  user={user} 
                  onUpdateUser={handleUpdateUser} 
                  setActiveTab={setActiveTab}
                  toasts={toasts}
                  removeToast={removeToast}
                />
              )}
              
              {activeTab === 'research' && (
                <LegalResearch 
                  user={user} 
                  onUpgradeRequired={() => {
                    setActiveTab('dashboard');
                    setTimeout(() => {
                      const pricingSec = document.getElementById('btn-buy-export-elite') || document.getElementById('btn-buy-corporate') || document.getElementById('pricing-plans-section');
                      if (pricingSec) {
                        pricingSec.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 150);
                  }}
                />
              )}
              
              {activeTab === 'contracts' && (
                <ContractReview 
                  user={user} 
                  onSavedSuccess={handleSavedSuccess}
                  addToast={addToast}
                />
              )}
              
              {activeTab === 'guidelines' && (
                <PlatformGuidelines />
              )}
              
              {activeTab === 'admin' && (
                <AdminPanel user={user} />
              )}
            </div>
          )}
        </main>

        {/* Footer copyright */}
        <footer className="border-t border-slate-800/60 bg-slate-900 py-4 px-6 text-center text-[10px] text-slate-500 font-mono tracking-wider flex flex-col md:flex-row justify-between items-center gap-2 shrink-0">
          <span>
            © {new Date().getFullYear()} NEUMLEX Sourcing & Compliance Corp. Sovereign Bangladesh Jurisdiction.
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <Lock className="h-3 w-3 text-emerald-500" />
            End-to-End AES-256 Contract Governance Verified
          </span>
        </footer>
      </div>
    </div>
  );
}
