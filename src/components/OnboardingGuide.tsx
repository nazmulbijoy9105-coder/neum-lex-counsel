import React, { useState } from 'react';
import { BookOpen, ChevronRight, CheckCircle, ArrowRight, ShieldCheck, Scale, Globe } from 'lucide-react';

export default function OnboardingGuide() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "1. Bangladesh Legal Sovereignty",
      icon: <Scale className="h-5 w-5 text-emerald-400" />,
      description: "Bangladesh commercial sectors operate on a mixture of codified British-colonial acts and modern regional regulations: the Contract Act 1872, the Customs Act 1969, and the Bangladesh Labour Act 2006. Sourcing conflicts typically unfold regarding shipment delays and custom assessment fines at Chittagong and Mongla sea gates.",
      tip: "Pro Tip: Always verify if your buyer provides Back-to-Back LC (Letter of Credit) matching Bangladesh Bank exchange parameters."
    },
    {
      title: "2. Garments Export Safety (FOB vs. CIF)",
      icon: <Globe className="h-5 w-5 text-teal-400" />,
      description: "Garments represent over 80% of Bangladesh’s trade. Most agreements use free-on-board (FOB) or Cost, Insurance & Freight (CIF) shipping parameters. Buyer disputes often surface when buyers unilaterally declare late shipment discounts or cancel orders under bankruptcy regulations before product delivery.",
      tip: "Security Rule: Exporters must write robust 'Payment Security' clauses and ensure dispute mediation starts under the BGMEA."
    },
    {
      title: "3. Agreement Expiry & Bond Compliance",
      icon: <ShieldCheck className="h-5 w-5 text-blue-400" />,
      description: "For garments exporting, custom bonded warehouse licenses must remain strictly active and require bi-annual government audits to remain exempt from raw raw-materials import tax custom duties.",
      tip: "Automation Alert: NEUMLEX features an automated notifications engine that monitors your active lease, bond, or buyer sourcing agreements 30/10 days before expiry, logging the simulated alerts on-screen."
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-emerald-500 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h3 id="onboarding-guide-title" className="text-sm font-bold text-white tracking-tight">Bangladesh Trade Onboarding Guide</h3>
          <p className="text-[11px] text-slate-400">Essential regulatory orientation for first-time garments exporters and corporate counsels</p>
        </div>
      </div>

      {/* Guide Stepper Layout */}
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        {steps.map((step, idx) => (
          <button
            key={idx}
            onClick={() => setActiveStep(idx)}
            className={`text-left p-3.5 rounded-lg border transition duration-200 cursor-pointer ${
              activeStep === idx
                ? 'bg-slate-950 border-emerald-500/40 text-white'
                : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-950 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-mono text-[10px] tracking-widest text-emerald-500 uppercase font-semibold">
                Step 0{idx + 1}
              </span>
              {step.icon}
            </div>
            <h4 className="text-xs font-bold text-slate-200 truncate">{step.title}</h4>
          </button>
        ))}
      </div>

      {/* Detail Display of selected step */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 font-sans text-xs">
        <div className="flex gap-2.5 text-slate-200 leading-relaxed mb-4">
          <ChevronRight className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
          <p>{steps[activeStep].description}</p>
        </div>

        <div className="p-3 bg-emerald-950/20 border-l-2 border-emerald-500 text-slate-350 rounded-r-md">
          <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">Governance Principal App</span>
          {steps[activeStep].tip}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
          className="text-emerald-500 hover:text-emerald-400 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
        >
          Proceed orient next guide step
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
