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
  if (req.method === 'OPTIONS') return res.status(200).send('');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  const userId = token.replace("session-tok-", "");

  try {
    const docRes = await fetch(`https://firestore.googleapis.com/v1beta1/projects/${PROJECT_ID}/databases/(default)/documents/users/${userId}?key=${API_KEY}`);
    const data = await docRes.json();

    if (!data.fields) return res.status(401).json({ error: "Session expired" });
    
    const user = parseFields(data);
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}