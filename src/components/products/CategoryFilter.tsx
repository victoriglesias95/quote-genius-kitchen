
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <Badge 
        variant={selectedCategory === null ? "default" : "outline"}
        className="cursor-pointer"
        onClick={() => onSelectCategory(null)}
      >
        All Categories
      </Badge>
      
      {categories.map(category => (
        <Badge 
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </Badge>
      ))}
    </div>
  );
};

export default CategoryFilter;
