// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "studio-2752599160-8c510",
  appId: "1:772728943552:web:c3b5db5b21f0ec47f84e25",
  apiKey: "AIzaSyBIhvck54Zi3VL3MiL-HAydSMvtuK0R5lM",
  authDomain: "studio-2752599160-8c510.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "772728943552"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
