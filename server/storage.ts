import { 
  users, type User, type InsertUser,
  purchaseRequests, type PurchaseRequest, type InsertPurchaseRequest, type UpdatePurchase,
  comments, type Comment, type InsertComment
} from "@shared/schema";

// Extend the storage interface with methods for purchase requests and comments
export interface IStorage {
  // User methods (keeping the original methods)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Purchase request methods
  getAllPurchaseRequests(): Promise<PurchaseRequest[]>;
  getPurchaseRequestById(id: number): Promise<PurchaseRequest | undefined>;
  createPurchaseRequest(request: InsertPurchaseRequest): Promise<PurchaseRequest>;
  updatePurchaseRequest(id: number, update: Partial<PurchaseRequest>): Promise<PurchaseRequest | undefined>;
  deletePurchaseRequest(id: number): Promise<boolean>;
  markAsPurchased(id: number, purchaseInfo: UpdatePurchase): Promise<PurchaseRequest | undefined>;
  
  // Comment methods
  getCommentsByRequestId(requestId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private purchaseRequests: Map<number, PurchaseRequest>;
  private comments: Map<number, Comment>;
  private userId: number;
  private requestId: number;
  private commentId: number;

  constructor() {
    this.users = new Map();
    this.purchaseRequests = new Map();
    this.comments = new Map();
    this.userId = 1;
    this.requestId = 1;
    this.commentId = 1;

    // Initialize with sample data for development
    this.initSampleData();
  }

  // Initialize with some sample data for development
  private initSampleData() {
    // Add a few purchase requests
    const sampleRequests: InsertPurchaseRequest[] = [
      {
        title: "藍芽鍵盤",
        description: "辦公室需要新的藍芽鍵盤，最好是可以多設備切換的類型",
        requester: "王小明"
      },
      {
        title: "投影機",
        description: "會議室需要一台新的投影機，目前的已經故障無法使用",
        requester: "李華"
      },
      {
        title: "辦公桌",
        description: "需要兩張可調高度的辦公桌，供新進同仁使用",
        requester: "張小明"
      }
    ];

    const date = new Date();
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(now.getDate() - 2);

    const req1: PurchaseRequest = {
      id: this.requestId++,
      ...sampleRequests[0],
      createdAt: yesterday,
      isPurchased: false,
      purchasedBy: null,
      purchasedAt: null,
      purchaseNote: null
    };

    const req2: PurchaseRequest = {
      id: this.requestId++,
      ...sampleRequests[1],
      createdAt: twoDaysAgo,
      isPurchased: true,
      purchasedBy: "王小明",
      purchasedAt: date,
      purchaseNote: "已經購買並安裝在會議室"
    };

    const req3: PurchaseRequest = {
      id: this.requestId++,
      ...sampleRequests[2],
      createdAt: now,
      isPurchased: false,
      purchasedBy: null,
      purchasedAt: null,
      purchaseNote: null
    };

    this.purchaseRequests.set(req1.id, req1);
    this.purchaseRequests.set(req2.id, req2);
    this.purchaseRequests.set(req3.id, req3);

    // Add some comments
    const comment1: Comment = {
      id: this.commentId++,
      requestId: req1.id,
      content: "我建議選購羅技MX Keys，很耐用且可以配對三台設備。",
      commenter: "李華",
      createdAt: yesterday,
      parentId: null
    };

    const comment2: Comment = {
      id: this.commentId++,
      requestId: req1.id,
      content: "同意，我們部門都在使用這款，很好用。",
      commenter: "張小明",
      createdAt: yesterday,
      parentId: this.commentId - 1
    };

    const comment3: Comment = {
      id: this.commentId++,
      requestId: req1.id,
      content: "預算大約是多少？可以考慮無線或是有線的選項。",
      commenter: "王力",
      createdAt: date,
      parentId: null
    };

    this.comments.set(comment1.id, comment1);
    this.comments.set(comment2.id, comment2);
    this.comments.set(comment3.id, comment3);
  }

  // User methods (keeping the original implementation)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Purchase request methods
  async getAllPurchaseRequests(): Promise<PurchaseRequest[]> {
    return Array.from(this.purchaseRequests.values());
  }

  async getPurchaseRequestById(id: number): Promise<PurchaseRequest | undefined> {
    return this.purchaseRequests.get(id);
  }

  async createPurchaseRequest(request: InsertPurchaseRequest): Promise<PurchaseRequest> {
    const id = this.requestId++;
    const now = new Date();
    const newRequest: PurchaseRequest = {
      id,
      ...request,
      createdAt: now,
      isPurchased: false,
      purchasedBy: null,
      purchasedAt: null,
      purchaseNote: null
    };
    this.purchaseRequests.set(id, newRequest);
    return newRequest;
  }

  async updatePurchaseRequest(id: number, update: Partial<PurchaseRequest>): Promise<PurchaseRequest | undefined> {
    const request = this.purchaseRequests.get(id);
    if (!request) return undefined;

    const updatedRequest = { ...request, ...update };
    this.purchaseRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async deletePurchaseRequest(id: number): Promise<boolean> {
    const deleted = this.purchaseRequests.delete(id);
    // Also delete all comments for this request
    if (deleted) {
      const commentsToDelete = Array.from(this.comments.values())
        .filter(comment => comment.requestId === id);
      
      commentsToDelete.forEach(comment => {
        this.comments.delete(comment.id);
      });
    }
    return deleted;
  }

  async markAsPurchased(id: number, purchaseInfo: UpdatePurchase): Promise<PurchaseRequest | undefined> {
    const request = this.purchaseRequests.get(id);
    if (!request) return undefined;

    const updatedRequest: PurchaseRequest = {
      ...request,
      isPurchased: purchaseInfo.isPurchased ?? false,
      purchasedBy: purchaseInfo.purchasedBy ?? null,
      purchasedAt: purchaseInfo.purchasedAt ?? null,
      purchaseNote: purchaseInfo.purchaseNote ?? null
    };
    this.purchaseRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Comment methods
  async getCommentsByRequestId(requestId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.requestId === requestId);
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.commentId++;
    const now = new Date();
    const newComment: Comment = {
      id,
      requestId: comment.requestId,
      content: comment.content,
      commenter: comment.commenter,
      parentId: comment.parentId ?? null,
      createdAt: now
    };
    this.comments.set(id, newComment);
    return newComment;
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }
}

export const storage = new MemStorage();
