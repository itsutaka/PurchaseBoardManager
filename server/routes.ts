import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPurchaseRequestSchema, purchaseUpdateSchema, insertCommentSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Purchase Requests API
  const requestsRouter = express.Router();

  // GET all purchase requests
  requestsRouter.get("/", async (req: Request, res: Response) => {
    try {
      const requests = await storage.getAllPurchaseRequests();
      // 取得所有留言
      const allComments = Array.from(storage['comments'].values());
      // 將每個 request 加上 commentCount
      const requestsWithCommentCount = requests.map(request => {
        const commentCount = allComments.filter(c => c.requestId === request.id).length;
        return { ...request, commentCount };
      });
      res.json(requestsWithCommentCount);
    } catch (error) {
      console.error("Error fetching requests:", error);
      res.status(500).json({ message: "Failed to fetch purchase requests" });
    }
  });

  // GET a specific purchase request by ID
  requestsRouter.get("/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      const request = await storage.getPurchaseRequestById(id);
      if (!request) {
        return res.status(404).json({ message: "Purchase request not found" });
      }
      
      res.json(request);
    } catch (error) {
      console.error("Error fetching request:", error);
      res.status(500).json({ message: "Failed to fetch purchase request" });
    }
  });

  // POST create a new purchase request
  requestsRouter.post("/", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPurchaseRequestSchema.parse(req.body);
      const newRequest = await storage.createPurchaseRequest(validatedData);
      res.status(201).json(newRequest);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating request:", error);
      res.status(500).json({ message: "Failed to create purchase request" });
    }
  });

  // PUT update a purchase request
  requestsRouter.put("/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      const request = await storage.getPurchaseRequestById(id);
      if (!request) {
        return res.status(404).json({ message: "Purchase request not found" });
      }
      
      // Validate the incoming data using our schema
      const validatedData = insertPurchaseRequestSchema.parse(req.body);
      
      const updatedRequest = await storage.updatePurchaseRequest(id, validatedData);
      res.json(updatedRequest);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error updating request:", error);
      res.status(500).json({ message: "Failed to update purchase request" });
    }
  });

  // PATCH mark a purchase request as purchased
  requestsRouter.patch("/:id/purchase", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      const request = await storage.getPurchaseRequestById(id);
      if (!request) {
        return res.status(404).json({ message: "Purchase request not found" });
      }
      
      // Validate the purchase data
      const validatedData = purchaseUpdateSchema.parse(req.body);
      
      const updatedRequest = await storage.markAsPurchased(id, validatedData);
      res.json(updatedRequest);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error marking request as purchased:", error);
      res.status(500).json({ message: "Failed to mark request as purchased" });
    }
  });

  // DELETE a purchase request
  requestsRouter.delete("/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      const success = await storage.deletePurchaseRequest(id);
      if (!success) {
        return res.status(404).json({ message: "Purchase request not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting request:", error);
      res.status(500).json({ message: "Failed to delete purchase request" });
    }
  });

  // Comments API
  const commentsRouter = express.Router();

  // GET comments for a specific purchase request
  commentsRouter.get("/:requestId", async (req: Request, res: Response) => {
    try {
      const requestId = parseInt(req.params.requestId);
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      const comments = await storage.getCommentsByRequestId(requestId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // POST create a new comment
  commentsRouter.post("/", async (req: Request, res: Response) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      
      // Check if the request exists
      const request = await storage.getPurchaseRequestById(validatedData.requestId);
      if (!request) {
        return res.status(404).json({ message: "Purchase request not found" });
      }
      
      // Check if parent comment exists if parentId is provided
      if (validatedData.parentId) {
        const comments = await storage.getCommentsByRequestId(validatedData.requestId);
        const parentComment = comments.find(c => c.id === validatedData.parentId);
        if (!parentComment) {
          return res.status(404).json({ message: "Parent comment not found" });
        }
      }
      
      const newComment = await storage.createComment(validatedData);
      res.status(201).json(newComment);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // DELETE a comment
  commentsRouter.delete("/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }
      
      const success = await storage.deleteComment(id);
      if (!success) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Register routes with appropriate prefixes
  app.use("/api/requests", requestsRouter);
  app.use("/api/comments", commentsRouter);

  const httpServer = createServer(app);

  return httpServer;
}
