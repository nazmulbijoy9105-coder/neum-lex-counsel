import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Firestore } from '@google-cloud/firestore';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "trim-infusion-fxqhd";
const API_KEY = process.env.FIREBASE_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).setHeader('Access-Control-Allow-Origin', '*').send('');
  
  if (req.method === 'GET') {
    try {
      const url = `https://firestore.googleapis.com/v1beta1/projects/${PROJECT_ID}/databases/(default)/documents/caseRequests?key=${API_KEY}`;
      const fetchRes = await fetch(url);
      const data = await fetchRes.json();
      if (!data.documents) return res.status(200).json([]);
      const requests = data.documents.map((doc: any) => {
        const obj: any = { id: doc.name.split('/').pop() };
        for (const [key, val] of Object.entries(doc.fields || {})) {
          const v = val as any;
          if (v.stringValue !== undefined) obj[key] = v.stringValue;
          else if (v.integerValue !== undefined) obj[key] = parseInt(v.integerValue);
          else if (v.booleanValue !== undefined) obj[key] = v.booleanValue;
          else obj[key] = null;
        }
        return obj;
      });
      return res.status(200).json(requests);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch requests" });
    }
  }

  if (req.method === 'POST') {
    const { query, userEmail, region } = req.body;
    if (!query || !userEmail) return res.status(400).json({ error: "Missing query or email" });

    try {
      const id = "req-" + Math.random().toString(36).substr(2, 9);
      const fields: any = {
        query: { stringValue: query },
        userEmail: { stringValue: userEmail },
        region: { stringValue: region || "bangladesh" },
        status: { stringValue: "pending" },
        createdAt: { stringValue: new Date().toISOString() }
      };

      await fetch(`https://firestore.googleapis.com/v1beta1/projects/${PROJECT_ID}/databases/(default)/documents/caseRequests/${id}?key=${API_KEY}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
      });

      return res.status(200).json({ id, status: "pending", message: "Request submitted successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Failed to submit request" });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}