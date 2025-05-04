import { format } from 'date-fns';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PurchaseRequestWithCommentCount } from "@/lib/types";
import { MessageSquare, Check, Undo2, Pencil, Trash2, Clock, Calendar } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RequestCardProps {
  request: PurchaseRequestWithCommentCount;
  onAction: (action: string) => void;
}

export function RequestCard({ request, onAction }: RequestCardProps) {
  const { toast } = useToast();
  
  // Format dates
  const formattedCreatedDate = format(new Date(request.createdAt), 'yyyy-MM-dd');
  const formattedPurchasedDate = request.purchasedAt 
    ? format(new Date(request.purchasedAt), 'yyyy-MM-dd')
    : null;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', `/api/requests/${request.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
      toast({
        title: "已刪除需求",
        description: "採購需求已成功刪除。",
      });
    },
    onError: (error) => {
      toast({
        title: "刪除失敗",
        description: "無法刪除此採購需求，請稍後再試。",
        variant: "destructive",
      });
    }
  });

  // Undo purchase mutation
  const undoPurchaseMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('PATCH', `/api/requests/${request.id}/purchase`, {
        isPurchased: false,
        purchasedBy: null,
        purchasedAt: null,
        purchaseNote: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
      toast({
        title: "已撤銷購買狀態",
        description: "採購需求已重置為待購買狀態。",
      });
    },
    onError: (error) => {
      toast({
        title: "操作失敗",
        description: "無法撤銷購買狀態，請稍後再試。",
        variant: "destructive",
      });
    }
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleUndoPurchase = () => {
    undoPurchaseMutation.mutate();
  };

  return (
    <Card className={`overflow-hidden hover:shadow-md transition border-l-4 ${
      request.isPurchased ? 'border-success' : 'border-warning'
    }`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <Badge 
              variant="outline" 
              className={`${
                request.isPurchased 
                  ? 'bg-green-100 text-success' 
                  : 'bg-yellow-100 text-warning'
              }`}
            >
              {request.isPurchased ? '已購買' : '待購買'}
            </Badge>
            <h3 className="mt-2 text-lg font-medium text-gray-900">{request.title}</h3>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-primary" title="編輯">
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-destructive" title="刪除">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>確定要刪除此採購需求？</AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作無法撤銷。所有與此需求相關的留言也將被刪除。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {deleteMutation.isPending ? "刪除中..." : "刪除"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-600">{request.description}</p>
        <div className="mt-3 flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>{formattedCreatedDate}</span>
          <span className="mx-2">•</span>
          <MessageSquare className="h-4 w-4 mr-1" />
          <span>{request.commentCount}</span>
        </div>
        {request.isPurchased && (
          <div className="mt-2 text-sm">
            <span className="text-gray-600">購買者：</span>
            <span className="font-medium text-gray-900">{request.purchasedBy}</span>
            <span className="mx-1 text-gray-400">•</span>
            <span className="text-gray-600">{formattedPurchasedDate}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-3 flex justify-between">
        <Button 
          variant="ghost" 
          className="text-primary text-sm font-medium hover:text-blue-700 p-0 h-auto"
          onClick={() => onAction('comment')}
        >
          <MessageSquare className="h-4 w-4 mr-1" /> 留言
        </Button>
        
        {request.isPurchased ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-gray-500 text-sm font-medium hover:text-gray-700 p-0 h-auto"
              >
                <Undo2 className="h-4 w-4 mr-1" /> 撤銷購買
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>確定要撤銷購買狀態？</AlertDialogTitle>
                <AlertDialogDescription>
                  此操作將把此需求重置為「待購買」狀態。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handleUndoPurchase}>
                  {undoPurchaseMutation.isPending ? "處理中..." : "確認撤銷"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button 
            variant="ghost" 
            className="text-success text-sm font-medium hover:text-green-700 p-0 h-auto"
            onClick={() => onAction('purchase')}
          >
            <Check className="h-4 w-4 mr-1" /> 標記為已購買
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
