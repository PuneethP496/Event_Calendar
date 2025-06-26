
import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { EventCategory } from '../../types/event';

interface CategoryManagerProps {
  categories: EventCategory[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  onAddCategory: (category: EventCategory) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  selectedCategories,
  onCategoryToggle,
  onAddCategory
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');

  const predefinedColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
  ];

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const newCategory: EventCategory = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      color: newCategoryColor,
    };

    onAddCategory(newCategory);
    setNewCategoryName('');
    setNewCategoryColor('#3B82F6');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-2">
      {/* All Categories Toggle */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="all-categories"
          checked={selectedCategories.length === 0}
          onChange={() => {
            if (selectedCategories.length === 0) {
              // If all are selected, select the first category
              onCategoryToggle(categories[0]?.id || '');
            } else {
              // Clear all selections
              selectedCategories.forEach(categoryId => onCategoryToggle(categoryId));
            }
          }}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="all-categories" className="ml-2 text-sm text-gray-700 font-medium">
          All Categories
        </label>
      </div>

      {/* Individual Categories */}
      {categories.map(category => (
        <div key={category.id} className="flex items-center">
          <input
            type="checkbox"
            id={`category-${category.id}`}
            checked={selectedCategories.includes(category.id)}
            onChange={() => onCategoryToggle(category.id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor={`category-${category.id}`}
            className="ml-2 flex items-center text-sm text-gray-700"
          >
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: category.color }}
            />
            {category.name}
          </label>
        </div>
      ))}

      {/* Add Category */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Category
        </button>
      ) : (
        <form onSubmit={handleAddCategory} className="space-y-2 p-2 bg-gray-50 rounded">
          <input
            type="text"
            placeholder="Category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          
          <div className="flex flex-wrap gap-1">
            {predefinedColors.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setNewCategoryColor(color)}
                className={`
                  w-6 h-6 rounded-full border-2 transition-all
                  ${newCategoryColor === color ? 'border-gray-400 scale-110' : 'border-gray-200'}
                `}
                style={{ backgroundColor: color }}
              >
                {newCategoryColor === color && (
                  <Check className="w-3 h-3 text-white mx-auto" />
                )}
              </button>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewCategoryName('');
                setNewCategoryColor('#3B82F6');
              }}
              className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CategoryManager;
