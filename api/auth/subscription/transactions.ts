import type { VercelRequest, VercelResponse } from '@vercel/node';
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "trim-infusion-fxqhd";
const API_KEY = process.env.FIREBASE_API_KEY;

function parseFields(doc: any) {
  const obj: any = { id: doc.name.split('/').pop() };
  for (const [key, val] of Object.entries(doc.fields || {})) {
    const v = val as any;
    if (v.stringValue !== undefined) obj[key] = v.stringValue;
    else if (v.integerValue !== undefined) obj[key] = parseInt(v.integerValue);
    else if (v.doubleValue !== undefined) obj[key] = v.doubleValue;
    else obj[key] = null;
  }
  return obj;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).setHeader('Access-Control-Allow-Origin', '*').send('');
  try {
    const url = `https://firestore.googleapis.com/v1beta1/projects/${PROJECT_ID}/databases/(default)/documents/transactions?key=${API_KEY}`;
    const fetchRes = await fetch(url);
    const data = await fetchRes.json();
    if (!data.documents) return res.status(200).json([]);
    res.status(200).json(data.documents.map(parseFields));
  } catch (error) {
    res.status(200).json([]);
  }
}