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

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const snapshot = await getDocs(q);

    let user: any;
    if (snapshot.empty) {
      const name = email.split('@')[0];
      const isOwnerAdmin = email.toLowerCase() === "nazmulbijoy9105@gmail.com";
      user = {
        id: "usr-" + Math.random().toString(36).substr(2, 9),
        name: isOwnerAdmin ? "Nazmul Bijoy" : name.charAt(0).toUpperCase() + name.slice(1),
        email: email.toLowerCase(),
        role: isOwnerAdmin ? "admin" : "user",
        subscription: isOwnerAdmin ? "premium" : "free",
        planType: isOwnerAdmin ? "corporate_advisory" : "free",
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', user.id), user);
    } else {
      user = snapshot.docs[0].data();
    }

    return res.status(200).json({ user, token: "session-tok-" + user.id });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}