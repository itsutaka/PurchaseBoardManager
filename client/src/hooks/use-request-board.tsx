import React, { useState, createContext, useContext } from "react";
import { RequestFilterOption, RequestSortOption, RequestBoardState } from "@/lib/types";

interface RequestBoardContextType {
  filter: RequestFilterOption;
  sort: RequestSortOption;
  selectedRequestId: number | null;
  showNewRequestModal: boolean;
  showCommentModal: boolean;
  showPurchaseModal: boolean;
  setFilter: (filter: RequestFilterOption) => void;
  setSort: (sort: RequestSortOption) => void;
  setSelectedRequestId: (id: number | null) => void;
  setShowNewRequestModal: (show: boolean) => void;
  setShowCommentModal: (show: boolean) => void;
  setShowPurchaseModal: (show: boolean) => void;
  openCommentModal: () => void;
  openPurchaseModal: () => void;
}

// Create context with default values
const RequestBoardContext = createContext<RequestBoardContextType>({
  filter: "all",
  sort: "newest",
  selectedRequestId: null,
  showNewRequestModal: false,
  showCommentModal: false,
  showPurchaseModal: false,
  setFilter: () => {},
  setSort: () => {},
  setSelectedRequestId: () => {},
  setShowNewRequestModal: () => {},
  setShowCommentModal: () => {},
  setShowPurchaseModal: () => {},
  openCommentModal: () => {},
  openPurchaseModal: () => {},
});

// Provider component
export function RequestBoardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RequestBoardState>({
    filter: "all",
    sort: "newest",
    selectedRequestId: null,
    showNewRequestModal: false,
    showCommentModal: false,
    showPurchaseModal: false,
  });

  const setFilter = (filter: RequestFilterOption) => {
    setState(prev => ({ ...prev, filter }));
  };

  const setSort = (sort: RequestSortOption) => {
    setState(prev => ({ ...prev, sort }));
  };

  const setSelectedRequestId = (id: number | null) => {
    setState(prev => ({ ...prev, selectedRequestId: id }));
  };

  const setShowNewRequestModal = (show: boolean) => {
    setState(prev => ({ ...prev, showNewRequestModal: show }));
  };

  const setShowCommentModal = (show: boolean) => {
    setState(prev => ({ ...prev, showCommentModal: show }));
  };

  const setShowPurchaseModal = (show: boolean) => {
    setState(prev => ({ ...prev, showPurchaseModal: show }));
  };

  const openCommentModal = () => {
    setState(prev => ({ ...prev, showCommentModal: true }));
  };

  const openPurchaseModal = () => {
    setState(prev => ({ ...prev, showPurchaseModal: true }));
  };

  const contextValue: RequestBoardContextType = {
    ...state,
    setFilter,
    setSort,
    setSelectedRequestId,
    setShowNewRequestModal,
    setShowCommentModal,
    setShowPurchaseModal,
    openCommentModal,
    openPurchaseModal,
  };
  
  return (
    <RequestBoardContext.Provider value={contextValue}>
      {children}
    </RequestBoardContext.Provider>
  );
}

// Custom hook for accessing the context
export function useRequestBoard() {
  return useContext(RequestBoardContext);
}
