import React, { createContext, useContext, useMemo, useEffect, useState, type ReactNode } from "react";
import { initializeApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyBBNfsZVCKtkz6STtlo1UODQ1FhTDxF7ks",
  authDomain: "meetingroombooking-69469.firebaseapp.com",
  projectId: "meetingroombooking-69469",
  storageBucket: "meetingroombooking-69469.firebasestorage.app",
  messagingSenderId: "574231481848",
  appId: "1:574231481848:web:cc46f603a25fcdceb09a0d",
  measurementId: "G-PRW9FM4BHZ"
};

// 擴展 Context 類型以包含更多服務
interface FirebaseContextProps {
  app: ReturnType<typeof initializeApp>;
  analytics: Analytics | null;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
  isAnalyticsReady: boolean;
}

// 預設值
const defaultContext: FirebaseContextProps = {
  app: {} as ReturnType<typeof initializeApp>,
  analytics: null,
  auth: {} as Auth,
  firestore: {} as Firestore,
  storage: {} as FirebaseStorage,
  isAnalyticsReady: false
};

const FirebaseContext = createContext<FirebaseContextProps>(defaultContext);

export function FirebaseFullProvider({ children }: { children: ReactNode }) {
  const [isAnalyticsReady, setIsAnalyticsReady] = useState(false);
  
  const app = useMemo(() => initializeApp(firebaseConfig), []);
  const auth = useMemo(() => getAuth(app), [app]);
  const firestore = useMemo(() => getFirestore(app), [app]);
  const storage = useMemo(() => getStorage(app), [app]);
  
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const analyticsInstance = getAnalytics(app);
        setAnalytics(analyticsInstance);
        setIsAnalyticsReady(true);
      }
    } catch (error) {
      console.error("初始化 Firebase Analytics 時發生錯誤:", error);
    }
  }, [app]);
  
  const contextValue = useMemo(() => ({
    app,
    analytics,
    auth,
    firestore,
    storage,
    isAnalyticsReady
  }), [app, analytics, auth, firestore, storage, isAnalyticsReady]);
  
  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebaseFull() {
  const context = useContext(FirebaseContext);
  
  if (!context) {
    throw new Error("useFirebaseFull 必須在 FirebaseFullProvider 內使用");
  }
  
  return context;
} 