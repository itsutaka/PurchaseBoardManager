// Import the types from the shared schema for reuse on the frontend
import type { 
  PurchaseRequest, 
  Comment, 
  InsertPurchaseRequest,
  InsertComment,
  UpdatePurchase
} from "@shared/schema";

// Re-export the types
export type { 
  PurchaseRequest, 
  Comment, 
  InsertPurchaseRequest,
  InsertComment,
  UpdatePurchase
};

// Extended types for frontend use
export type PurchaseRequestWithCommentCount = PurchaseRequest & {
  commentCount: number;
};

export type CommentWithReplies = Comment & {
  replies?: CommentWithReplies[];
};

export type RequestSortOption = "newest" | "oldest" | "comments";

export type RequestFilterOption = "all" | "pending" | "purchased";

export interface RequestBoardState {
  filter: RequestFilterOption;
  sort: RequestSortOption;
  selectedRequestId: number | null;
  showNewRequestModal: boolean;
  showCommentModal: boolean;
  showPurchaseModal: boolean;
}
