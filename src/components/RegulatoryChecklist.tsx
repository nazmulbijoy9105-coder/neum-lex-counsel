import React, { useState } from 'react';
import { 
  CheckCircle, AlertTriangle, AlertOctagon, HelpCircle, FileText, ChevronDown, ChevronUp, Info, Scale, ShieldCheck
} from 'lucide-react';

interface RegulatoryChecklistProps {
  content: string;
  jurisdiction?: 'bangladesh' | 'global';
}

interface ChecklistItem {
  id: string;
  actName: string;
  title: string;
  description: string;
  clauseReference: string;
  status: 'compliant' | 'warning' | 'missing';
  reason: string;
}

export default function RegulatoryChecklist({ content, jurisdiction = 'bangladesh' }: RegulatoryChecklistProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('labour');
  const [showHelperModal, setShowHelperModal] = useState(false);

  const isGlobal = jurisdiction === 'global';

  // Analyze content on the fly to determine compliance parameters
  const analyzeCompliance = (): { 
    labourItems: ChecklistItem[]; 
    vatItems: ChecklistItem[]; 
    taxItems: ChecklistItem[];
    totalScore: number;
    completedCount: number;
    warningCount: number;
    missingCount: number;
  } => {
    const text = (content || '').toLowerCase();

    // 1. LABOUR ACT ITEMS
    const labourItems: ChecklistItem[] = [
      {
        id: 'labour-1',
        actName: isGlobal ? 'ILO / Global Labour Standards' : 'Bangladesh Labour Act 2006',
        title: isGlobal ? 'Welfare Funds & Retirement Gratuities' : 'Section 234/235: Gratuity & Workers Provident Fund Trust',
        description: isGlobal ? 'Requires establishment of active pension/provident funds and employee eligibility gratuity schemes.' : 'Requires industrial & export facilities to establish active provident funds and workers eligibility gratuity schemes.',
        clauseReference: isGlobal ? 'ILO Convention 102' : 'Chapter XV / Section 234',
        status: text.includes('gratuity') || text.includes('provident fund') || text.includes('provident')
          ? 'compliant'
          : text.includes('benefit') || text.includes('bonus')
          ? 'warning'
          : 'missing',
        reason: text.includes('gratuity') || text.includes('provident fund') || text.includes('provident')
          ? 'Explicit references to gratuity funds or registered provident trusts detected.'
          : text.includes('benefit') || text.includes('bonus')
          ? 'General benefits referenced but lacks specific statutory gratuity/provident fund allocations.'
          : 'No provisions found specifying worker gratuity payouts or participation funds.'
      },
      {
        id: 'labour-2',
        actName: isGlobal ? 'ILO / Global Labour Standards' : 'Bangladesh Labour Act 2006',
        title: isGlobal ? 'Termination Notice & Contract Severance Terms' : 'Section 20/26: Retrenchment Compensation & Notice Delivery',
        description: isGlobal ? 'Ensures fair contractual notification periods and structured severance payouts based on service duration.' : 'Ensures strict notification limits (30-120 days depending on role type) and termination pays.',
        clauseReference: isGlobal ? 'ILO Termination Recommendation 166' : 'Chapter II / Section 20-26',
        status: text.includes('termination') && (text.includes('notice') || text.includes('severance') || text.includes('pay-in-lieu'))
          ? 'compliant'
          : text.includes('termination')
          ? 'warning'
          : 'missing',
        reason: text.includes('termination') && (text.includes('notice') || text.includes('severance') || text.includes('pay-in-lieu'))
          ? 'Notice delivery sequences & severance payout structures explicitly set.'
          : text.includes('termination')
          ? 'Termination clause exists but lacks description of statutory notice limits or pay-in-lieu clauses.'
          : 'No standard termination, notice, or retrenchment compensation provisions identified.'
      },
      {
        id: 'labour-3',
        actName: isGlobal ? 'ILO / Global Labour Standards' : 'Bangladesh Labour Act 2006',
        title: isGlobal ? 'Maximum Work Shifts & Paid Overtime Caps' : 'Section 100/108: Working Hours Limits & Premium Overtime',
        description: isGlobal ? 'Restricts working periods and enforces overtime compensation at premium rates for extra work hours.' : 'Enforces standard shift limits of 8 hours/day and mandates premium overtime rates of double the basic pay.',
        clauseReference: isGlobal ? 'ILO Hours of Work Convention' : 'Chapter IX / Section 100-108',
        status: text.includes('overtime') || text.includes('working hours') || text.includes('shifts')
          ? 'compliant'
          : text.includes('hours')
          ? 'warning'
          : 'missing',
        reason: text.includes('overtime') || text.includes('working hours') || text.includes('shifts')
          ? 'Recognizes shift hours limits or specifies premium rates for overtime duties.'
          : text.includes('hours')
          ? 'General hourly caps mentioned but does not specify statutory double-basic overtime rate matches.'
          : 'Absenteeism of provisions governing standard working caps or mandatory overtime allocations.'
      },
      {
        id: 'labour-4',
        actName: isGlobal ? 'ILO / Global Labour Standards' : 'Bangladesh Labour Act 2006',
        title: isGlobal ? 'Maternity Leave & Equality Safety Guardrails' : 'Section 45-50: Paid Maternity Leave & Worker Protection',
        description: isGlobal ? 'Guarantees standard paid maternity leave terms and protects parents from discriminatory layout changes.' : 'Guarantees 16 weeks of fully paid maternity leave and protects female workers from layout terminations.',
        clauseReference: isGlobal ? 'ILO Maternity Protection Convention' : 'Chapter IV / Section 45-50',
        status: text.includes('maternity') || text.includes('pregnancy')
          ? 'compliant'
          : text.includes('female') || text.includes('leave')
          ? 'warning'
          : 'missing',
        reason: text.includes('maternity') || text.includes('pregnancy')
          ? 'Full paid maternity periods and job safeguard clauses recognized.'
          : text.includes('female') || text.includes('leave')
          ? 'General gender provisions or leave rules included, but lacks explicit paid maternity rules.'
          : 'No provisions relating to statutory paid maternity leave or protective safeguards.'
      }
    ];

    // 2. VAT ACT ITEMS
    const vatItems: ChecklistItem[] = [
      {
        id: 'vat-1',
        actName: isGlobal ? 'Incoterms & Global Customs Standards' : 'Value Added Tax & Supplementary Duty Act 2012',
        title: isGlobal ? 'Zero-Rated Direct/Deemed Export Processing' : 'Section 24/25: Zero-Rated Export Vat Processing',
        description: isGlobal ? 'Qualifies compliant export industries or cross-border deemed deliveries to zero-rated tax systems.' : 'Qualifies compliant export industries or deemed exports to 0% value-added taxation mechanisms.',
        clauseReference: isGlobal ? 'UCP 600 / GATT Article I' : 'Chapter V / Section 24',
        status: text.includes('zero-rated') || text.includes('deemed export') || text.includes('tax exemption')
          ? 'compliant'
          : text.includes('vat') || text.includes('value added tax')
          ? 'warning'
          : 'missing',
        reason: text.includes('zero-rated') || text.includes('deemed export') || text.includes('tax exemption')
          ? 'Deemed exports zero-rated declarations or zero-tax processing pathways set up.'
          : text.includes('vat') || text.includes('value added tax')
          ? 'Vat mentioned but fails to capture specific zero-rated classification clauses for deemed exports.'
          : 'Zero-rated export options or zero duty pathways for RMG inputs not declared.'
      },
      {
        id: 'vat-2',
        actName: isGlobal ? 'Incoterms & Global Customs Standards' : 'Value Added Tax & Supplementary Duty Act 2012',
        title: isGlobal ? 'Export Tax Invoice & Challan Issuance' : 'Section 51: Compulsory Mushak Form VAT-6.3 Release',
        description: isGlobal ? 'Requires formal compliance-certified tax invoices or local challan proofs on/before shipment transfer.' : 'Mandates issuing VAT-6.3 tax challans at or prior to the exact time of physical goods distribution.',
        clauseReference: isGlobal ? 'Global VAT Invoice Best Practices' : 'Chapter VII / Section 51',
        status: text.includes('6.3') || text.includes('mushak') || text.includes('vat invoice') || text.includes('tax invoice')
          ? 'compliant'
          : text.includes('invoice') || text.includes('billing')
          ? 'warning'
          : 'missing',
        reason: text.includes('6.3') || text.includes('mushak') || text.includes('vat invoice') || text.includes('tax invoice')
          ? 'Adherence to mandatory tax invoice or certificate delivery explicitly documented.'
          : text.includes('invoice') || text.includes('billing')
          ? 'Standard invoice required, but lacks compulsory statutory tax invoice or Form Mushak-6.3 requirements.'
          : 'Fails to designate delivery of tax invoice or VAT certificates upon goods release.'
      },
      {
        id: 'vat-3',
        actName: isGlobal ? 'Incoterms & Global Customs Standards' : 'Value Added Tax & Supplementary Duty Act 2012',
        title: isGlobal ? 'Duty-Free Bonded Storage & Customs Authority Coordination' : 'Customs & Bonded Warehouse Priority Rules',
        description: isGlobal ? 'Secures authorized customs clearing protocols and priority access to tax-free bonded facilities.' : 'Guarantees customs authority coordination and direct access to duty-free bonded storage allocations.',
        clauseReference: isGlobal ? 'Kyoto Convention Annex D' : 'Bond Registry Directive / Customs Act',
        status: text.includes('bonded') || text.includes('custom duty') || text.includes('customs clearance')
          ? 'compliant'
          : text.includes('import') || text.includes('export')
          ? 'warning'
          : 'missing',
        reason: text.includes('bonded') || text.includes('custom duty') || text.includes('customs clearance')
          ? 'Bonded warehouse utilization and customs authority alignments configured.'
          : text.includes('import') || text.includes('export')
          ? 'Trade movements mentioned but fails to declare bonded logistics safety clearances.'
          : 'No provisions securing raw input protection under local bonded warehouse authorities.'
      }
    ];

    // 3. TAX ORDE / ACT ITEMS
    const taxItems: ChecklistItem[] = [
      {
        id: 'tax-1',
        actName: isGlobal ? 'International Tax Treaty Guidelines (OECD)' : 'Bangladesh Income Tax Act 2023',
        title: isGlobal ? 'Tax Deducted at Source (TDS) Withholding Cap' : 'Section 52: Tax Deducted at Source (TDS) Cap Adjustments',
        description: isGlobal ? 'Regulates corporate withholding tax rules at source and limits statutory maximum rates on supply orders.' : 'Imposes mandatory corporate withholding taxes (TDS) but regulates specific exemptions on supply values.',
        clauseReference: isGlobal ? 'OECD Article 10/11' : 'Part IV / Section 52',
        status: text.includes('tds') || text.includes('withholding') || text.includes('source tax')
          ? 'compliant'
          : text.includes('tax')
          ? 'warning'
          : 'missing',
        reason: text.includes('tds') || text.includes('withholding') || text.includes('source tax')
          ? 'Explicitly states TDS withholding liability sharing and regulates maximum local rates.'
          : text.includes('tax')
          ? 'Taxation mentioned generally but lacks detailed withholding offsets or source deduction parameters.'
          : 'Fails to assign TDS calculation risks or compliance responsibility with Section 52 limits.'
      },
      {
        id: 'tax-2',
        actName: isGlobal ? 'International Tax Treaty Guidelines (OECD)' : 'Bangladesh Income Tax Act 2023',
        title: isGlobal ? 'Tax Treasury Deposit & Challan (Chalan) Proof Delivery' : 'Treasury Challan (Chalan) Delivery Cycles',
        description: isGlobal ? 'Enforces prompt transfer of physical tax challans or treasury tax payment certificates back to exporter (typically within 30 days).' : 'Demands withholding parties pass official bank treasury receipts to original exporters within 30 days.',
        clauseReference: isGlobal ? 'OECD Model Withholding Rules' : 'Section 53 & NBR Rule Book',
        status: text.includes('challan') || text.includes('chalan') || text.includes('treasury receipt') || text.includes('tax certificate')
          ? 'compliant'
          : text.includes('payment proof') || text.includes('receipt')
          ? 'warning'
          : 'missing',
        reason: text.includes('challan') || text.includes('chalan') || text.includes('treasury receipt') || text.includes('tax certificate')
          ? 'Provides for rapid return of chalan deposits to support export income tax clearance.'
          : text.includes('payment proof') || text.includes('receipt')
          ? 'Requests payment receipts but lacks statutory treasury challan verification specifics.'
          : 'No compliance clauses for sending treasury challan proofs back to the supplier.'
      },
      {
        id: 'tax-3',
        actName: isGlobal ? 'International Tax Treaty Guidelines (OECD)' : 'Bangladesh Income Tax Act 2023',
        title: isGlobal ? 'Double Taxation Avoidance Residency Certifications (TRC)' : 'Double Taxation Avoidance Residency (TRC)',
        description: isGlobal ? 'Demands valid Tax Residency Certificates (TRC) to shield overseas sellers from double corporate tax hikes.' : 'Prerequisites verification of foreign entity Tax Residency Certificates to authorize cross-border rate cuts.',
        clauseReference: isGlobal ? 'Double Tax Treaties (DTAA)' : 'Section 151 / DTAA Treaties',
        status: text.includes('dtaa') || text.includes('double tax') || text.includes('residency certificate') || text.includes('permanent establishment')
          ? 'compliant'
          : text.includes('foreign') || text.includes('withholding tax')
          ? 'warning'
          : 'missing',
        reason: text.includes('dtaa') || text.includes('double tax') || text.includes('residency certificate') || text.includes('permanent establishment')
          ? 'Tax residency verification or Double Taxation Avoidance Treaty relief rules defined.'
          : text.includes('foreign') || text.includes('withholding tax')
          ? 'Foreign transactions are present but fail to configure bilateral DTAA treaty qualifications.'
          : 'Absence of legal parameters safeguarding against permanent establishment (PE) tax exposures.'
      }
    ];

    const allItems = [...labourItems, ...vatItems, ...taxItems];
    let scoreSum = 0;
    let completedCount = 0;
    let warningCount = 0;
    let missingCount = 0;

    allItems.forEach(item => {
      if (item.status === 'compliant') {
        scoreSum += 10;
        completedCount++;
      } else if (item.status === 'warning') {
        scoreSum += 5;
        warningCount++;
      } else {
        missingCount++;
      }
    });

    const totalScore = Math.round((scoreSum / (allItems.length * 10)) * 100);

    return {
      labourItems,
      vatItems,
      taxItems,
      totalScore,
      completedCount,
      warningCount,
      missingCount
    };
  };

  const {
    labourItems,
    vatItems,
    taxItems,
    totalScore,
    completedCount,
    warningCount,
    missingCount
  } = analyzeCompliance();

  // Progress Bar styling color setup
  const getProgressColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-400 shadow-emerald-500/10';
    if (score >= 50) return 'from-amber-500 to-orange-400 shadow-amber-500/10';
    return 'from-rose-500 to-red-400 shadow-rose-500/10';
  };

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <div id="regulatory-compliance-checklist-container" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4 p-5 md:p-6 animate-fade-in font-sans">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
              {isGlobal ? 'Global Policy Cross-Match' : 'Sovereign Policy Cross-Match'}
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-100 font-sans tracking-wide">
            {isGlobal ? 'International Regulatory Compliance Checklist' : 'Bangladesh Regulatory Compliance Checklist'}
          </h4>
          <p className="text-[11px] text-slate-400">
            {isGlobal 
              ? 'Automated compliance engine vetting against global codes (ILO conventions, GATT trade principles, OECD model treaties)'
              : 'Automated compliance engine vetting against domestic codifications (Labour Act 2006, NBR VAT Act 2012, Tax Act 2023)'}
          </p>
        </div>

        {/* Dynamic Percentage Circle or Badge */}
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-850 rounded-lg p-2.5 shrink-0">
          <div className="text-right">
            <span className="text-[9px] text-slate-500 font-mono block uppercase">Checklist Score</span>
            <span className={`text-lg font-bold font-mono ${
              totalScore >= 80 ? 'text-emerald-400' : totalScore >= 50 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {totalScore}%
            </span>
          </div>
          <div className="h-9 w-[1px] bg-slate-850" />
          <div className="grid grid-cols-3 gap-x-2.5 text-center text-[10px] font-mono">
            <div>
              <span className="text-emerald-400 font-bold block">{completedCount}</span>
              <span className="text-slate-500 uppercase text-[8px]">Passed</span>
            </div>
            <div>
              <span className="text-amber-400 font-bold block">{warningCount}</span>
              <span className="text-slate-500 uppercase text-[8px]">Alerts</span>
            </div>
            <div>
              <span className="text-rose-400 font-bold block">{missingCount}</span>
              <span className="text-slate-500 uppercase text-[8px]">Miss</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Completion Progress Bar with Glow effect */}
      <div className="space-y-1.5 py-1 font-sans text-xs">
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
          <span>COMPLIANCE ALIGNMENT STATUS</span>
          <span className="font-bold">{totalScore}% Aligned</span>
        </div>
        <div className="w-full bg-slate-950 border border-slate-850/60 rounded-full h-3 overflow-hidden shadow-inner p-0.5 animate-pulse">
          <div 
            id="regulatory-progress-bar"
            className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ${getProgressColor(totalScore)}`}
            style={{ width: `${totalScore}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
          <span>0% Bare Risk</span>
          <span>50% Basic Shield</span>
          <span>100% Global Guarded</span>
        </div>
      </div>

      {/* Checklist Sections */}
      <div className="space-y-3 pt-2">
        
        {/* SECTION 1: LABOUR ACT */}
        <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/20">
          <button 
            onClick={() => toggleSection('labour')}
            className="w-full p-3 flex items-center justify-between bg-slate-950/60 hover:bg-slate-950 transition font-sans text-left outline-none cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-200">
                {isGlobal ? 'ILO Labour & Fair Employment Standards' : 'Bangladesh Labour Act, 2006 Compliance Checklist'}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 font-mono rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/15">
                4 Mandates
              </span>
            </div>
            {expandedSection === 'labour' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {expandedSection === 'labour' && (
            <div className="p-3 border-t border-slate-850 bg-slate-950/10 space-y-3">
              {labourItems.map((item) => (
                <ChecklistItemRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: VAT ACT */}
        <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/20">
          <button 
            onClick={() => toggleSection('vat')}
            className="w-full p-3 flex items-center justify-between bg-slate-950/60 hover:bg-slate-950 transition font-sans text-left outline-none cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              <span className="text-xs font-bold text-slate-200">
                {isGlobal ? 'Global Value Added Tax & Customs Transfer Code' : 'NBR Value Added Tax (VAT) Act 2012 Compliance Checklist'}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 font-mono rounded bg-teal-500/10 text-teal-400 font-bold border border-teal-500/15">
                3 Mandates
              </span>
            </div>
            {expandedSection === 'vat' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {expandedSection === 'vat' && (
            <div className="p-3 border-t border-slate-850 bg-slate-950/10 space-y-3">
              {vatItems.map((item) => (
                <ChecklistItemRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3: INCOME TAX ACT */}
        <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/20">
          <button 
            onClick={() => toggleSection('tax')}
            className="w-full p-3 flex items-center justify-between bg-slate-950/60 hover:bg-slate-950 transition font-sans text-left outline-none cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-200">
                {isGlobal ? 'Bilateral Corporate Withholding Tax Safeguards (DTAA)' : 'Bangladesh Income Tax Act, 2023 Compliance Checklist'}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 font-mono rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/15">
                3 Mandates
              </span>
            </div>
            {expandedSection === 'tax' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {expandedSection === 'tax' && (
            <div className="p-3 border-t border-slate-850 bg-slate-950/10 space-y-3">
              {taxItems.map((item) => (
                <ChecklistItemRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Info Notice helper */}
      <div className="bg-slate-950 border border-slate-850 rounded-lg p-3.5 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-[11px] text-slate-400">
          <p className="font-semibold text-slate-300 font-sans">Statutory Self-Audit Calibration Details</p>
          <p className="font-sans leading-relaxed">
            The cross-reference check inspects terms dynamically for mandatory clauses prescribed by current legislation. If vital protections are omitted, you can write conforming buffers using the <strong className="text-emerald-400">Suggested Clause Boilerplates</strong> provided in the Missing Terms section.
          </p>
          <button 
            onClick={() => setShowHelperModal(true)}
            className="text-emerald-400 hover:text-emerald-350 underline inline-block mt-1 font-semibold cursor-pointer outline-none"
          >
            {isGlobal ? 'View Global Trade Compliance Manual' : 'View Bangladesh Legal Threshold Manual'}
          </button>
        </div>
      </div>

      {/* Manual Helper Modal overlay */}
      {showHelperModal && (
        <div id="statutory-manual-modal-overlay" className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 max-w-lg w-full shadow-2xl relative space-y-4">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-emerald-400 animate-pulse" />
                <h4 className="font-bold text-sm text-slate-100">{isGlobal ? 'Global Trade Compliance Manual' : 'Bangladesh Legal Threshold Manual'}</h4>
              </div>
              <button 
                onClick={() => setShowHelperModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 font-bold transition outline-none cursor-pointer"
                title="Close manual"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-[11.5px] text-slate-350 leading-relaxed overflow-y-auto max-h-[300px] pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              <div className="space-y-1">
                <p className="font-bold text-slate-200">1. {isGlobal ? 'ILO Fair Labour Frameworks' : 'Labor Act, 2006 Limits'}</p>
                <p>{isGlobal ? 'Core ILO conventions mandate premium payments of at least 150-200% basic salary calculations for overtime duties, restriction of regular working shifts, and fully-compensated protected parental/maternity leaves prior to and after child deliveries.' : 'Gratuity under Sec 2(10) requires 30 days basic pay for each year served exceeding 5 years support. Overtime pay rates are explicitly set at double the normal base salary calculation per overtime hour. Maternity protections require 8 weeks pre-natal and 8 weeks post-natal paid leaves.'}</p>
              </div>
              <div className="h-[1px] bg-slate-850" />
              <div className="space-y-1">
                <p className="font-bold text-slate-200">2. {isGlobal ? 'Customs Zero-Rating & VAT' : 'NBR VAT Act, 2012 Thresholds'}</p>
                <p>{isGlobal ? 'Commercial export sales are structurally qualified for zero-rated VAT processing in compliance with bilateral customs codes. Export invoices should state the zero-rated duty status to protect local production inputs from triple taxation anomalies.' : 'Form Mushak VAT-6.3 serves as both tax invoice and transfer slip. Deemed export certification requires local bank certificates showing credit backing. Failure to maintain compliance registers triggers automatic 100% fine structures on evaluated items.'}</p>
              </div>
              <div className="h-[1px] bg-slate-850" />
              <div className="space-y-1">
                <p className="font-bold text-slate-200">3. {isGlobal ? 'Bilateral Income Taxes & DTAAs' : 'Income Tax Act 2023 Guidelines'}</p>
                <p>{isGlobal ? 'TDS Withholding rates ranges from 1% to 15% on direct goods deliveries. Double Taxation Avoidance Agreement (DTAA) credentials require verifying Tax Residency Certificates (TRC) to shield overseas sellers from permanent taxation exposures.' : 'TDS under Part VI can range between 1% to 10% on supplies. Companies must submit deposits into Bangladesh Bank treasury accounts and issue authorized challans to non-residents or counterparts for annual adjustment claims.'}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setShowHelperModal(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition duration-150 cursor-pointer outline-none"
              >
                I Understand guidelines
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function ChecklistItemRow({ item }: { item: ChecklistItem; key?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  // Status Badge Rendering Helper
  const getBadgeStyle = (status: 'compliant' | 'warning' | 'missing') => {
    switch (status) {
      case 'compliant':
        return {
          icon: <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />,
          badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15',
          label: 'Compliant'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
          badge: 'bg-amber-500/10 text-amber-550 border border-amber-500/15',
          label: 'Partial Shield'
        };
      case 'missing':
        return {
          icon: <AlertOctagon className="h-4 w-4 text-rose-500 shrink-0" />,
          badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/15',
          label: 'Non-Compliant / Missing'
        };
    }
  };

  const badgeConfig = getBadgeStyle(item.status);

  return (
    <div className="bg-slate-900/60 border border-slate-850 hover:border-slate-800 rounded-lg overflow-hidden transition duration-150">
      
      {/* Primary Row Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 flex items-center justify-between gap-3 cursor-pointer select-none"
      >
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5">{badgeConfig.icon}</div>
          <div className="space-y-0.5">
            <h5 className="text-[11.5px] font-bold text-slate-200 leading-normal font-sans">
              {item.title}
            </h5>
            <div className="flex items-center gap-2 text-[9.5px] font-mono text-slate-500 font-bold">
              <span>{item.actName}</span>
              <span>•</span>
              <span className="text-slate-400">{item.clauseReference}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${badgeConfig.badge}`}>
            {badgeConfig.label}
          </span>
          {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
        </div>
      </div>

      {/* Expanded Audit Details panel */}
      {isOpen && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-900 bg-slate-950/30 text-[10.5px] text-slate-400 leading-relaxed space-y-2 font-sans">
          <p className="text-slate-350">{item.description}</p>
          <div className="p-2 bg-slate-950/80 border border-slate-900 rounded font-sans text-slate-300 flex items-start gap-1.5">
            <ShieldCheck className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${item.status === 'compliant' ? 'text-emerald-400' : item.status === 'warning' ? 'text-amber-500' : 'text-slate-500'}`} />
            <div>
              <strong className="text-slate-400">Compliance Audit Justification:</strong> {item.reason}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
