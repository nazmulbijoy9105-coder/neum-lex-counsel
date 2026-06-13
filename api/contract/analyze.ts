import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).setHeader('Access-Control-Allow-Origin', '*').send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { contractText, userEmail } = req.body;
  if (!contractText) return res.status(400).json({ error: "Contract text is required" });

  try {
    let result = "Local Fallback Analysis executed.";
    let risks = [{ title: "Default Risk", severity: "medium", recommendation: "Review payment terms carefully." }];
    let score = 75;
    let isFallback = true;

    if (GEMINI_API_KEY) {
      const prompt = `Analyze this Bangladesh RMG export contract. Identify risks, missing clauses, compliance issues with BGMEA/Labour Act 2006/Customs Act 1969. Return strictly valid JSON only with this format: { "summary": "...", "risks": [{"title": "...", "severity": "high/medium/low", "recommendation": "..."}], "score": 85 }.\n\nContract:\n${contractText.substring(0, 3000)}`;
      
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
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          result = parsed.summary || "AI Audit completed.";
          risks = parsed.risks || risks;
          score = parsed.score || score;
          isFallback = false;
        } else {
          result = text;
          isFallback = false;
        }
      }
    }

    return res.status(200).json({ result, risks, score, fallback: isFallback });
  } catch (error) {
    console.error("Analyze error:", error);
    return res.status(500).json({ error: "Audit failed" });
  }
}