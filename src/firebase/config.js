import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCnfC_VWgjBq6__LI97aoVo2krbHjDoqR4",
    authDomain: "healthcare-ai-system.firebaseapp.com",
    projectId: "healthcare-ai-system",
    storageBucket: "healthcare-ai-system.firebasestorage.app",
    messagingSenderId: "359529945507",
    appId: "1:359529945507:web:bff92f319ce715659de216",
    measurementId: "G-EY76YYYBG6"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;