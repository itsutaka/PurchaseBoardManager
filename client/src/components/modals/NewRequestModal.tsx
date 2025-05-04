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
import { insertPurchaseRequestSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

const formSchema = insertPurchaseRequestSchema.extend({
  title: z.string().min(2, {
    message: "標題必須至少 2 個字元",
  }).max(100, {
    message: "標題不能超過 100 個字元",
  }),
  description: z.string().min(5, {
    message: "詳細描述必須至少 5 個字元",
  }).max(500, {
    message: "詳細描述不能超過 500 個字元",
  }),
  requester: z.string().min(2, {
    message: "提出者姓名必須至少 2 個字元",
  }).max(50, {
    message: "提出者姓名不能超過 50 個字元",
  }),
});

interface NewRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewRequestModal({ open, onOpenChange }: NewRequestModalProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      requester: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return apiRequest("POST", "/api/requests", values);
    },
    onSuccess: async () => {
      toast({
        title: "需求已提交",
        description: "您的採購需求已成功提交。",
      });
      form.reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
    },
    onError: (error) => {
      toast({
        title: "提交失敗",
        description: "無法提交您的需求，請稍後再試。",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="bg-primary px-6 py-4 rounded-t-lg -mx-6 -mt-6">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-white text-lg">新增採購需求</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="text-white hover:text-gray-200 hover:bg-primary/50 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">需求標題</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="請輸入標題..." className="focus:ring-primary focus:border-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">詳細描述</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="請描述需求的詳細內容..."
                      rows={4}
                      className="focus:ring-primary focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="requester"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">提出者姓名</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="請輸入您的姓名..."
                      className="focus:ring-primary focus:border-primary"
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
                disabled={mutation.isPending}
                className="bg-primary text-white hover:bg-blue-600"
              >
                {mutation.isPending ? "提交中..." : "提交需求"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
