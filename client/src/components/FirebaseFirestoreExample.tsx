import React, { useState, useEffect } from "react";
import { useFirebase } from "@/lib/firebase/firebase-context";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp,
  type DocumentData 
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Trash } from "lucide-react";

interface Note {
  id: string;
  text: string;
  createdAt: Date;
}

export default function FirebaseFirestoreExample() {
  const { firestore } = useFirebase();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 獲取所有筆記
  const fetchNotes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const notesQuery = query(
        collection(firestore, "notes"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(notesQuery);
      
      const fetchedNotes: Note[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedNotes.push({
          id: doc.id,
          text: data.text,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });
      
      setNotes(fetchedNotes);
    } catch (err: any) {
      console.error("獲取筆記錯誤:", err);
      setError("無法載入筆記");
    } finally {
      setIsLoading(false);
    }
  };
  
  // 組件掛載時獲取筆記
  useEffect(() => {
    fetchNotes();
  }, [firestore]);
  
  // 添加新筆記
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await addDoc(collection(firestore, "notes"), {
        text: newNote,
        createdAt: serverTimestamp(),
      });
      
      setNewNote("");
      await fetchNotes(); // 重新獲取以更新列表
    } catch (err: any) {
      console.error("添加筆記錯誤:", err);
      setError("無法添加筆記");
    } finally {
      setIsLoading(false);
    }
  };
  
  // 刪除筆記
  const handleDeleteNote = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(firestore, "notes", id));
      await fetchNotes(); // 重新獲取以更新列表
    } catch (err: any) {
      console.error("刪除筆記錯誤:", err);
      setError("無法刪除筆記");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Firebase Firestore 示例</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="輸入新筆記..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
            disabled={isLoading}
          />
          <Button onClick={handleAddNote} disabled={isLoading || !newNote.trim()}>
            添加
          </Button>
        </div>
        
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {notes.length === 0 ? (
            <p className="text-center text-gray-500 py-4">暫無筆記</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <p>{note.text}</p>
                  <p className="text-xs text-gray-500">
                    {note.createdAt.toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteNote(note.id)}
                  disabled={isLoading}
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">
          筆記保存在 Firestore 中，所有用戶可見
        </p>
      </CardFooter>
    </Card>
  );
} 