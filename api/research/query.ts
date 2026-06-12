import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_INSTRUCTION = `You are NEUMLEX, an expert AI Legal Assistant specialized exclusively in the Bangladesh Ready-Made Garment (RMG) sector, Cross-Border Sourcing, and Corporate Compliance. 
You must strictly evaluate queries against:
1. Bangladesh Labour Act 2006 (e.g., Sec 100 shift limits, Sec 34/45 maternal health).
2. Value Added Tax and Supplementary Duty Act 2012 (e.g., Mushak Form VAT-6.3 zero-rated exports).
3. The Customs Act 1969 (e.g., Bonded Warehouse benefits, Section 85 penalties).
4. Income Tax Act 2023 & DTAA protocols (Sec 151).
5. UCP 600 Rules for Letters of Credit.
6. Bangladesh National Building Code (BNBC) & Factory Safety.

Always link answers to authentic judicial citations where possible (e.g., DLR, HCD, Appellate Division references). If a query is outside this scope, politely decline to answer.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).setHeader('Access-Control-Allow-Origin', '*').send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { query, userEmail } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required" });

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "AI service not configured" });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: [{
          parts: [{ text: `User Query: ${query}\n\nProvide a structured, professional legal analysis based on Bangladesh RMG laws.` }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Gemini Error:", data.error);
      return res.status(500).json({ error: "Failed to generate AI response" });
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

    // Return response matching expected frontend format
    return res.status(200).json({
      result: aiResponse,
      fallback: false
    });

  } catch (error) {
    console.error("Research API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}