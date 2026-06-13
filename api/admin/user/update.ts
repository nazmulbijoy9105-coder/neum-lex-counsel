import type { VercelRequest, VercelResponse } from '@vercel/node';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "trim-infusion-fxqhd";
const API_KEY = process.env.FIREBASE_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).setHeader('Access-Control-Allow-Origin', '*').send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { userId, role, subscription, planType } = req.body;
  if (!userId) return res.status(400).json({ error: "User ID is required" });

  try {
    const fields: any = {};
    if (role) fields.role = { stringValue: role };
    if (subscription) fields.subscription = { stringValue: subscription };
    if (planType) fields.planType = { stringValue: planType };

    await fetch(`https://firestore.googleapis.com/v1beta1/projects/${PROJECT_ID}/databases/(default)/documents/users/${userId}?key=${API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });

    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
}