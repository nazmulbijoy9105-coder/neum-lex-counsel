import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';

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
  if (req.method === 'OPTIONS') return res.status(200).send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { email, planId, paymentMethod, bankSenderName, bankAccountNo, bankRefId, mobileProvider, senderMobileNo, mobileTxnId, cardNumber, cardHolder } = req.body;
  if (!email || !planId) return res.status(400).json({ error: "Email and selected custom plan required" });

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const userSnap = await getDocs(q);
    if (userSnap.empty) return res.status(404).json({ error: "User not found" });

    const userDoc = userSnap.docs[0];
    const user = userDoc.data();

    const planPriceMap: Record<string, { price: number, label: string }> = {
      export_elite: { price: 49, label: "Export Elite" },
      corporate_advisory: { price: 149, label: "Corporate Advisory Advisor" }
    };

    const selectedPlan = planPriceMap[planId] || { price: 0, label: "Free Tier" };
    const updatedUser = { ...user, subscription: selectedPlan.price > 0 ? "premium" : "free", planType: planId };
    await updateDoc(userDoc.ref, updatedUser);

    const reference = "TXN-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    const transaction = {
      id: "txn-" + Math.random().toString(36).substr(2, 9),
      userEmail: email, amount: selectedPlan.price, status: "completed", plan: selectedPlan.label,
      date: new Date().toISOString(), reference, paymentMethod: paymentMethod || "card",
      details: {
        bankSenderName: paymentMethod === 'bank' ? bankSenderName : undefined,
        bankAccountNo: paymentMethod === 'bank' ? bankAccountNo : undefined,
        bankRefId: paymentMethod === 'bank' ? bankRefId : undefined,
        mobileProvider: paymentMethod === 'mobile' ? mobileProvider : undefined,
        senderMobileNo: paymentMethod === 'mobile' ? senderMobileNo : undefined,
        mobileTxnId: paymentMethod === 'mobile' ? mobileTxnId : undefined,
        cardHolder: paymentMethod === 'card' ? cardHolder : undefined,
        cardNumber: paymentMethod === 'card' ? (cardNumber ? cardNumber.replace(/.(?=.{4})/g, '•') : '•••• •••• •••• 4242') : undefined
      }
    };
    await setDoc(doc(db, 'transactions', transaction.id), transaction);

    return res.status(200).json({ user: updatedUser, transaction });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}