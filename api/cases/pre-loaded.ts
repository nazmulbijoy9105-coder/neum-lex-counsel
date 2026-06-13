import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).setHeader('Access-Control-Allow-Origin', '*').send('');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const cases = [
    {
      id: "case-001", title: "Apex Apparel Ltd. v. Commissioner of Customs, Chittagong", court: "Supreme Court of Bangladesh (High Court Division)", citation: "HCD Precedent Reference", year: 2020,
      summary: "Dispute involving pre-shipment assessment of imported raw materials. Apex Apparel disputed Chittagong Customs' retroactive cargo duty penalty on import raw fabric under standard export bond exemptions.",
      holdings: "The High Court Division held that 100% export-oriented garment inputs are fully protected from customs duty. Chittagong Customs' retroactive penalty was declared unlawful without absolute documentary proof of bad-faith declaration under Section 85 of The Customs Act, 1969.",
      tags: ["Garments Bonds", "Customs Dispute", "Bonded Warehouse", "Raw Import"], region: "bangladesh"
    },
    {
      id: "case-002", title: "BGMEA Exporters Association v. Bangladesh Bank & Others", court: "Supreme Court of Bangladesh (Appellate Division)", citation: "Appellate Division Precedent Reference", year: 2022,
      summary: "Constitutional challenge concerning exchange control timelines. Explores garment export collections and Back-to-Back L/C margin restrictions per shipment during severe shipping congestion.",
      holdings: "The Appellate Division extended export realization periods on force-majeure grounds. Confirmed that local banks must honor trade-finance guarantees for global raw fabric vendors.",
      tags: ["Letters of Credit", "Garments Trade", "Foreign Exchange Act", "Central Bank"], region: "bangladesh"
    },
    {
      id: "case-003", title: "Triton International Shipping BV v. BD Garments Enterprise", court: "International Court of Arbitration (ICC)", citation: "ICC Arbitration Reference", year: 2021,
      summary: "Cross-border trade dispute involving carrier demurrage claims for stranded apparel containers due to buyer financial insolvency under standard CIF rules.",
      holdings: "The ICC Tribunal awarded partial demurrage to the logistics carrier. Reaffirmed that export agreements should mandate BGMEA arbitration or Dhaka mediation before triggering foreign courts.",
      tags: ["Cross-Border Logistics", "Incoterms", "Arbitration", "Buyer Sourcing Dispute"], region: "cross-border"
    },
    {
      id: "case-004", title: "Standard Apparel Ltd. v. Commissioner of VAT, Dhaka East", court: "Supreme Court of Bangladesh (High Court Division)", citation: "VAT Tribunal Landmark Reference", year: 2023,
      summary: "VAT assessment challenge of zero-rated deemed exports for RMG fabrication. Standard Apparel disputed VAT on local subcontracting washes, embellishments, and garments embroidery services.",
      holdings: "The High Court Division held that auxiliary washing, printing, and packaging services provided to direct exporters qualify as zero-rated deemed exports under the Value Added Tax and Supplementary Duty Act.",
      tags: ["VAT Act 2012", "Tax Compliance", "Zero-Rated Exports", "Deemed Export Wash"], region: "bangladesh"
    },
    {
      id: "case-005", title: "BGMEA v. Government of Bangladesh & Others", court: "Supreme Court of Bangladesh (Appellate Division)", citation: "Appellate Division Structural Compliance Reference", year: 2016,
      summary: "Constitutional and statutory litigation regarding building integrity, fire exit compliance, and architectural certification under the Bangladesh National Building Code (BNBC).",
      holdings: "The Appellate Division held that factory safety and structural stability are fundamental components of the Right to Life as guaranteed by Article 32 of the Constitution. Structural audits remain mandatory.",
      tags: ["Building Safety Code", "RMG Compliance", "Labor Act 2006", "Safety Auditing Rule"], region: "bangladesh"
    },
    {
      id: "case-006", title: "National Garments Workers Federation v. State & BGMEA", court: "Supreme Court of Bangladesh (High Court Division)", citation: "Labor Standards HCD Reference", year: 2007,
      summary: "Public interest petition concerning minimum wage board gazettes and RMG labor strike arbitrations. Focuses on the procedural validity of factory lockouts during national wage disputes.",
      holdings: "The High Court Division ruled that RMG wage setups must strictly compute cost of living and inflation adjustments as required by the Bangladesh Labor Act. Outlawed retaliatory factory lockouts without prior statutory notice.",
      tags: ["Minimum Wage Board", "Labor Strike Arbitration", "Strike Lockout Rules", "RMG Minimum Wage"], region: "bangladesh"
    },
    {
      id: "case-007", title: "Sonali Bank Limited v. Bangladesh Apparel Ltd. & Others", court: "Supreme Court of Bangladesh (Appellate Division)", citation: "Appellate Division Banking Law Reference", year: 2014,
      summary: "Irrevocable Letters of Credit commercial litigation over reimbursement non-payments. Sonali Bank refused payment alleging bill of lading document discrepancy.",
      holdings: "The Supreme Court recognized that although commercial L/Cs are separate from sales contracts, fabric delivery fraud or severe bill of entry discrepancies entitle the opening banker to withhold payment.",
      tags: ["Letters of Credit", "UCP 600 Rules", "Documentary Fraud", "Foreign Exchange Regulation Act 1947"], region: "bangladesh"
    }
  ];

  return res.status(200).json(cases);
}