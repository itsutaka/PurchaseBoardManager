import React from "react";
import { useFirebase } from "@/lib/firebase/firebase-context";
import { logEvent } from "firebase/analytics";
import { Button } from "@/components/ui/button";

export default function FirebaseExample() {
  const { analytics, isAnalyticsReady } = useFirebase();
  
  const handleLogEvent = () => {
    if (isAnalyticsReady && analytics) {
      logEvent(analytics, 'button_click', {
        button_name: 'example_button',
        screen: 'firebase_example'
      });
      alert('事件已記錄到 Firebase Analytics！');
    } else {
      alert('Firebase Analytics 尚未準備好');
    }
  };
  
  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-bold mb-2">Firebase 範例</h2>
      <p className="mb-4">
        Analytics 狀態: {isAnalyticsReady ? '已準備好' : '準備中...'}
      </p>
      <Button onClick={handleLogEvent}>
        記錄事件到 Firebase Analytics
      </Button>
    </div>
  );
} 