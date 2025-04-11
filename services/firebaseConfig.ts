import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; 
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAbVzDy59-P7kR05jgbPFN0UJ4nyNDAe7Y",
  authDomain: "carrito-sockets.firebaseapp.com",
  projectId: "carrito-sockets",
  storageBucket: "carrito-sockets.firebasestorage.app",
  messagingSenderId: "584327968734",
  appId: "1:584327968734:android:d1af293bcb577143360f4f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

const messaging = getMessaging(app);

export { messaging };
export default app;