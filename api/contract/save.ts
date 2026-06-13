import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "trim-infusion-fxqhd";
const API_KEY = process.env.FIREBASE_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).setHeader('Access-Control-Allow-Origin', '*').send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { name, type, contractText, userEmail, risks, score } = req.body;
  if (!contractText || !userEmail) return res.status(400).json({ error: "Missing data" });

  try {
    const ENCRYPTION_KEY = Buffer.from(crypto.createHash('sha256').update(process.env.GEMINI_API_KEY || "neumlex_secure_fallback_salt").digest());
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(contractText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const docId = "agr-" + Math.random().toString(36).substr(2, 9);
    const secureCode = crypto.createHash('sha256').update(docId).digest('hex').substring(0, 12);
    
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const fields: any = {
      name: { stringValue: name || "Unnamed Contract" },
      type: { stringValue: type || "General" },
      userEmail: { stringValue: userEmail },
      ciphertext: { stringValue: encrypted },
      iv: { stringValue: iv.toString('hex') },
      secureCode: { stringValue: secureCode },
      encryptedSize: { integerValue: Buffer.byteLength(encrypted, 'utf8') },
      complianceScore: { integerValue: score || 0 },
      expiryDate: { stringValue: expiryDate.toISOString().split('T')[0] },
      status: { stringValue: "active" },
      createdAt: { stringValue: new Date().toISOString() }
    };

    if (risks && Array.isArray(risks)) {
      fields.risks = { stringValue: JSON.stringify(risks) };
    }

    await fetch(`https://firestore.googleapis.com/v1beta1/projects/${PROJECT_ID}/databases/(default)/documents/contracts/${docId}?key=${API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });

    return res.status(200).json({ 
      id: docId, 
      secureCode, 
      encryptedSize: fields.encryptedSize.integerValue,
      message: "Contract secured successfully" 
    });
  } catch (error) {
    console.error("Save error:", error);
    return res.status(500).json({ error: "Failed to save contract" });
  }
}