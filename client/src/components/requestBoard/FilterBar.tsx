import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RequestFilterOption, RequestSortOption } from "@/lib/types";

interface FilterBarProps {
  currentFilter: RequestFilterOption;
  currentSort: RequestSortOption;
  onFilterChange: (filter: RequestFilterOption) => void;
  onSortChange: (sort: RequestSortOption) => void;
}

export function FilterBar({ 
  currentFilter, 
  currentSort, 
  onFilterChange, 
  onSortChange 
}: FilterBarProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">篩選：</span>
            <Button
              variant={currentFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              className={`rounded-full text-sm h-8 ${
                currentFilter === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-800 hover:text-primary hover:bg-gray-100'
              }`}
              onClick={() => onFilterChange('all')}
            >
              全部
            </Button>
            <Button
              variant={currentFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              className={`rounded-full text-sm h-8 ${
                currentFilter === 'pending' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-800 hover:text-primary hover:bg-gray-100'
              }`}
              onClick={() => onFilterChange('pending')}
            >
              待購買
            </Button>
            <Button
              variant={currentFilter === 'purchased' ? 'default' : 'outline'}
              size="sm"
              className={`rounded-full text-sm h-8 ${
                currentFilter === 'purchased' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-800 hover:text-primary hover:bg-gray-100'
              }`}
              onClick={() => onFilterChange('purchased')}
            >
              已購買
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">排序：</span>
            <Select value={currentSort} onValueChange={(value) => onSortChange(value as RequestSortOption)}>
              <SelectTrigger className="w-[180px] h-8 text-sm bg-gray-100">
                <SelectValue placeholder="選擇排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">最新建立</SelectItem>
                <SelectItem value="oldest">最早建立</SelectItem>
                <SelectItem value="comments">留言數量</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
