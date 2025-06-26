
import React from 'react';
import { Search, Plus, X, Filter } from 'lucide-react';
import { Event, EventCategory } from '../../types/event';
import EventList from './EventList';
import CategoryManager from './CategoryManager';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categories: EventCategory[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  events: Event[];
  onEventClick: (event: Event) => void;
  onAddCategory: (category: EventCategory) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  searchTerm,
  onSearchChange,
  categories,
  selectedCategories,
  onCategoryToggle,
  events,
  onEventClick,
  onAddCategory
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Events</h2>
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-md hover:bg-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-4 border-b">
          <div className="flex items-center mb-3">
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by Category</span>
          </div>
          
          <CategoryManager
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryToggle={onCategoryToggle}
            onAddCategory={onAddCategory}
          />
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto">
          <EventList
            events={events}
            categories={categories}
            onEventClick={onEventClick}
          />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
