import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { RequestCard } from "./RequestCard";
import { FilterBar } from "./FilterBar";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { RequestFilterOption, RequestSortOption, PurchaseRequestWithCommentCount } from "@/lib/types";
import { useRequestBoard } from "@/hooks/use-request-board";

export function RequestBoard() {
  const { toast } = useToast();
  const { 
    filter, 
    sort, 
    setFilter, 
    setSort, 
    setSelectedRequestId,
    openCommentModal,
    openPurchaseModal,
  } = useRequestBoard();

  // Fetch requests
  const { 
    data: requests, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['/api/requests'],
    retry: 1,
  });

  // Fetch comments for counting
  const { 
    data: comments, 
    isLoading: isCommentsLoading,
  } = useQuery({
    queryKey: ['/api/comments'],
    enabled: !!requests,
  });

  // Process and filter requests
  const [processedRequests, setProcessedRequests] = useState<PurchaseRequestWithCommentCount[]>([]);

  useEffect(() => {
    if (requests && !isLoading) {
      // 不要再前端重新計算 commentCount，直接用後端回傳的
      let filteredRequests = requests;
      if (filter === 'pending') {
        filteredRequests = requests.filter((r: any) => !r.isPurchased);
      } else if (filter === 'purchased') {
        filteredRequests = requests.filter((r: any) => r.isPurchased);
      }

      let sortedRequests = [...filteredRequests];
      if (sort === 'newest') {
        sortedRequests.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sort === 'oldest') {
        sortedRequests.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      } else if (sort === 'comments') {
        sortedRequests.sort((a, b) => b.commentCount - a.commentCount);
      }

      setProcessedRequests(sortedRequests);
    }
  }, [requests, filter, sort, isLoading]);

  // Handle filter and sort changes
  const handleFilterChange = (newFilter: RequestFilterOption) => {
    setFilter(newFilter);
  };

  const handleSortChange = (newSort: RequestSortOption) => {
    setSort(newSort);
  };

  // Handle card actions
  const handleCardAction = (action: string, requestId: number) => {
    setSelectedRequestId(requestId);
    
    if (action === 'comment') {
      openCommentModal();
    } else if (action === 'purchase') {
      openPurchaseModal();
    }
  };

  if (isError) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load purchase requests. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <FilterBar 
        currentFilter={filter} 
        currentSort={sort} 
        onFilterChange={handleFilterChange} 
        onSortChange={handleSortChange} 
      />
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedRequests.length > 0 ? (
            processedRequests.map((request) => (
              <RequestCard 
                key={request.id} 
                request={request} 
                onAction={(action) => handleCardAction(action, request.id)}
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <p className="text-gray-500">No purchase requests found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RequestBoard;
