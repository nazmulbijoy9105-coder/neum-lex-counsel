import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "trim-infusion-fxqhd";
const API_KEY = process.env.FIREBASE_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).setHeader('Access-Control-Allow-Origin', '*').send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { requestId, query } = req.body;
  if (!requestId || !query) return res.status(400).json({ error: "Missing data" });

  try {
    let aiResult = "Fallback local analysis generated.";
    let isFallback = true;

    if (GEMINI_API_KEY) {
      const prompt = `You are an expert Bangladesh RMG legal assistant. Analyze this specific legal scenario or query and provide a detailed breakdown referencing relevant Bangladesh laws (Labour Act 2006, VAT Act 2012, Customs Act 1969) and case precedents.\n\nQuery: ${query}`;
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
        })
      });
      const data = await response.json();
      aiResult = data.candidates?.[0]?.content?.parts?.[0]?.text || aiResult;
      isFallback = false;
    }

    // Update request status in Firestore
    await fetch(`https://firestore.googleapis.com/v1beta1/projects/${PROJECT_ID}/databases/(default)/documents/caseRequests/${requestId}?key=${API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { status: { stringValue: "fulfilled" }, result: { stringValue: aiResult } } })
    });

    return res.status(200).json({ result: aiResult, fallback: isFallback });
  } catch (error) {
    console.error("Fulfill error:", error);
    return res.status(500).json({ error: "Failed to fulfill request" });
  }
}