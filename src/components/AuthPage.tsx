import React, { useState } from 'react';
import { Scale, ShieldCheck, ArrowRight, User, Mail, Loader2 } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthPageProps {
  onLoginSuccess: (user: UserType, token: string) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError('Corporate email is required.');

    setLoading(true);
    setError('');

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister ? { name, email, role: email.toLowerCase().includes('admin') ? 'admin' : 'user' } : { email };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authentication failed');
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-auto">
      <div className="grid lg:grid-cols-2 bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden" style={{boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)'}}>
        
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-100"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Scale className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">NEUMLEX</h1>
                <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">Sovereign Compliance Platform</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white leading-tight mb-4">
              Statutory Search &<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Automated RMG Auditing</span>
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Bangladesh's premier AI-driven legal research suite. Align with Labour Act 2006, VAT Act 2012, and Cross-Border DTAA protocols instantly.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-200">End-to-End AES-256 Encryption</p>
                <p className="text-[10px] text-slate-500">Contract governance & document vaulting secured.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-200">Cloud Firestore Synchronization</p>
                <p className="text-[10px] text-slate-500">Real-time multi-node data replication.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10 flex flex-col justify-center bg-slate-900">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h3>
            <p className="text-sm text-slate-400">
              {isRegister ? 'Register your corporate entity to access the compliance workspace.' : 'Enter your credentials to access the sovereign dashboard.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0"></div>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 tracking-wide">LEGAL ENTITY NAME</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Apex Export Ltd."
                    className="w-full bg-slate-950/50 border border-slate-700/50 focus:border-emerald-500/50 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-emerald-500/10"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 tracking-wide">CORPORATE EMAIL ADDRESS</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950/50 border border-slate-700/50 focus:border-emerald-500/50 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-emerald-500/10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-4 rounded-xl text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 disabled:opacity-70 group"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isRegister ? 'Secure & Create Account' : 'Access Dashboard'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-[10px] font-mono text-slate-600 text-center uppercase tracking-widest mb-4">Quick Access Presets</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setEmail('NAZMULBIJOY9105@gmail.com'); setIsRegister(false); }}
                className="text-left p-3 bg-slate-950/50 border border-slate-800 hover:border-emerald-500/30 rounded-lg transition-all group"
              >
                <p className="text-xs font-semibold text-slate-300 group-hover:text-emerald-400 transition-colors">Admin Owner</p>
                <p className="text-[10px] text-slate-600 truncate mt-0.5">nazmulbijoy...@gmail.com</p>
              </button>
              <button
                onClick={() => { setEmail('sourcing@apexgarments.com'); setName('Apex Sourcing'); setIsRegister(true); }}
                className="text-left p-3 bg-slate-950/50 border border-slate-800 hover:border-cyan-500/30 rounded-lg transition-all group"
              >
                <p className="text-xs font-semibold text-slate-300 group-hover:text-cyan-400 transition-colors">Demo Exporter</p>
                <p className="text-[10px] text-slate-600 truncate mt-0.5">sourcing@apex...</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}