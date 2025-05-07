import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
  type ReactNode
} from "react";
import { initializeApp } from "firebase/app";
import { 
  getAnalytics, 
  type Analytics 
} from "firebase/analytics";
import { 
  getAuth, 
  type Auth 
} from "firebase/auth";
import { 
  getFirestore, 
  type Firestore 
} from "firebase/firestore";

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

// 定義 Firebase Context 類型
interface FirebaseContextProps {
  app: ReturnType<typeof initializeApp>;
  analytics: Analytics | null;
  auth: Auth;
  firestore: Firestore;
  isAnalyticsReady: boolean;
}

// 預設值
const defaultContext: FirebaseContextProps = {
  app: {} as ReturnType<typeof initializeApp>,
  analytics: null,
  auth: {} as Auth,
  firestore: {} as Firestore,
  isAnalyticsReady: false
};

// 創建 Context
const FirebaseContext = createContext<FirebaseContextProps>(defaultContext);

// Provider 組件
export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [isAnalyticsReady, setIsAnalyticsReady] = useState(false);
  
  // 使用 useMemo 避免不必要的重新初始化
  const app = useMemo(() => initializeApp(firebaseConfig), []);
  const auth = useMemo(() => getAuth(app), [app]);
  const firestore = useMemo(() => getFirestore(app), [app]);
  
  // 使用 useState 來存儲 analytics 實例，因為它需要在瀏覽器環境中初始化
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  
  // 在組件掛載後初始化 analytics
  useEffect(() => {
    try {
      // 確保在瀏覽器環境中執行
      if (typeof window !== "undefined") {
        const analyticsInstance = getAnalytics(app);
        setAnalytics(analyticsInstance);
        setIsAnalyticsReady(true);
      }
    } catch (error) {
      console.error("初始化 Firebase Analytics 時發生錯誤:", error);
    }
  }, [app]);
  
  // 使用 useMemo 避免不必要的重新渲染
  const contextValue = useMemo(() => ({
    app,
    analytics,
    auth,
    firestore,
    isAnalyticsReady
  }), [app, analytics, auth, firestore, isAnalyticsReady]);
  
  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
}

// 自定義 Hook 以便於存取 Firebase 服務
export function useFirebase() {
  const context = useContext(FirebaseContext);
  
  if (!context) {
    throw new Error("useFirebase 必須在 FirebaseProvider 內使用");
  }
  
  return context;
} 