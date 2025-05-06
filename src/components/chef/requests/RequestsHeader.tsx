
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Plus, Search } from 'lucide-react';

interface RequestsHeaderProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreateRequest: () => void;
}

export const RequestsHeader: React.FC<RequestsHeaderProps> = ({ 
  searchTerm, 
  onSearchChange, 
  onCreateRequest 
}) => {
  return (
    <div className="flex flex-col xs:flex-row justify-between gap-3 xs:items-center mb-4">
      <h1 className="text-lg xs:text-xl font-bold">Requests</h1>
      <div className="flex gap-2 w-full xs:w-auto">
        <div className="relative flex-1 xs:min-w-[160px]">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={onSearchChange}
            className="pl-8 h-9"
          />
        </div>
        <Button variant="outline" size="sm" className="shrink-0 flex items-center gap-1">
          <Filter className="h-4 w-4" />
          <span className="hidden xs:inline">Filter</span>
        </Button>
        <Button size="sm" className="shrink-0 flex items-center gap-1" onClick={onCreateRequest}>
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">New</span>
        </Button>
      </div>
    </div>
  );
};
