import { useState } from "react";
import RequestBoard from "@/components/requestBoard";
import { NewRequestModal } from "@/components/modals/NewRequestModal";
import { CommentModal } from "@/components/modals/CommentModal";
import { PurchaseModal } from "@/components/modals/PurchaseModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRequestBoard } from "@/hooks/use-request-board";
import FirebaseExample from "@/components/FirebaseExample";
import FirebaseAuthExample from "@/components/FirebaseAuthExample";
import FirebaseFirestoreExample from "@/components/FirebaseFirestoreExample";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const { 
    showNewRequestModal,
    showCommentModal,
    showPurchaseModal,
    selectedRequestId,
    setShowNewRequestModal,
    setShowCommentModal,
    setShowPurchaseModal
  } = useRequestBoard();

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">採購需求告示牌</h1>
        <Button
          onClick={() => setShowNewRequestModal(true)}
          className="bg-primary hover:bg-blue-600 text-white shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> 新增需求
        </Button>
      </div>

      <div className="mb-6">
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="analytics">Firebase Analytics</TabsTrigger>
            <TabsTrigger value="auth">Firebase Auth</TabsTrigger>
            <TabsTrigger value="firestore">Firebase Firestore</TabsTrigger>
          </TabsList>
          <TabsContent value="analytics">
            <FirebaseExample />
          </TabsContent>
          <TabsContent value="auth">
            <FirebaseAuthExample />
          </TabsContent>
          <TabsContent value="firestore">
            <FirebaseFirestoreExample />
          </TabsContent>
        </Tabs>
      </div>

      <RequestBoard />

      <NewRequestModal 
        open={showNewRequestModal} 
        onOpenChange={setShowNewRequestModal} 
      />
      
      <CommentModal 
        open={showCommentModal} 
        onOpenChange={setShowCommentModal}
        requestId={selectedRequestId}
      />
      
      <PurchaseModal 
        open={showPurchaseModal} 
        onOpenChange={setShowPurchaseModal}
        requestId={selectedRequestId}
      />
    </div>
  );
}
