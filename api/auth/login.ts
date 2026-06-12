import type { VercelRequest, VercelResponse } from '@vercel/node';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "trim-infusion-fxqhd";
const API_KEY = process.env.FIREBASE_API_KEY;

function parseFields(doc: any) {
  const obj: any = { id: doc.name.split('/').pop() };
  for (const [key, val] of Object.entries(doc.fields || {})) {
    const v = val as any;
    if (v.stringValue !== undefined) obj[key] = v.stringValue;
    else if (v.integerValue !== undefined) obj[key] = parseInt(v.integerValue);
    else if (v.booleanValue !== undefined) obj[key] = v.booleanValue;
    else obj[key] = null;
  }
  return obj;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).setHeader('Access-Control-Allow-Origin', '*').send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const queryUrl = `https://firestore.googleapis.com/v1beta1/projects/${PROJECT_ID}/databases/(default)/documents/users:key?key=${API_KEY}`;
    const checkRes = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'users' }],
          where: { fieldFilter: { field: { fieldPath: 'email' }, op: 'EQUAL', value: { stringValue: email.toLowerCase() } } }
        }
      })
    });
    const data = await checkRes.json();

    if (data.documents && data.documents.length > 0) {
      const user = parseFields(data.documents[0]);
      return res.status(200).json({ user, token: "session-tok-" + user.id });
    }

    // Auto-register if not found
    const name = email.split('@')[0];
    const isOwnerAdmin = email.toLowerCase() === "nazmulbijoy9105@gmail.com";
    const newId = "usr-" + Math.random().toString(36).substr(2, 9);
    
    const newUser = {
      name: isOwnerAdmin ? "Nazmul Bijoy" : name.charAt(0).toUpperCase() + name.slice(1),
      email: email.toLowerCase(),
      role: isOwnerAdmin ? "admin" : "user",
      subscription: isOwnerAdmin ? "premium" : "free",
      planType: isOwnerAdmin ? "corporate_advisory" : "free",
      createdAt: new Date().toISOString()
    };

    const fields: any = {};
    for (const [k, v] of Object.entries(newUser)) fields[k] = { stringValue: String(v) };

    await fetch(`https://firestore.googleapis.com/v1beta1/projects/${PROJECT_ID}/databases/(default)/documents/users/${newId}?key=${API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });

    return res.status(200).json({ user: { id: newId, ...newUser }, token: "session-tok-" + newId });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}