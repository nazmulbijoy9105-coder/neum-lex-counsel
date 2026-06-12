import React from 'react';
import { 
  Building2, BookOpen, Clock, ShieldCheck, CheckCircle2, 
  Sparkles, ShieldAlert, Award, FileText, Scale, ArrowUpRight, HelpCircle 
} from 'lucide-react';

export default function PlatformGuidelines() {
  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
        <div className="max-w-xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="h-3 w-3" /> Regional Sovereignty Regulatory Suite
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Governance, Law, and Sourcing Security in Bangladesh
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Welcome to the regulatory headquarters of NeumLex. Educate your compliance department about domestic bond practices, custom exemptions under Chittagong port, and mandatory BGMEA dispute resolution.
          </p>
        </div>
      </div>

      {/* Grid of About Us and Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ABOUT US SECTION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2.5 rounded-xl text-slate-800 border border-slate-200">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">I. About NeumLex</h3>
              <p className="text-[11px] text-slate-500">Pioneering Intelligent Trade Compliance Co-pilot</p>
            </div>
          </div>
          
          <p className="text-xs text-slate-600 leading-relaxed text-justify border-l-2 border-emerald-500/35 pl-2.5">
            Founded under regional trade governance directives, <strong>NeumLex Sourcing &amp; Compliance Corp.</strong> is one of Bangladesh's pioneering AI-powered legal compliance platforms. We specialize in assisting readymade garments (RMG) factories, textile mills, local exporters, and global fashion buying houses identify potential contractual pitfalls and regulatory compliance considerations.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed text-justify border-l-2 border-emerald-500/35 pl-2.5">
            Our technology securely couples machine logic with structured compliance frameworks derived from Bangladesh statutory codifications (including the Contract Act 1872, Customs Act 1969, and Labour Act 2006). By automating localized regulatory checks, NeumLex serves as an AI-assisted compliance co-pilot and decision-support platform, assisting groups in preserving their commercial clarity.
          </p>
          
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-55 p-3 rounded-xl border border-slate-100 text-center">
              <span className="block font-mono text-lg font-extrabold text-slate-900">100%</span>
              <span className="text-[10px] text-slate-500 font-sans block mt-0.5">Sovereign Focus</span>
            </div>
            <div className="bg-slate-55 p-3 rounded-xl border border-slate-100 text-center">
              <span className="block font-mono text-lg font-extrabold text-[#38BDF8]">AES-256</span>
              <span className="text-[10px] text-slate-500 font-sans block mt-0.5">Local Encryption</span>
            </div>
          </div>
        </div>

        {/* SERVICES OFFERED LIST & DESCRIPTION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2.5 rounded-xl text-slate-800 border border-slate-200">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">II. Specialized Services</h3>
              <p className="text-[11px] text-slate-500">Strategic Sovereign Advisory Features</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-emerald-50 border border-emerald-200 text-emerald-600 p-1 rounded font-mono text-[9px] font-bold">01</div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  Contract NLP Audit Suite
                  <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded font-mono uppercase scale-90">Core</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Instant machine parsing of buy/sell supply agreements to check liability caps, buyer insolvency, and zero-rated VAT NBR invoice clauses.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-[#ECFDF5] border border-emerald-200 text-emerald-600 p-1 rounded font-mono text-[9px] font-bold">02</div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Sovereign Citation Legal Research</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Query Landmark Bangladesh High Court rulings and Supreme Court citations (e.g., Dhaka Law Reports - DLR) on letters of credit (L/C) and custom bond disputes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-slate-100 border border-slate-200 text-slate-600 p-1 rounded font-mono text-[9px] font-bold">03</div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Automated Expiry Warning Engine</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Logs simulated alerts 30 days and 10 days before any bonded store license, export contract, or office lease expires to safeguard tax exemptions dynamically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* USER GUIDELINES: HOW COMPLIANCE TEAMS OPERATE */}
      <div className="bg-[#0F172A] border border-slate-850 rounded-2xl p-6 md:p-8 text-white shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 p-2.5 rounded-xl text-[#38BDF8] border border-slate-700">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">III. User Guidelines &amp; Protocol</h3>
            <p className="text-[11px] text-slate-400">Step-by-step operating limits for corporate compliance staff</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="text-[#38BDF8] font-mono text-sm font-bold font-mono">GUIDE 01</div>
            <h4 className="text-xs font-bold text-white">Upload terms securely</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Acquire raw clauses and load them into the NLP parser. All content undergoes strict SHA-256 verification and immediate client-side clearing.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="text-[#38BDF8] font-mono text-sm font-bold font-mono">GUIDE 02</div>
            <h4 className="text-xs font-bold text-white">Audit Risk Assessment</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Focus systematically on the 10 compliance scores. Reject open-account parameters unless backed by irrevocable Sight L/Cs.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="text-[#38BDF8] font-mono text-sm font-bold font-mono">GUIDE 03</div>
            <h4 className="text-xs font-bold text-white">Encrypt Vault Storing</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Click Decryption Encryption values. All records are stored with IV tags inside local databases, fully protected from unauthenticated access.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="text-[#38BDF8] font-mono text-sm font-bold font-mono">GUIDE 04</div>
            <h4 className="text-xs font-bold text-white">Generate Reports</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Export professional PDF risk matrix books by triggering your browser's Print option to present to stakeholders or shipping lines.
            </p>
          </div>

        </div>
      </div>

      {/* USER BENEFITS DETAILED DESCRIPTION SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-2.5 rounded-xl text-slate-800 border border-slate-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">IV. Strategic Financial &amp; Trade Benefits</h3>
            <p className="text-[11px] text-slate-500">How your organization is benefited by NeumLex</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed text-justify">
            RMG factories and trading businesses consistently fall victim to unexpected regulatory fees, unnegotiated late delivery discounts, and heavy customs audits. Using NeumLex as your compliance center offers immediate, direct financial benefits:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-150 bg-slate-50 rounded-xl space-y-2">
              <span className="font-bold text-xs text-slate-800 font-sans block flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Mitigating Port Penalty Exposures
              </span>
              <p className="text-[11px] text-slate-500 leading-normal">
                Avoid unexpected customs retro-claims by maintaining clear record ledgers. Keeping accurate audit documentation protects factories from arbitrary customs retro-duties, highlighting the correct statutory references in audits.
              </p>
            </div>

            <div className="p-4 border border-slate-150 bg-slate-50 rounded-xl space-y-2">
              <span className="font-bold text-xs text-slate-800 font-sans block flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Insolvency &amp; Shipping Protection
              </span>
              <p className="text-[11px] text-slate-500 leading-normal">
                Identify delayed payments like unbacked "Net-60" or "Net-90" terms which can leave garments manufacturers vulnerable. NeumLex flags risks and recommends utilizing secure back-to-back Irrevocable Letters of Credit to manage trade risk.
              </p>
            </div>

            <div className="p-4 border border-slate-150 bg-slate-50 rounded-xl space-y-2">
              <span className="font-bold text-xs text-slate-800 font-sans block flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                Tax, VAT, and TDS Optimization
              </span>
              <p className="text-[11px] text-slate-500 leading-normal">
                Enforce zero-rated indirect export VAT statuses and correct source taxation parameters (such as the standard 1% TDS on export values per the 2023 Income Tax rules) using formal Form VAT-6.3 billing audits.
              </p>
            </div>

            <div className="p-4 border border-slate-150 bg-slate-50 rounded-xl space-y-2">
              <span className="font-bold text-xs text-slate-800 font-sans block flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Audit Trail and Legal Counsel Alignment
              </span>
              <p className="text-[11px] text-slate-500 leading-normal">
                Provide pre-parsed risk matrix briefs to your corporate legal team before entering expensive arbitration or multi-million Taka legal court filings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SYSTEMATIC LAWSUIT DISCLAIMER & LIABILITY NOTICE */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5 text-rose-800">
          <ShieldAlert className="h-5 w-5 flex-shrink-0 text-rose-600" />
          <h4 className="text-xs font-bold font-mono tracking-wider uppercase">Sovereign Compliance Legal Disclaimer &amp; Liability Notice</h4>
        </div>
        <p className="text-[11px] text-justify leading-relaxed font-sans text-rose-950">
          <strong>LEGAL DISCLAIMER:</strong> NeumLex is a legal technology and compliance analytics platform intended solely for informational, compliance-monitoring, and risk-assessment purposes. NeumLex is not a law firm, does not provide legal representation, and does not issue legal opinions.
        </p>
        <p className="text-[10.5px] text-justify leading-relaxed text-rose-800 font-sans">
          Users should obtain advice from qualified legal professionals before making decisions involving contracts, litigation, taxation, customs, employment matters, or regulatory compliance. Any references to laws, regulations, or judicial decisions are provided for informational purposes only. The platform assumes no liability for losses arising from reliance on automated outputs without independent professional review. Stored files remain strictly encrypted with industry-standard AES-256 configurations.
        </p>
      </div>

    </div>
  );
}
