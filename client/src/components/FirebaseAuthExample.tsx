import React, { useState, useEffect } from "react";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from "firebase/auth";
import { useFirebase } from "@/lib/firebase/firebase-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function FirebaseAuthExample() {
  const { app } = useFirebase();
  const auth = getAuth(app);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 監聽用戶登入狀態
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, [auth]);
  
  // 註冊
  const handleSignUp = async () => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "註冊失敗");
    }
  };
  
  // 登入
  const handleSignIn = async () => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "登入失敗");
    }
  };
  
  // 登出
  const handleSignOut = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message || "登出失敗");
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Firebase Auth 示例</CardTitle>
      </CardHeader>
      <CardContent>
        {user ? (
          <div className="space-y-4">
            <p className="text-sm">已登入為:</p>
            <div className="p-3 bg-green-50 rounded-md">
              <p className="font-medium">{user.email}</p>
              <p className="text-xs text-gray-500">用戶 ID: {user.uid}</p>
            </div>
            <Button variant="destructive" onClick={handleSignOut} className="w-full">
              登出
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">電子郵件</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="your@email.com" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
              />
            </div>
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}
          </div>
        )}
      </CardContent>
      {!user && (
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={handleSignUp} className="flex-1">
            註冊
          </Button>
          <Button onClick={handleSignIn} className="flex-1">
            登入
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 