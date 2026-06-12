export type UserRole = 'user' | 'admin';
export type SubscriptionTier = 'free' | 'premium';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subscription: SubscriptionTier;
  planType: string; // 'free' | 'export_elite' | 'corporate_advisory'
  createdAt: string;
}

export interface LegalCase {
  id: string;
  title: string;
  court: string;
  citation: string;
  year: number;
  summary: string;
  holdings: string;
  tags: string[];
  region: 'bangladesh' | 'cross-border';
}

export interface RiskItem {
  severity: 'high' | 'medium' | 'low';
  title: string;
  clause: string;
  recommendation: string;
  category: string;
}

export interface MissingTerm {
  title: string;
  impact: string;
  recommendedText: string;
}

export interface ContractDoc {
  id: string;
  name: string;
  type: string;
  content: string;
  risks: RiskItem[];
  missingTerms: MissingTerm[];
  complianceScore: number;
  category?: string;
  bgFocusDetails?: string;
  riskScores?: Record<string, number> | null;
  secureCode: string; // Secure SHA-256 fingerprint of stored document
  encryptedSize: number; // Encrypted byte tally
  expiryDate: string;
  status: 'active' | 'expiring' | 'expired';
}

export interface GovernanceLog {
  id: string;
  action: string; // e.g., 'DOCUMENT_ENCRYPTED', 'ADMIN_POLICY_AUDIT'
  timestamp: string;
  userEmail: string;
  status: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export interface Transaction {
  id: string;
  amount: number;
  status: 'completed' | 'pending';
  plan: string;
  date: string;
  reference: string;
}

export interface EmailNotificationLog {
  id: string;
  contractId: string;
  contractName: string;
  recipientEmail: string;
  sentAt: string;
  triggerType: '30_days_before' | '10_days_before' | 'expired';
  status: 'simulated_sent' | 'failed';
}

export interface LegalResearchResponse {
  briefSummary: string;
  relevantStatutes: { section: string; act: string; interpretation: string }[];
  precedents: { title: string; citation: string; relevance: string }[];
  crossBorderImplications: string;
  governanceComplianceCheck: string[];
  isFallback?: boolean;
}

export interface ContractReviewResponse {
  risks: RiskItem[];
  missingTerms: MissingTerm[];
  complianceScore: number;
  category?: string;
  bgFocusDetails?: string;
  riskScores?: Record<string, number> | null;
  criticalGarmentWarnings: string[];
  isFallback?: boolean;
}
