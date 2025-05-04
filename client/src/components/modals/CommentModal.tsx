import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X, Reply } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentWithReplies } from "@/lib/types";

const commentFormSchema = z.object({
  content: z.string().min(1, {
    message: "留言不能為空",
  }).max(500, {
    message: "留言不能超過 500 個字元",
  }),
  commenter: z.string().min(1, {
    message: "請輸入您的名稱",
  }).max(50, {
    message: "名稱不能超過 50 個字元",
  }),
});

interface CommentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: number | null;
}

export function CommentModal({ open, onOpenChange, requestId }: CommentModalProps) {
  const { toast } = useToast();
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [processedComments, setProcessedComments] = useState<CommentWithReplies[]>([]);
  
  // Fetch request details
  const { data: request, isLoading: isRequestLoading } = useQuery({
    queryKey: ['/api/requests', requestId],
    enabled: !!requestId && open,
  });

  // Fetch comments for the request
  const { 
    data: comments, 
    isLoading: isCommentsLoading,
    isError: isCommentsError
  } = useQuery({
    queryKey: ['/api/comments', requestId],
    enabled: !!requestId && open,
  });

  const form = useForm<z.infer<typeof commentFormSchema>>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: "",
      commenter: "",
    },
  });

  // Process comments to organize replies
  useEffect(() => {
    if (comments) {
      const commentsMap: Record<number, CommentWithReplies> = {};
      const topLevelComments: CommentWithReplies[] = [];

      // First pass: create all comment objects
      comments.forEach((comment: any) => {
        commentsMap[comment.id] = { ...comment, replies: [] };
      });

      // Second pass: organize into tree structure
      comments.forEach((comment: any) => {
        if (comment.parentId) {
          // This is a reply
          if (commentsMap[comment.parentId]) {
            if (!commentsMap[comment.parentId].replies) {
              commentsMap[comment.parentId].replies = [];
            }
            commentsMap[comment.parentId].replies?.push(commentsMap[comment.id]);
          }
        } else {
          // This is a top-level comment
          topLevelComments.push(commentsMap[comment.id]);
        }
      });

      // Sort by date (newest replies first for each comment)
      topLevelComments.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      topLevelComments.forEach(comment => {
        if (comment.replies) {
          comment.replies.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
      });

      setProcessedComments(topLevelComments);
    }
  }, [comments]);

  const commentMutation = useMutation({
    mutationFn: async (values: z.infer<typeof commentFormSchema> & { requestId: number, parentId?: number }) => {
      return apiRequest("POST", "/api/comments", values);
    },
    onSuccess: () => {
      toast({
        title: "留言已送出",
        description: "您的留言已成功發布。",
      });
      form.reset();
      setReplyTo(null);
      // Invalidate the comments query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/comments', requestId] });
      // Also invalidate requests to update comment counts
      queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
    },
    onError: (error) => {
      toast({
        title: "送出失敗",
        description: "無法發送您的留言，請稍後再試。",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof commentFormSchema>) {
    if (!requestId) return;
    
    const commentData = {
      ...values,
      requestId,
      ...(replyTo ? { parentId: replyTo } : {})
    };
    
    commentMutation.mutate(commentData);
  }

  function handleReply(commentId: number) {
    setReplyTo(commentId);
    // Scroll to form and focus
    form.setFocus("content");
  }

  function cancelReply() {
    setReplyTo(null);
  }

  // Get initials for avatar
  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader className="bg-gray-100 px-6 py-4 border-b rounded-t-lg -mx-6 -mt-6">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-gray-800 text-lg">
              {isRequestLoading ? (
                <Skeleton className="h-6 w-32" />
              ) : (
                request?.title
              )}
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-96 pr-4 -mr-4">
          <div className="space-y-4">
            {isCommentsLoading ? (
              // Loading skeleton
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </div>
                </div>
              ))
            ) : processedComments.length > 0 ? (
              processedComments.map((comment) => (
                <div key={comment.id} className="comment">
                  <div className="flex items-start">
                    <Avatar className="h-8 w-8 bg-gray-200">
                      <AvatarFallback className="text-sm text-gray-700">
                        {getInitials(comment.commenter)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3 flex-1">
                      <div className="bg-gray-50 rounded-lg px-4 py-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">{comment.commenter}</span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(comment.createdAt), 'yyyy-MM-dd HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{comment.content}</p>
                      </div>
                      <div className="mt-1 ml-1 flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-gray-500 hover:text-primary h-auto p-0"
                          onClick={() => handleReply(comment.id)}
                        >
                          回覆
                        </Button>
                      </div>
                      
                      {/* Nested replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 ml-6 space-y-3">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="flex items-start">
                              <Avatar className="h-7 w-7 bg-gray-200">
                                <AvatarFallback className="text-xs text-gray-700">
                                  {getInitials(reply.commenter)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-2 flex-1">
                                <div className="bg-gray-50 rounded-lg px-3 py-2">
                                  <div className="flex justify-between">
                                    <span className="font-medium text-gray-900">{reply.commenter}</span>
                                    <span className="text-xs text-gray-500">
                                      {format(new Date(reply.createdAt), 'yyyy-MM-dd HH:mm')}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{reply.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">還沒有任何留言。成為第一個留言的人！</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="bg-gray-50 px-6 py-4 -mx-6 -mb-6 mt-4 rounded-b-lg">
          {replyTo && (
            <div className="flex items-center mb-2 text-sm bg-blue-50 p-2 rounded">
              <Reply className="h-3 w-3 mr-1 text-blue-500" />
              <span className="text-blue-600">回覆評論</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-6 text-xs text-gray-500 hover:bg-blue-100"
                onClick={cancelReply}
              >
                取消
              </Button>
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <div className="flex items-start space-x-2">
                <Avatar className="h-8 w-8 bg-primary">
                  <AvatarFallback className="text-sm text-white">我</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="新增留言..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="mt-2 flex justify-between items-center">
                    <FormField
                      control={form.control}
                      name="commenter"
                      render={({ field }) => (
                        <FormItem className="flex-1 mr-2">
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="你的名稱"
                              className="px-3 py-1 h-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit"
                      disabled={commentMutation.isPending}
                      className="bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 h-8"
                    >
                      {commentMutation.isPending ? "發送中..." : "送出"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
