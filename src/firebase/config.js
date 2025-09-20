import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
      apiKey: "AIzaSyBiubQU77WFDqK4hHFClinmGnDNvYThTUE",
      authDomain: "healthcare-ai-system-5b2f9.firebaseapp.com",
      projectId: "healthcare-ai-system-5b2f9",
      storageBucket: "healthcare-ai-system-5b2f9.firebasestorage.app",
      messagingSenderId: "897420270319",
      appId: "1:897420270319:web:5557d8baabbc014ed7991a",
      measurementId: "G-B1S0XJCGXB"
    };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;