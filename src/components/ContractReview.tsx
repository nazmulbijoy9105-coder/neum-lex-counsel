import React, { useState, useEffect } from 'react';
import { 
  FileText, ShieldCheck, Loader2, Play, Plus, Trash, AlertTriangle, 
  Sparkles, Save, CheckCircle, Calendar, Upload, AlertOctagon, HelpCircle, ShieldAlert, Printer, Download
} from 'lucide-react';
import { User, RiskItem, MissingTerm, ContractDoc } from '../types';
import RegulatoryChecklist from './RegulatoryChecklist';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ContractReviewProps {
  user: User;
  onSavedSuccess: () => void;
  addToast?: (toast: any) => void;
}

export default function ContractReview({ user, onSavedSuccess, addToast }: ContractReviewProps) {
  const [contractName, setContractName] = useState('');
  const [contractContent, setContractContent] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Corporate & Investment Agreements');
  const [jurisdiction, setJurisdiction] = useState<'bangladesh' | 'global'>('bangladesh');
  const [dragActive, setDragActive] = useState(false);
  const [pdfExporting, setPdfExporting] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setContractContent(text);
        const fileNameNoExt = file.name.replace(/\.[^/.]+$/, "");
        setContractName(fileNameNoExt);
        setSavedSuccessMsg(`Successfully imported raw terms from file: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
      }
    };
    reader.onerror = () => {
      setError("Failed to read the selected file.");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };
  
  // THEMATIC CATEGORIES METADATA DIRECTORY (including specific Bangladesh focus points)
  const THEMATIC_CATEGORIES_METADATA = [
    {
      id: "corp",
      name: "Corporate & Investment Agreements",
      subtypes: ["Share Purchase Agreement (SPA)", "Share Subscription Agreement (SSA)", "Shareholders' Agreement (SHA)", "Joint Venture Agreement (JVA)", "Convertible Note", "SAFE Agreements", "Founder Agreement", "Voting Agreement", "Drag-Along / Tag-Along"],
      focus: [
        "BIDA registration approvals for foreign incoming capital injections",
        "National Board of Revenue (NBR) rules on capital gains taxes calculation \& declarations",
        "RJSC Form VI \& Form IX filings for share transfer completions within periods",
        "Bangladesh Bank rules under Foreign Exchange Regulation Act (FERA) 1947 for dividend repatriation compliance"
      ]
    },
    {
      id: "fdi",
      name: "Foreign Investment & Cross-Border Agreements",
      subtypes: ["FDI Agreement", "Technical Collaboration Agreement", "Technology Transfer Agreement", "Foreign Loan Agreement", "Intercompany Service Agreement", "Cost Sharing Agreement", "Cross-Border Consulting"],
      focus: [
        "Bangladesh Bank prior approvals for long-term private sector foreign borrowing",
        "Guidelines on outward remittances for technical services and royalty payments limit (6% cap unless approved)",
        "Withholding Taxes (WHT) on international cross-border technical services payments",
        "Permanent Establishment (PE) tax asset exposure risks under Double Taxation Treaties (DTAA)"
      ]
    },
    {
      id: "comm",
      name: "Commercial Contracts",
      subtypes: ["Supply Agreement", "Purchase Agreement", "Vendor Agreement", "Framework Agreement", "Manufacturing Agreement", "OEM Agreement", "Service Agreement", "Consulting Agreement"],
      focus: [
        "Standard liability caps and mutual indemnity definitions",
        "Contract Act 1872 standard breach liabilities \& default remediation cures",
        "Specific performance remedies under Specific Relief Act 1877 constraints",
        "Local currency payment statutory interest limits configuration"
      ]
    },
    {
      id: "trade",
      name: "International Trade Agreements",
      subtypes: ["Import Agreement", "Export Agreement", "Distribution Agreement", "Freight Forwarding Contract", "Shipping Agreement", "Customs Brokerage", "Warehousing Agreement"],
      focus: [
        "Incoterms shipping risk transmission line division",
        "Back-to-Back Letter of Credit (LC) realizations & statutory garment export limits",
        "Import Policy Order compliance and Chittagong Port customs clearance assessments",
        "Adherence to UCP 600 global letters of credit commercial rules"
      ]
    },
    {
      id: "tech",
      name: "Technology & Digital Agreements",
      subtypes: ["Software Development Agreement", "SaaS Agreement", "Software License", "End User License (EULA)", "Cloud Services Agreement", "Data Processing Agreement", "IT Outsourcing", "Cybersecurity Service"],
      focus: [
        "Sovereign data hosting guidelines & localization under Information and Communication Technology Act 2506",
        "Confidential corporate data privacy protections",
        "Source code intellectual property escrow ownership definitions",
        "Cybersecurity breach disclosures timeline compliance under Digital Acts"
      ]
    },
    {
      id: "hr",
      name: "Employment & HR Agreements",
      subtypes: ["Employment Agreement", "Executive Service Contract", "Director Service Agreement", "Independent Contractor Agreement", "Non-Compete Agreement", "Non-Solicitation Agreement"],
      focus: [
        "Bangladesh Labour Act, 2006 compliance for RMG industrial and corporate employees",
        "Mandatory gratuity payments and provident fund trust registration guidelines",
        "Strict statutory termination package payouts under Section 22 and Section 26",
        "Validity limits of non-compete restraint parameters inside municipal borders"
      ]
    },
    {
      id: "finance",
      name: "Banking & Finance Agreements",
      subtypes: ["Loan Agreement", "Facility Agreement", "Security Agreement", "Mortgage Deed", "Charge Documents", "Personal Guarantee", "Corporate Guarantee", "Syndicated Loan", "Islamic Finance Deed"],
      focus: [
        "Bangladesh Bank credit policy limits & banking leverage regulations",
        "RJSC Charge registration requirements on assets within the strict statutory 21 days window",
        "Sovereign exchange control guidelines under domestic central bank circulars",
        "Securitization of assets and banking lien registrations"
      ]
    },
    {
      id: "prop",
      name: "Real Estate & Infrastructure Agreements",
      subtypes: ["Lease Agreement", "Commercial Lease", "Office Lease", "Land Acquisition Deed", "Construction Contract", "EPC Contract", "Property Management Contract"],
      focus: [
        "Lease register rules under the Registration Act 1908 (mandatory registrations for terms exceeding 1 year)",
        "RAJUK construction building layout safety validation guarantees",
        "Contractual liquidated damages bounds mapping",
        "Contractor structural defect remediation warranty lengths"
      ]
    },
    {
      id: "ip",
      name: "Intellectual Property Agreements",
      subtypes: ["Trademark License", "Patent License", "Copyright Assignment", "IP Assignment Agreement", "Technology License", "Brand Licensing", "Royalty Agreement"],
      focus: [
        "Priority filings with the Department of Patents, Designs and Trademarks (DPDT) in Bangladesh",
        "Statutory IP transfer stamp duty calculations",
        "National Board of Revenue (NBR) withholding taxes on outgoing design royalties",
        "Breach of trademark infringement injunction channels under Patents & Trademarks Acts"
      ]
    },
    {
      id: "gov",
      name: "Regulatory & Government Contracts",
      subtypes: ["PPP Agreement", "Government Procurement Contract", "Donor Funded Contract", "Development Partner Contract", "Public Tender Bid Setup"],
      focus: [
        "Public Procurement Act 2006 (PPA) & Public Procurement Rules 2008 (PPR) mandatory alignments",
        "Multilateral lenders (World Bank, ADB, JICA) standard international bidding compliance parameters",
        "Bid-security refund timelines and performance bank guarantee forfeitures",
        "Local content verification requirements on municipal equipment procurements"
      ]
    },
    {
      id: "conf",
      name: "Confidentiality & Information Agreements",
      subtypes: ["NDA", "Mutual NDA", "Unilateral NDA", "Data Sharing Agreement", "Confidential Information Agreement"],
      focus: [
        "Trade secrets definitions limitations under local civil tort common law rules",
        "Non-disclosure duration validation periods limits under competition policies",
        "Equitable injunction relief declarations inside local High Court Division",
        "Carve-outs definitions for responses to court-ordered disclosures"
      ]
    },
    {
      id: "dr",
      name: "Dispute Resolution Review",
      subtypes: ["SIAC Seat Clause", "LCIA Rules Selection", "ICC Seat Clause", "UNCITRAL Arbitration Clause", "Ad-hoc Dispute Resolution"],
      focus: [
        "Enforceability of foreign arbitration awards under the Arbitration Act, 2001 (Section 45 approvals)",
        "Dhaka as seat vs international seats (Singapore SIAC, London LCIA) legal cost offsets",
        "First-stage mandatory pre-arbitration cooperative mediation triggers and timelines",
        "Interim reliefs permissions from the High Court Division under Section 7.5 of Arbitration Act"
      ]
    }
  ];

  // NLP analysis response status
  const [analysisResult, setAnalysisResult] = useState<{
    complianceScore: number;
    category?: string;
    bgFocusDetails?: string;
    riskScores?: Record<string, number> | null;
    risks: RiskItem[];
    missingTerms: MissingTerm[];
    criticalGarmentWarnings: string[];
    isFallback?: boolean;
  } | null>(null);

  const [savedDocs, setSavedDocs] = useState<ContractDoc[]>([]);
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [activeRiskFilter, setActiveRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const fetchSavedDocs = async () => {
    try {
      const res = await fetch(`/api/agreements/list?userEmail=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSavedDocs(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSavedDocs();
  }, [user.email]);

  const getDocOverallRisk = (doc: ContractDoc): 'high' | 'medium' | 'low' => {
    if (doc.risks && doc.risks.some(r => r.severity === 'high')) {
      return 'high';
    }
    if (doc.risks && doc.risks.some(r => r.severity === 'medium')) {
      return 'medium';
    }
    return 'low';
  };

  const handleLoadSavedDoc = async (doc: ContractDoc) => {
    setContractName(doc.name);
    setExpiryDate(doc.expiryDate);
    setSelectedCategory(doc.category || 'Commercial Contracts');
    setAnalysisResult({
      complianceScore: doc.complianceScore,
      category: doc.category || 'Commercial Contracts',
      bgFocusDetails: doc.bgFocusDetails || 'General compliance parameters.',
      riskScores: doc.riskScores || null,
      risks: doc.risks || [],
      missingTerms: doc.missingTerms || [],
      criticalGarmentWarnings: []
    });
    
    try {
      const res = await fetch(`/api/agreements/${doc.id}/decrypt?userEmail=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.decryptedContent) {
        setContractContent(data.decryptedContent);
      }
    } catch (e) {
      console.error(e);
    }
  };


  // Ready model patterns to paste instant raw texts
  const PRESET_TEMPLATES = [
    {
      name: "FOB garments contract (risky version)",
      category: "International Trade Agreements",
      content: "PREMIUM APPAREL EXPORT AGREEMENT\nBetween Apex Garments Dhaka and UK Imports Retailer.\n\n1. DELIVERY: The consignee insists the cargo will be loaded FOB Chittagong. However, the buyer reserves the right to postpone shipping schedules up to 60 days without payment if retail warehouse capacity holds are constrained in London.\n\n2. CANCELLATION FOR DEVIATION: Price discounts of 20% shall retroactively apply automatically to the entire shipment bulk in case of shipping delays matching custom duty bonded audits.\n\n3. LIABILITY LIMIT: Apex Garments warrants no child labour is used, but buyer assumes zero shipping liabilities or raw fabrics cost if UK customs audits dispute shipping cargo due to third-party logistics. No BGMEA mediation shall be honored.",
      type: "Garments Export Agreement",
      date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
    },
    {
      name: "Sourcing Agreement (CIF Container terms)",
      category: "International Trade Agreements",
      content: "STANDARD APPAREL PURCHASING CODE\n\n1. FOB TERMS & BOND FEES: Seller delivers to Chittagong ports. All cargo customs and port duties are the sole risk of buyer after initial carrier receipt.\n\n2. DISPUTE: Any breach shall be governed under UK trade tribunals. Local garments authorities shall not mediate. Expiry occurs 30 days after first supply delivery cycle.",
      type: "CIF Purchase Order",
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10) // Expiring soon in 30 days
    },
    {
      name: "TDS & VAT Compliant Sourcing (Deemed Exports)",
      category: "Corporate & Investment Agreements",
      content: "STANDARD DEEMED EXPORTS COVENANT\n\n1. ZERO-RATED VAT: Deemed export. Seller is a 100% export-oriented unit. Buyer shall explicitly supply standard Form VAT-6.3 under the Bangladesh Value Added Tax and Supplementary Duty Act 2012 to guarantee zero-rated processing tax exemptions.\n\n2. EXPORT SOURCE TAX (TDS): Any Tax Deducted at Source (TDS) under Section 52 of the Bangladesh Income Tax Act 2023 is capped strictly at 1.0% of gross invoice (e.g. ৳5,850 BDT / $50 USD on ৳585,000 BDT / $5,000 USD order). Buyer must deliver authentic chalans to Exporter within 30 days of standard payments.",
      type: "Tax Compliant Agreement",
      date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
    }
  ];

  const handleApplyTemplate = (tpl: typeof PRESET_TEMPLATES[0]) => {
    setContractName(tpl.name);
    setContractContent(tpl.content);
    setExpiryDate(tpl.date);
    setSelectedCategory(tpl.category);
    setAnalysisResult(null);
    setSavedSuccessMsg('');
    setError('');
  };

  const handleAnalyzeContractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractContent.trim()) return;

    setLoading(true);
    setError('');
    setSavedSuccessMsg('');
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/contract/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractName,
          contractContent,
          userEmail: user.email,
          selectedCategory: selectedCategory,
          jurisdiction: jurisdiction
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Contract NLP analysis failed');
      }

      setAnalysisResult(data);

      // Check if uploaded contract has been flagged with a 'High' risk level after NLP audit
      const highRisks = data.risks ? data.risks.filter((r: any) => r.severity === 'high') : [];
      if (highRisks.length > 0 && addToast) {
        const riskTitles = highRisks.map((r: any) => r.title).slice(0, 2).join(', ');
        const subtitle = highRisks.length > 2 ? ` (+${highRisks.length - 2} more)` : '';
        addToast({
          title: "⚠️ High Compliance Risk Flagged",
          message: `The contract "${contractName || 'Unnamed'}" has been flagged with High-level risk factors: ${riskTitles}${subtitle}`,
          type: 'high-risk',
          contractName: columnNameCleanOrVal(contractName, 'Unnamed Contract'),
          score: data.complianceScore
        });
      }
    } catch (err: any) {
      setError(err.message || 'Connecting to Gemini reviewer failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEncryptAndSave = async () => {
    if (!analysisResult || !contractContent) return;
    setSaving(true);
    setError('');
    setSavedSuccessMsg('');

    try {
      const response = await fetch('/api/agreements/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: columnNameCleanOrVal(contractName, 'Standard Export Agreement'),
          type: 'Garments Sourcing Contract',
          content: contractContent,
          risks: analysisResult.risks,
          missingTerms: analysisResult.missingTerms,
          complianceScore: analysisResult.complianceScore,
          category: analysisResult.category || selectedCategory,
          bgFocusDetails: analysisResult.bgFocusDetails || 'Review evaluation complete.',
          riskScores: analysisResult.riskScores || null,
          expiryDate: expiryDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          userEmail: user.email
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Encryption/storage failed');
      }

      setSavedSuccessMsg(`Document encrypted securely! Secure Code fingerprint registers as: ${data.secureCode}. Storage tally: ${data.encryptedSize} encrypted payload bytes.`);
      fetchSavedDocs(); // Refresh locally loaded documents selection list
      onSavedSuccess(); // Refresh dashboard list of contracts
    } catch (err: any) {
      setError(err.message || 'Storage failed');
    } finally {
      setSaving(false);
    }
  };

  const columnNameCleanOrVal = (str: string, fallback: string) => {
    return str.trim() !== '' ? str : fallback;
  };

  const handleExportPDF = async () => {
    if (!analysisResult) return;
    setPdfExporting(true);
    try {
      const reportEl = document.getElementById('printable-audit-report');
      if (!reportEl) {
        throw new Error("Printable report element not found");
      }

      // Clone the printable block
      const clone = reportEl.cloneNode(true) as HTMLElement;
      clone.id = 'pdf-report-clone';
      
      // Remove 'hidden' and 'print:block' responsive classes so it renders
      clone.classList.remove('hidden', 'print:block');
      
      // Override responsive styling so that it behaves as a full-size elegant standard-width sheet of paper in the virtual render.
      clone.style.width = '800px';
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.display = 'block';
      clone.style.visibility = 'visible';
      clone.style.backgroundColor = '#ffffff';
      clone.style.color = '#0b0f19'; // Keep text dark for high contrast
      clone.style.padding = '40px';
      
      // Ensure specific elements have high contrast rendering
      const textElements = clone.querySelectorAll('.text-slate-500, .text-slate-600, .text-slate-700, .text-slate-800');
      textElements.forEach((el: any) => {
        el.style.color = '#334155'; // Clean charcoal color for readability
      });

      document.body.appendChild(clone);

      // Rendering high resolution canvas
      const canvas = await html2canvas(clone, {
        scale: 2, // 2x density for pristine typography vectors
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Remove cloned element from DOM
      document.body.removeChild(clone);

      // Create PDF Document using standard A4 sizing configuration
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Process first page segment
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
      
      // Slicing additional segments for high quality multi-page overflow
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
      
      const fileSafeName = (contractName || 'Sourcing_Audit_Report')
        .trim()
        .replace(/[^a-z0-9_-]/gi, '_')
        .replace(/_+/g, '_');
      
      pdf.save(`NeumLex_Audit_Report_${fileSafeName}.pdf`);
      
      if (addToast) {
        addToast({
          id: 'pdf-success',
          type: 'success',
          title: 'PDF Export Complete',
          message: 'The professional contract audit report has been downloaded successfully.'
        });
      }
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      setError(err.message || "Failed to generate professional PDF report.");
    } finally {
      setPdfExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Intro */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase">
          <FileText className="h-4.5 w-4.5 text-emerald-500" />
          RMG Export Contract Review Engine (NLP NLP)
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Provides automated auditing for multi-lateral garments sales, CIF contracts, bonded warehouse warranties and force majeure delay declarations. Identify missing terms and penalty triggers before signing and lock documentation with direct AES-256 database cryptographic storage.
        </p>
      </div>

      {/* PRIORITIZE URGENT AUDITS SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-emerald-500" />
              Prioritize Urgent Audits: Secure Vault Documents
            </h4>
            <p className="text-[10px] text-slate-400 mt-1">
              Select any previously saved, encrypted document from the secure vault, filtered by its evaluated risk severity level, to instantly load and audit.
            </p>
          </div>

          {/* Filtering Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold select-none">
              Filter by Risk Level:
            </span>
            <select
              id="risk-level-filter"
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-350 outline-none focus:border-emerald-500 font-mono cursor-pointer"
            >
              <option value="all">⚠️ All Risks Combined</option>
              <option value="high">🚨 High Risk Only</option>
              <option value="medium">⚡ Medium Risk Only</option>
              <option value="low">✓ Low Risk Only</option>
            </select>
          </div>
        </div>

        {/* Saved Contracts Cards */}
        {savedDocs.length === 0 ? (
          <div className="bg-slate-950 border border-slate-850 p-6 rounded-lg text-center text-slate-400 text-xs italic">
            Your document vault is currently empty. Analyze a contract below and save it to begin tracking risk priorities!
          </div>
        ) : savedDocs.filter(doc => selectedRiskFilter === 'all' || getDocOverallRisk(doc) === selectedRiskFilter).length === 0 ? (
          <div className="bg-slate-950 border border-slate-850 p-6 rounded-lg text-center text-slate-400 text-xs italic">
            No secure documents found matching &quot;{selectedRiskFilter}&quot; severity filter level in the current workspace.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {savedDocs
              .filter(doc => selectedRiskFilter === 'all' || getDocOverallRisk(doc) === selectedRiskFilter)
              .map((doc) => {
                const overallRisk = getDocOverallRisk(doc);
                return (
                  <button
                    key={doc.id}
                    onClick={() => handleLoadSavedDoc(doc)}
                    className="bg-slate-950 hover:bg-slate-900/60 p-3 rounded-lg border border-slate-850 text-left transition cursor-pointer flex flex-col justify-between h-[110px] group focus:border-emerald-500 outline-none w-full"
                  >
                    <div className="w-full">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-semibold text-slate-200 truncate block max-w-[150px] group-hover:text-emerald-500">
                          {doc.name}
                        </span>
                        <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded uppercase shrink-0 border ${
                          overallRisk === 'high'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : overallRisk === 'medium'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-505 border-emerald-500/20'
                        }`}>
                          {overallRisk} risk
                        </span>
                      </div>
                      <p className="text-[9.5px] text-slate-500 mt-1 font-mono">
                        Validity Expiry: {doc.expiryDate}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center w-full border-t border-slate-900/80 pt-2 mt-2">
                      <span className="text-[9px] text-slate-400 font-mono">
                        Score: {doc.complianceScore}%
                      </span>
                      <span className="text-[10px] text-emerald-500 group-hover:text-emerald-450 uppercase tracking-wider font-mono font-bold flex items-center gap-0.5">
                        Load & Audit &rarr;
                      </span>
                    </div>
                  </button>
                );
              })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CONTRACT EDITOR / PASTER */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-slate-200 tracking-wider font-mono uppercase">Active Document Sourcing</h4>
              <div className="flex gap-2">
                {PRESET_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => handleApplyTemplate(tpl)}
                    className="text-[10px] bg-slate-950 font-mono text-slate-400 hover:text-emerald-400 px-2 py-1 rounded border border-slate-850 hover:border-slate-700 transition cursor-pointer"
                  >
                    Template {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAnalyzeContractSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Contract Title</label>
                <input
                  id="input-contract-name"
                  type="text"
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  placeholder="Apex garments export to UK-Matalan standard terms"
                  className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-white focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Target Laws & Jurisdiction Lens</label>
                  <select
                    id="select-audit-jurisdiction"
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-white focus:border-emerald-500 outline-none cursor-pointer font-sans"
                  >
                    <option value="bangladesh">🇧🇩 Bangladesh Sovereign Law & RMG Codes</option>
                    <option value="global">🌐 International Trade, ILO & OECD Model Rules</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Contract Category / Review Module Focus</label>
                  <select
                    id="select-contract-category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-white focus:border-emerald-500 outline-none cursor-pointer font-sans"
                  >
                    {THEMATIC_CATEGORIES_METADATA.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        💼 {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
                
                {/* Bangladesh Review Focus checklist for dynamic preview */}
                {(() => {
                  const currentMeta = THEMATIC_CATEGORIES_METADATA.find(c => c.name === selectedCategory);
                  if (!currentMeta) return null;
                  return (
                    <div className="mt-2.5 bg-slate-950/60 border border-slate-850/60 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                          🎯 Bangladesh Review Focus Points
                        </span>
                        <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15">
                          Active Policy Lens
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-slate-400 font-sans italic leading-relaxed">
                        NeumLex will automatically audit the agreements for the following specific regulations:
                      </p>
                      
                      <ul className="space-y-1.5 pl-0.5 mt-2">
                        {currentMeta.focus.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[10.5px] text-slate-300 leading-normal">
                            <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
                            <span className="font-sans text-slate-350">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="pt-2 border-t border-slate-900/60 flex flex-wrap gap-1 items-center">
                        <span className="text-[8.5px] font-mono text-slate-500 uppercase font-bold mr-1">Triage Subtypes:</span>
                        {currentMeta.subtypes.slice(0, 3).map((sub, idx) => (
                          <span key={idx} className="text-[8.5px] font-mono bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800/60">
                            {sub}
                          </span>
                        ))}
                        {currentMeta.subtypes.length > 3 && (
                          <span className="text-[8.5px] font-mono bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800/60">
                            +{currentMeta.subtypes.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Target Expiry Date (Expiry Reminders Trigger baseline)</label>
                <input
                  id="input-contract-expiry"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-300 focus:border-emerald-500 outline-none font-mono"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Specify real commercial validity. Warn triggers occurs 30/10 days before.</span>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Contract terms text (Upload file or copy-paste below)</label>
                
                {/* Drag and Drop File Uploader Zone */}
                <div 
                  id="contract-dropzone"
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => {
                    const el = document.getElementById('contract-file-input');
                    if (el) el.click();
                  }}
                  className={`border border-dashed rounded-lg p-5 mb-3 text-center cursor-pointer transition duration-150 ${
                    dragActive 
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-350' 
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/70 text-slate-450'
                  }`}
                >
                  <input
                    id="contract-file-input"
                    type="file"
                    accept=".txt,.md"
                    className="hidden font-sans"
                    onChange={handleFileChange}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Upload className={`h-6 w-6 mx-auto mb-2 transition-transform duration-200 ${dragActive ? 'text-emerald-400 scale-110 animate-pulse' : 'text-slate-500'}`} />
                  <p className="text-xs font-semibold text-slate-200 font-sans">
                    {dragActive ? "Drop the contract here!" : "Drag & drop your contract terms file (.txt, .md), or click to select"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    Regional sovereign decryption pipeline handles imported streams securely
                  </p>
                </div>

                <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950 focus-within:border-emerald-500 transition">
                  <textarea
                    id="input-contract-body"
                    value={contractContent}
                    onChange={(e) => setContractContent(e.target.value)}
                    placeholder="OR COPY & PASTE SENSITIVE CONTRACT DETAILS HERE..."
                    rows={10}
                    className="w-full bg-transparent p-3 text-xs text-slate-300 placeholder-slate-700 outline-none resize-none font-mono leading-relaxed"
                    required
                  />
                  <div className="bg-slate-900 px-3 py-1.5 border-t border-slate-850 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>Format: raw ASCII/UTF-8 Text reviews</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <ShieldCheck className="h-3 w-3 text-emerald-500" />
                      Encrypted pipeline configured
                    </span>
                  </div>
                </div>
              </div>

              <button
                id="btn-trigger-contract-audit"
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg text-xs tracking-wider uppercase transition flex items-center justify-center gap-1.5 cursor-pointer font-mono"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Reviewing contract structure lines via GenAI...
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 text-white fill-white" />
                    Commence NLP Compliance Audit
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* NLP AUDITED FRAME DISPLAY */}
        <div id="contract-audit-results-pane" className="space-y-4">
          
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
              ❌ {error}
            </div>
          )}

          {savedSuccessMsg && (
            <div id="crypto-saved-success" className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl space-y-2 font-mono">
              <div className="flex items-center gap-2 font-bold text-white uppercase text-[10px]">
                <CheckCircle className="h-4 w-4 text-emerald-400 animate-pulse" />
                Vessel Document Encrypted & Recorded
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{savedSuccessMsg}</p>
              <div className="bg-slate-950 p-2 border border-slate-800 rounded text-[10px] text-slate-400 select-all">
                Sovereign Code: {savedSuccessMsg.split('fingerprint registers as: ')[1]?.split('.')[0] || 'NEUMLEX-SECURE-KEY'}
              </div>
            </div>
          )}

          {!analysisResult && !loading && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
              <FileText className="h-10 w-10 text-slate-800 animate-pulse" />
              <div>
                <p className="font-semibold block text-slate-400">Auditor Stream Closed</p>
                <p className="text-[10px] text-slate-650 max-w-sm mx-auto mt-1">
                  Once your copy contract terms text is parsed via regional NLP models, risks regarding garments FOB delays, forced certifications, buyer’s payment breach liability lines will display detailed safety indexes.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 text-center text-slate-400 text-xs space-y-3">
              <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mx-auto" />
              <p className="font-mono tracking-widest uppercase">Executing Regulatory Contract Parsing...</p>
              <p className="text-[10px] text-slate-400 font-sans max-w-xs mx-auto">
                Comparing risk parameters under BGMEA standard arbitration policies and external EU customs enforcement guidelines.
              </p>
            </div>
          )}

          {analysisResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4 p-5 md:p-6 animate-fade-in no-print">
              
              {/* Compliance score header */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-950 font-bold whitespace-nowrap">
                    Audit Status: Done
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">Sourcing Compliance Report</h4>
                </div>
                
                {/* Score visualization circular bar style */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportPDF}
                    disabled={pdfExporting}
                    className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 disabled:opacity-50 border border-slate-850 text-slate-300 hover:text-slate-100 font-mono text-[10px] px-3.5 py-1.5 rounded font-bold transition whitespace-nowrap cursor-pointer shadow uppercase"
                    title="Export custom styled PDF review document"
                  >
                    {pdfExporting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Export PDF</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 hover:text-slate-100 font-mono text-[10px] px-3.5 py-1.5 rounded font-bold transition whitespace-nowrap cursor-pointer shadow uppercase"
                    title="Export printer-friendly document layout"
                  >
                    <Printer className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Print Report</span>
                  </button>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Sourcing Clean Score</span>
                    <span className={`text-2xl font-bold font-mono ${
                      analysisResult.complianceScore >= 80 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>{analysisResult.complianceScore}%</span>
                  </div>
                </div>
              </div>

              {/* ACTIVE THEMATIC CATEGORY & FOCUS DETAILS */}
              <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold">
                    Thematic Review Module Identified
                  </span>
                  <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-455 px-2 py-0.5 rounded border border-emerald-950">
                    {analysisResult.category || selectedCategory}
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-medium font-sans">
                  {analysisResult.category || selectedCategory}
                </p>
                <div className="text-[11px] text-slate-400 font-sans leading-relaxed pt-1.5 border-t border-slate-900 flex gap-2 items-start">
                  <span className="text-emerald-500 font-bold shrink-0">ℹ</span>
                  <div>
                    <strong className="text-slate-300">Bangladesh Focus Context:</strong> {analysisResult.bgFocusDetails || "Evaluated under local statutory guidelines and double-taxation treaties."}
                  </div>
                </div>
              </div>

              {/* 10 ADVANCED AI RISK SCORE SCORER PANEL */}
              <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 space-y-4">
                <div className="border-b border-slate-900 pb-2 flex justify-between items-center">
                  <span className="text-[10px] tracking-wider font-mono font-bold text-slate-300 uppercase">
                    Advanced AI Review Modules (10-Dimensional Matrix)
                  </span>
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase">
                    Risk Assessment Scores (higher is safer)
                  </span>
                </div>

                {(() => {
                  const resolvedScores = {
                    regulatory: 75,
                    tax: 70,
                    foreignExchange: 80,
                    corporateGovernance: 85,
                    dispute: 75,
                    dataPrivacy: 90,
                    antiCorruption: 85,
                    sanctions: 100,
                    procurementCompliance: 80,
                    enforceability: 75,
                    ...(analysisResult.riskScores || {})
                  };

                  const riskLabels = [
                    { key: 'regulatory', label: 'Regulatory Risk', desc: 'BIDA registrations, RJSC papers, RAJUK clearance protocols' },
                    { key: 'tax', label: 'Tax Risk (VAT / TDS)', desc: 'Section 52 1% TDS, zero-rated Form VAT-6.3 and NBR statutory directives' },
                    { key: 'foreignExchange', label: 'Foreign Exchange Risk', desc: 'Outward remittance caps, Bangladesh Bank borrowing licenses FERA 1947' },
                    { key: 'corporateGovernance', label: 'Corporate Governance Risk', desc: 'Board resolutions validation, director powers cap, and minority partner votes' },
                    { key: 'dispute', label: 'Dispute & Arbitration Risk', desc: 'Local Arbitration Act 2001 enforcement, SIAC/London seat offsets' },
                    { key: 'dataPrivacy', label: 'Data Privacy Risk', desc: 'Sovereign hosting limits under local cyber codes, GDPR/confidentiality' },
                    { key: 'antiCorruption', label: 'Anti-Corruption Risk', desc: 'Integrity safeguards, domestic anti-bribery declarations compliance' },
                    { key: 'sanctions', label: 'Sanctions Risk', desc: 'OFAC list screening, double-taxation lists, international embargoes' },
                    { key: 'procurementCompliance', label: 'Procurement Compliance', desc: 'PPA 2006 / PPR 2008 tendering rules, public tender bid allocations' },
                    { key: 'enforceability', label: 'Enforceability Risk', desc: 'Validity of contractual claim pathways inside appellate & civil jurisdictions' }
                  ];

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                      {riskLabels.map((lbl) => {
                        const val = (resolvedScores as any)[lbl.key] ?? 70;
                        const riskLevel = val >= 80 ? 'Safe' : val >= 60 ? 'Moderate' : 'Critical';
                        const badgeColor = 
                          riskLevel === 'Safe' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                            : riskLevel === 'Moderate'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/15'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/15';

                        const barColor = 
                          riskLevel === 'Safe' 
                            ? 'bg-emerald-500' 
                            : riskLevel === 'Moderate' 
                            ? 'bg-amber-500' 
                            : 'bg-rose-500';

                        return (
                          <div key={lbl.key} className="space-y-1.5 p-2 bg-slate-900/40 rounded border border-slate-850/60 hover:border-slate-800 transition">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-semibold text-slate-200 font-sans">{lbl.label}</span>
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className={`text-[8px] font-bold uppercase px-1 py-0.2 rounded ${badgeColor}`}>
                                  {riskLevel}
                                </span>
                                <span className="text-slate-350 font-bold ml-0.5">{val}/100</span>
                              </div>
                            </div>
                            
                            {/* Visual Progress Line */}
                            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden font-sans">
                              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${val}%` }}></div>
                            </div>
                            
                            {/* Short explanation for Bangladesh legality */}
                            <p className="text-[9.5px] text-slate-500 font-sans leading-relaxed">
                              {lbl.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* COMPREHENSIVE REGULATORY COMPLIANCE CHECKLIST */}
              <RegulatoryChecklist content={contractContent} jurisdiction={jurisdiction} />
              
              {/* Fallback Banner */}
              {analysisResult.isFallback && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg p-3 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="font-bold uppercase tracking-wider text-[10px] text-amber-400 font-mono">Offline Compliance Triage Active</p>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      The primary Gemini AI network is currently experiencing high demand. NeumLex has activated safe static compliance risk parsing and BGMEA contract directives automatically to avoid service interruptions.
                    </p>
                  </div>
                </div>
              )}

              {/* Warnings listing */}
              {analysisResult.criticalGarmentWarnings && analysisResult.criticalGarmentWarnings.length > 0 && (
                <div className="bg-amber-950/10 border border-amber-900 rounded-lg p-3 text-xs text-amber-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider font-mono text-[10px]">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Critical Garment Warning Directives
                  </div>
                  <ul className="list-disc pl-4 space-y-1 font-sans mt-1 text-[11px] leading-relaxed">
                    {analysisResult.criticalGarmentWarnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risky Clauses Table */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] uppercase font-bold text-rose-450 block tracking-wider">Identified Risk Clauses</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-slate-400 uppercase select-none">Show Level:</span>
                    <select
                      value={activeRiskFilter}
                      onChange={(e) => setActiveRiskFilter(e.target.value as any)}
                      className="bg-slate-950 border border-slate-850 rounded px-1.5 py-0.5 text-[10px] text-slate-300 outline-none focus:border-emerald-500 font-mono cursor-pointer"
                    >
                      <option value="all">All ({analysisResult.risks.length})</option>
                      <option value="high">High ({analysisResult.risks.filter(r => r.severity === 'high').length})</option>
                      <option value="medium">Medium ({analysisResult.risks.filter(r => r.severity === 'medium').length})</option>
                      <option value="low">Low ({analysisResult.risks.filter(r => r.severity === 'low').length})</option>
                    </select>
                  </div>
                </div>

                {analysisResult.risks && analysisResult.risks.length === 0 ? (
                  <div className="py-2 text-[11px] text-emerald-450 font-mono">✓ Excellent: No high risk garments or logistics liabilities matches triggered.</div>
                ) : analysisResult.risks.filter(risk => activeRiskFilter === 'all' || risk.severity === activeRiskFilter).length === 0 ? (
                  <div className="py-3 text-[11px] text-slate-500 font-mono bg-slate-950 border border-slate-850 rounded-lg text-center">No risks found for level: &quot;{activeRiskFilter}&quot;.</div>
                ) : (
                  <div className="space-y-3">
                    {analysisResult.risks
                      .filter(risk => activeRiskFilter === 'all' || risk.severity === activeRiskFilter)
                      .map((risk, index) => (
                        <div key={index} className="bg-slate-950 border border-slate-850 rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-xs text-slate-200">{risk.title}</span>
                            <span className={`text-[9px] uppercase font-mono px-1.5 border rounded font-semibold ${
                              risk.severity === 'high' 
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            }`}>
                              {risk.severity} Risk
                            </span>
                          </div>
                          <div className="bg-slate-900 border border-slate-950 p-2 rounded text-[11px] text-slate-400 font-mono border-l-2 border-rose-500">
                            &quot;{risk.clause}&quot;
                          </div>
                          <p className="text-[11px] text-slate-350 leading-relaxed font-sans">
                            💡 <strong className="text-slate-200">Mitigation:</strong> {risk.recommendation}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Missing clauses recommendations */}
              <div className="space-y-3 pt-2">
                <span className="font-mono text-[10px] uppercase font-bold text-teal-400 block tracking-wider">Missing Essential Terms & Safeguards</span>
                <div className="space-y-2">
                  {analysisResult.missingTerms && analysisResult.missingTerms.map((term, index) => (
                    <div key={index} className="bg-slate-950 border border-slate-850 p-3.5 rounded-lg space-y-1.5">
                      <h5 className="text-xs font-bold text-slate-200">{term.title}</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{term.impact}</p>
                      <div className="p-2.5 bg-slate-900 rounded font-mono text-[10px] text-slate-300 border border-slate-800">
                        <span className="text-[9px] uppercase tracking-wide text-emerald-400 block font-bold mb-1 font-mono">Suggested Clause Boilerplate</span>
                        {term.recommendedText}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ENCRYPT SAVE TO DISK CONTROLLER */}
              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between gap-4">
                <p className="text-[10px] text-slate-500 max-w-sm font-sans">
                  Apply regional physical governance. Saving encrypts the raw contract text using custom AES-256 before disk allocation.
                </p>
                <button
                  id="btn-encrypt-save-contract"
                  onClick={handleEncryptAndSave}
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 text-white font-mono text-[10px] px-3.5 py-1.5 rounded flex items-center gap-1.5 font-bold transition whitespace-nowrap cursor-pointer shadow-lg shadow-emerald-950 uppercase"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Encrypting Cipher Block...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      Encrypt & Save to Vault
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {analysisResult && (
            <div id="printable-audit-report" className="hidden print:block font-sans text-slate-950 bg-white p-4 max-w-4xl mx-auto space-y-8 leading-relaxed text-justify">
              {/* Report Header Letterhead */}
              <div className="text-center border-b-2 border-slate-950 pb-4 space-y-1">
                <div className="text-[10px] tracking-[0.2em] font-bold text-slate-500 uppercase font-mono">
                  {jurisdiction === 'global' ? 'Sovereign Legal Intelligence Registry • Global Trade Division' : 'Sovereign Legal Intelligence Registry • Bangladesh Division'}
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 uppercase font-sans">
                  NeumLex Sourcing Audit Report
                </h1>
                <p className="text-xs text-slate-500 font-mono">
                  {jurisdiction === 'global' 
                    ? 'Sovereign Compliance & Global Trade Policy Assurance matching'
                    : 'Sovereign Compliance & Domestic Regulatory Policy Assurance matching'}
                </p>
              </div>

              {/* Document Overview Metadata Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">
                  I. AUDITED DOCUMENT METADATA REGISTER
                </h3>
                <table className="w-full text-xs border border-slate-350 border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 font-bold font-mono bg-slate-50 border-r border-slate-300 w-1/4 uppercase">Contract Reference</td>
                      <td className="p-2 font-sans font-semibold text-slate-900 w-3/4">{contractName || 'Unnamed Sourcing stream'}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 font-bold font-mono bg-slate-50 border-r border-slate-300 uppercase">Thematic Module</td>
                      <td className="p-2 font-sans text-slate-800">{analysisResult.category || selectedCategory}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 font-bold font-mono bg-slate-50 border-r border-slate-300 uppercase">Audited Client</td>
                      <td className="p-2 font-mono text-slate-800">{user.email}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 font-bold font-mono bg-slate-50 border-r border-slate-300 uppercase">Audit Assessment Score</td>
                      <td className="p-2 font-mono text-slate-900 font-bold col-span-3">
                        {analysisResult.complianceScore}% Aligned (Clean Rating: {analysisResult.complianceScore >= 80 ? 'EXCELLENT' : 'MODERATE WARN'})
                      </td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 font-bold font-mono bg-slate-50 border-r border-slate-300 uppercase">Regional Target Expiry</td>
                      <td className="p-2 font-mono text-slate-800">{expiryDate || 'No Limit Window Set'}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 font-bold font-mono bg-slate-50 border-r border-slate-300 uppercase">Audit System Timestamp</td>
                      <td className="p-2 font-mono text-slate-850">{new Date().toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Executive Summary / regional focus context */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">
                  II. EXECUTIVE AUDITOR SUMMARY
                </h3>
                <div className="p-4 bg-slate-50 border border-slate-300 rounded text-xs space-y-1.5 font-sans">
                  <p className="font-semibold text-slate-900">
                    {jurisdiction === 'global' ? 'Global Trade Focus Context & Sovereign Protection Protocol' : 'Bangladesh Focus Context & Sovereign Protection Protocol'}
                  </p>
                  <p className="text-slate-700 leading-relaxed text-justify">
                    {analysisResult.bgFocusDetails || "Vetted in compliance with domestic statutory codes and foreign-exchange rules."}
                  </p>
                </div>
              </div>

              {/* 10-Dimensional Risk Matrix Score Matrix */}
              <div className="space-y-2 print-avoid-break">
                <h3 className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">
                  III. 10-DIMENSIONAL RISK MATRIX INDEXES
                </h3>
                <table className="w-full text-[11px] border border-slate-350 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-350 font-mono text-left">
                      <th className="p-2 font-bold uppercase border-r border-slate-350">Regulatory Sector dimension</th>
                      <th className="p-2 font-bold uppercase border-r border-slate-350 text-center w-24">Risk Score</th>
                      <th className="p-2 font-bold uppercase text-center w-28">Safety Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const scores = {
                        regulatory: 75,
                        tax: 70,
                        foreignExchange: 80,
                        corporateGovernance: 85,
                        dispute: 75,
                        dataPrivacy: 90,
                        antiCorruption: 85,
                        sanctions: 100,
                        procurementCompliance: 80,
                        enforceability: 75,
                        ...(analysisResult.riskScores || {})
                      };

                      const labels = [
                        { key: 'regulatory', label: 'Regulatory Filing & Licensing Risk' },
                        { key: 'tax', label: 'TDS Withholding & VAT Compliance Risk' },
                        { key: 'foreignExchange', label: jurisdiction === 'global' ? 'International Cross-border Outbound Transfers & Currency Risk' : 'Bangladesh Bank Outbound Transfers & Currency Risk' },
                        { key: 'corporateGovernance', label: 'Board Resolutions & Governance Validity Risk' },
                        { key: 'dispute', label: jurisdiction === 'global' ? 'Global Dispute Resolution & UNCITRAL Enforcement Risk' : 'Local Dispute & Arbitration Enforceability Risk' },
                        { key: 'dataPrivacy', label: jurisdiction === 'global' ? 'Global Cyber Security & Data Privacy Compliance Risk' : 'Sovereign Hosting & Local Cyber Code Risk' },
                        { key: 'antiCorruption', label: 'Anti-Corruption & Integrity Code Risk' },
                        { key: 'sanctions', label: 'OFAC Sandboxing & Embassy Sanctions Risk' },
                        { key: 'procurementCompliance', label: jurisdiction === 'global' ? 'Government Tendering & Procurement Compliance Risk' : 'Public Tendering (PPA 2006/PPR 2008) Risk' },
                        { key: 'enforceability', label: 'Civil Procedure Claim Enforcement & Contract Validity' }
                      ];

                      return labels.map((lbl, idx) => {
                        const val = (scores as any)[lbl.key] ?? 70;
                        const riskClass = val >= 80 ? 'SAFE' : val >= 60 ? 'MODERATE' : 'CRITICAL';
                        return (
                          <tr key={idx} className="border-b border-slate-350">
                            <td className="p-2 font-sans text-slate-800 border-r border-slate-350">{lbl.label}</td>
                            <td className="p-2 font-mono text-center border-r border-slate-350 text-slate-900 font-semibold">{val}%</td>
                            <td className={`p-2 font-mono text-center font-bold ${
                              riskClass === 'SAFE' ? 'text-emerald-700' : riskClass === 'MODERATE' ? 'text-amber-700' : 'text-rose-700'
                            }`}>{riskClass}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Regional Regulatory Compliance Checklist Report */}
              <div className="space-y-2 print-avoid-break">
                <h3 className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">
                  IV. {jurisdiction === 'global' ? 'INTERNATIONAL STRATEGIC COMPLIANCE MATCHES' : 'SOVEREIGN STATUTORY COMPLIANCE MATCHES'}
                </h3>
                <div className="space-y-4">
                  {(() => {
                    const textContent = (contractContent || '').toLowerCase();
                    const isGlobal = jurisdiction === 'global';
 
                    const sections = [
                      {
                        title: isGlobal ? "1. ILO Labour & Fair Employment Standards" : "1. Bangladesh Labour Act 2006 Mandates",
                        items: [
                          {
                            item: isGlobal ? "Welfare Funds & Retirement Gratuities" : "Section 234/235: Gratuity & Workers Provident Fund Trust",
                            status: textContent.includes('gratuity') || textContent.includes('provident fund') || textContent.includes('provident')
                              ? 'COMPLIANT' : textContent.includes('benefit') || textContent.includes('bonus') ? 'PARTIAL SHIELD' : 'NON-COMPLIANT / MISSING',
                            ref: isGlobal ? "ILO Convention 102" : "Chapter XV / Section 234",
                            desc: isGlobal ? "Requires establishment of active pension/provident funds and employee eligibility gratuity schemes." : "Explicit reference to gratuity trusts or provident fund provisions."
                          },
                          {
                            item: isGlobal ? "Termination Notice & Contract Severance Terms" : "Section 20/26: Retrenchment Compensation & Notice Delivery",
                            status: textContent.includes('termination') && (textContent.includes('notice') || textContent.includes('severance') || textContent.includes('pay-in-lieu'))
                              ? 'COMPLIANT' : textContent.includes('termination') ? 'PARTIAL SHIELD' : 'NON-COMPLIANT / MISSING',
                            ref: isGlobal ? "ILO Termination Recommendation 166" : "Chapter II / Section 20-26",
                            desc: isGlobal ? "Ensures fair contractual notification periods and structured severance payouts based on service duration." : "Termination sequence notice periods (30-120 days) and severance buffers."
                          },
                          {
                            item: isGlobal ? "Maximum Work Shifts & Paid Overtime Caps" : "Section 100/108: Working Hours Limits & Premium Overtime",
                            status: textContent.includes('overtime') || textContent.includes('working hours') || textContent.includes('shifts')
                              ? 'COMPLIANT' : textContent.includes('hours') ? 'PARTIAL SHIELD' : 'NON-COMPLIANT / MISSING',
                            ref: isGlobal ? "ILO Hours of Work Convention" : "Chapter IX / Section 100-108",
                            desc: isGlobal ? "Restricts working periods and enforces overtime compensation at premium rates for extra work hours." : "Shift limits of 8 hours/day and double-basic premium overtime rates."
                          },
                          {
                            item: isGlobal ? "Maternity Leave & Equality Safety Guardrails" : "Section 45-50: Paid Maternity Leave & Female Protections",
                            status: textContent.includes('maternity') || textContent.includes('pregnancy')
                              ? 'COMPLIANT' : textContent.includes('female') || textContent.includes('leave') ? 'PARTIAL SHIELD' : 'NON-COMPLIANT / MISSING',
                            ref: isGlobal ? "ILO Maternity Protection Convention" : "Chapter IV / Section 45-50",
                            desc: isGlobal ? "Guarantees standard paid maternity leave terms and protects parents from discriminatory layout changes." : "Guarantees of 16 weeks paid pregnancy leave with statutory safeguards."
                          }
                        ]
                      },
                      {
                        title: isGlobal ? "2. Global Value Added Tax & Customs Transfer Code" : "2. NBR Value Added Tax (VAT) Act 2012 Mandates",
                        items: [
                          {
                            item: isGlobal ? "Zero-Rated Direct/Deemed Export Processing" : "Section 24/25: Zero-Rated Export VAT Processing",
                            status: textContent.includes('zero-rated') || textContent.includes('deemed export') || textContent.includes('tax exemption')
                              ? 'COMPLIANT' : textContent.includes('vat') || textContent.includes('value added tax') ? 'PARTIAL SHIELD' : 'NON-COMPLIANT / MISSING',
                            ref: isGlobal ? "UCP 600 / GATT Article I" : "Chapter V / Section 24",
                            desc: isGlobal ? "Qualifies compliant export industries or cross-border deemed deliveries to zero-rated tax systems." : "Exporters or deemed export suppliers tax-zero classification mapping."
                          },
                          {
                            item: isGlobal ? "Export Tax Invoice & Challan Issuance" : "Section 51: Compulsory Mushak Form VAT-6.3 Release",
                            status: textContent.includes('6.3') || textContent.includes('mushak') || textContent.includes('vat invoice') || textContent.includes('tax invoice')
                              ? 'COMPLIANT' : textContent.includes('invoice') || textContent.includes('billing') ? 'PARTIAL SHIELD' : 'NON-COMPLIANT / MISSING',
                            ref: isGlobal ? "Global VAT Invoice Best Practices" : "Chapter VII / Section 51",
                            desc: isGlobal ? "Requires formal compliance-certified tax invoices or local challan proofs on/before shipment transfer." : "Mandatory delivery of Mushak Challan VAT-6.3 before raw materials transit."
                          },
                          {
                            item: isGlobal ? "Duty-Free Bonded Storage & Customs Authority Coordination" : "Customs & Bonded Warehouse Priority Rules",
                            status: textContent.includes('bonded') || textContent.includes('custom duty') || textContent.includes('customs clearance')
                              ? 'COMPLIANT' : textContent.includes('import') || textContent.includes('export') ? 'PARTIAL SHIELD' : 'NON-COMPLIANT / MISSING',
                            ref: isGlobal ? "Kyoto Convention Annex D" : "NBR Bond Directive / Customs Act",
                            desc: isGlobal ? "Secures authorized customs clearing protocols and priority access to tax-free bonded facilities." : "FOB/CIF raw material customs warehouse bond protection rules."
                          }
                        ]
                      },
                      {
                        title: isGlobal ? "3. Bilateral Corporate Withholding Tax Safeguards (DTAA)" : "3. Bangladesh Income Tax Act 2023 Guidelines",
                        items: [
                          {
                            item: isGlobal ? "Tax Deducted at Source (TDS) Withholding Cap" : "Section 52: Tax Deducted at Source (TDS) Withholding Capping",
                            status: textContent.includes('tds') || textContent.includes('withholding') || textContent.includes('source tax')
                              ? 'COMPLIANT' : textContent.includes('tax') ? 'PARTIAL SHIELD' : 'NON-COMPLIANT / MISSING',
                            ref: isGlobal ? "OECD Article 10/11" : "Part IV / Section 52",
                            desc: isGlobal ? "Regulates corporate withholding tax rules at source and limits statutory maximum rates on supply orders." : "Clear withholding responsibility and local TDS cap sharing limits."
                          },
                          {
                            item: isGlobal ? "Tax Treasury Deposit & Challan (Chalan) Proof Delivery" : "Treasury Challan Delivery Verification Cycle",
                            status: textContent.includes('challan') || textContent.includes('chalan') || textContent.includes('treasury receipt') || textContent.includes('tax certificate')
                              ? 'COMPLIANT' : textContent.includes('payment proof') || textContent.includes('receipt') ? 'PARTIAL SHIELD' : 'NON-COMPLIANT / MISSING',
                            ref: isGlobal ? "OECD Model Withholding Rules" : "Section 53 & NBR Rule Book",
                            desc: isGlobal ? "Enforces prompt transfer of physical tax challans or treasury tax payment certificates back to exporter (typically within 30 days)." : "Responsibility to return governmental tax deposits back to supplier in 30 days."
                          },
                          {
                            item: isGlobal ? "Double Taxation Avoidance Residency Certifications (TRC)" : "Double Taxation Avoidance Residency (TRC)",
                            status: textContent.includes('dtaa') || textContent.includes('double tax') || textContent.includes('residency certificate') || textContent.includes('permanent establishment')
                              ? 'COMPLIANT' : textContent.includes('foreign') || textContent.includes('withholding tax') ? 'PARTIAL SHIELD' : 'NON-COMPLIANT / MISSING',
                            ref: isGlobal ? "Double Tax Treaties (DTAA)" : "Section 151 / DTAA Guidelines",
                            desc: isGlobal ? "Demands valid Tax Residency Certificates (TRC) to shield overseas sellers from permanent taxation exposures." : "Safeguard certifications of foreign entities avoiding Permanent Establishment taxation."
                          }
                        ]
                      }
                    ];

                    return sections.map((sec, sIdx) => (
                      <div key={sIdx} className="space-y-1.5 print-avoid-break">
                        <h4 className="text-xs font-semibold text-slate-800 font-sans border-b border-slate-350 pb-0.5 uppercase">
                          {sec.title}
                        </h4>
                        <table className="w-full text-[10.5px] border border-slate-350 border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-350 text-left font-mono">
                              <th className="p-1.5 border-r border-slate-350 w-2/5 font-semibold">Statutory Checkpoint</th>
                              <th className="p-1.5 border-r border-slate-350 w-1/4 font-semibold text-center">Reference</th>
                              <th className="p-1.5 border-r border-slate-350 w-1/5 font-semibold text-center">Compliance Rating</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sec.items.map((item, iIdx) => (
                              <tr key={iIdx} className="border-b border-slate-300">
                                <td className="p-1.5 font-sans text-slate-800 border-r border-slate-300 text-justify">
                                  <div className="font-semibold">{item.item}</div>
                                  <div className="text-[9px] text-slate-500 font-sans">{item.desc}</div>
                                </td>
                                <td className="p-1.5 font-mono text-center border-r border-slate-300 text-slate-600">{item.ref}</td>
                                <td className={`p-1.5 font-mono text-center font-bold text-[9.5px] ${
                                  item.status === 'COMPLIANT' ? 'text-emerald-700' : item.status === 'PARTIAL SHIELD' ? 'text-amber-700' : 'text-rose-700'
                                }`}>{item.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Detailed Risk Clauses section */}
              {analysisResult.risks && analysisResult.risks.length > 0 && (
                <div className="space-y-2 print-avoid-break">
                  <h3 className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">
                    V. DETAILED REGULATORY BREACHES & PENAL RISK CLAUSES
                  </h3>
                  <div className="space-y-3 font-sans">
                    {analysisResult.risks.map((risk, index) => (
                      <div key={index} className="p-3 border border-slate-350 rounded space-y-1.5 text-xs bg-slate-50">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                          <span className="font-bold text-slate-900">{index + 1}. {risk.title}</span>
                          <span className="font-mono text-[9px] uppercase font-bold text-slate-600">
                            Severity: {risk.severity} Risk
                          </span>
                        </div>
                        <div className="p-2 bg-white border border-slate-250 italic font-mono text-[10px] text-slate-700">
                          &quot;{risk.clause}&quot;
                        </div>
                        <p className="text-[10.5px] text-slate-800 font-sans">
                          <strong>Mitigation Advice:</strong> {risk.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Essential Terms Section */}
              {analysisResult.missingTerms && analysisResult.missingTerms.length > 0 && (
                <div className="space-y-2 print-avoid-break">
                  <h3 className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">
                    VI. OMITTED SOVEREIGN TERMS & SUGGESTED CLAUSE BOILERPLATES
                  </h3>
                  <div className="space-y-3 font-sans">
                    {analysisResult.missingTerms.map((term, index) => (
                      <div key={index} className="p-3 border border-slate-350 rounded space-y-1.5 text-xs">
                        <h4 className="font-bold text-slate-900">{index + 1}. {term.title}</h4>
                        <p className="text-[10.5px] text-slate-600 leading-relaxed font-sans">{term.impact}</p>
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-250 font-mono text-[9.5px] text-slate-800 text-justify">
                          <strong className="text-[8.5px] uppercase text-emerald-800 block mb-1">Recommended Conforming Proviso Boilerplate:</strong>
                          {term.recommendedText}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legal Disclaimer Footer */}
              <div className="border-t border-slate-400 pt-3 text-[9px] text-slate-500 font-mono leading-relaxed text-center print-avoid-break">
                <p className="font-bold">SYSTEMATIC COMPLIANCE NOTICE & RESERVATION OF LIABILITY</p>
                <p>
                  This document serves as an evaluation overview generated by the NeumLex Sovereign Compliance Engine. Correctness of local Bangladesh Labour limits, Tax withholdings (Part VI / Section 52), and VAT-6.3 challans must be verified via dual qualified lawyers. Data processed under encrypted on-shore cryptographic storage structures only.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
