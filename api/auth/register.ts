import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID || "trim-infusion-fxqhd",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).setHeader('Access-Control-Allow-Origin', '*').send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { name, email, role } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Name and Email are required" });

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const userRole = (role === "admin" || email.toLowerCase().includes("nazmul") || email.toLowerCase() === "nazmulbijoy9105@gmail.com") ? "admin" : "user";
    
    const newUser = {
      id: "usr-" + Math.random().toString(36).substr(2, 9),
      name,
      email: email.toLowerCase(),
      role: userRole,
      subscription: userRole === "admin" ? "premium" : "free",
      planType: userRole === "admin" ? "corporate_advisory" : "free",
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', newUser.id), newUser);

    return res.status(200).json({ user: newUser, token: "session-tok-" + newUser.id });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}