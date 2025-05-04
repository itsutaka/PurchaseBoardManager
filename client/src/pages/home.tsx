import { useState } from "react";
import RequestBoard from "@/components/requestBoard";
import { NewRequestModal } from "@/components/modals/NewRequestModal";
import { CommentModal } from "@/components/modals/CommentModal";
import { PurchaseModal } from "@/components/modals/PurchaseModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRequestBoard } from "@/hooks/use-request-board";

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
