import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const purchaseFormSchema = z.object({
  purchasedBy: z.string().min(1, {
    message: "購買者姓名不能為空",
  }).max(50, {
    message: "購買者姓名不能超過 50 個字元",
  }),
  purchasedAt: z.string().min(1, {
    message: "請選擇購買日期",
  }),
  purchaseNote: z.string().max(200, {
    message: "備註不能超過 200 個字元",
  }).optional(),
});

interface PurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: number | null;
}

export function PurchaseModal({ open, onOpenChange, requestId }: PurchaseModalProps) {
  const { toast } = useToast();
  
  // Fetch request details
  const { data: request, isLoading: isRequestLoading } = useQuery({
    queryKey: ['/api/requests', requestId],
    enabled: !!requestId && open,
  });

  const form = useForm<z.infer<typeof purchaseFormSchema>>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      purchasedBy: "",
      purchasedAt: new Date().toISOString().split('T')[0], // Today's date as default
      purchaseNote: "",
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async (values: z.infer<typeof purchaseFormSchema>) => {
      if (!requestId) throw new Error("No request ID");
      
      const purchaseData = {
        isPurchased: true,
        purchasedBy: values.purchasedBy,
        purchasedAt: new Date(values.purchasedAt),
        purchaseNote: values.purchaseNote || null
      };
      console.log("送出 purchaseData:", purchaseData, typeof purchaseData.purchasedAt, purchaseData.purchasedAt instanceof Date);
      return apiRequest("PATCH", `/api/requests/${requestId}/purchase`, purchaseData);
    },
    onSuccess: () => {
      toast({
        title: "已標記為購買完成",
        description: "採購需求已成功更新為已購買狀態。",
      });
      form.reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
    },
    onError: (error) => {
      toast({
        title: "標記失敗",
        description: "無法更新採購狀態，請稍後再試。",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof purchaseFormSchema>) {
    purchaseMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="bg-success px-6 py-4 rounded-t-lg -mx-6 -mt-6">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-white text-lg">標記為已購買</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="text-white hover:text-gray-200 hover:bg-success/50 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="mb-4">
          {isRequestLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <>
              <h4 className="font-medium text-gray-800">{request?.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{request?.description}</p>
            </>
          )}
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="purchasedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">購買者姓名</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="請輸入購買者姓名..."
                      className="focus:ring-success focus:border-success"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="purchasedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">購買日期</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="date"
                      className="focus:ring-success focus:border-success"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="purchaseNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">備註（選填）</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="購買相關的備註事項..."
                      rows={2}
                      className="focus:ring-success focus:border-success"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                取消
              </Button>
              <Button 
                type="submit" 
                disabled={purchaseMutation.isPending}
                className="bg-success text-white hover:bg-green-600"
              >
                {purchaseMutation.isPending ? "處理中..." : "確認已購買"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
