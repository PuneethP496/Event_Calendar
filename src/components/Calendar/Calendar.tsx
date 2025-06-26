
import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Event, EventCategory } from '../../types/event';
import EventCard from './EventCard';
import { isSameDay } from '../../utils/eventUtils';

interface CalendarProps {
  events: Event[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onDateClick: (date: Date) => void;
  onEventClick: (event: Event) => void;
  onEventDrop: (eventId: string, newDate: Date, newTime?: string) => void;
  categories: EventCategory[];
}

const Calendar: React.FC<CalendarProps> = ({
  events,
  selectedDate,
  onDateChange,
  onDateClick,
  onEventClick,
  onEventDrop,
  categories
}) => {
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const dragCounter = useRef(0);

  const today = new Date();
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // Get first day of month and calculate calendar grid
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate calendar days including previous/next month padding
  const calendarDays: Date[] = [];
  
  // Previous month padding
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    calendarDays.push(date);
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }
  
  // Next month padding to complete the grid
  const remainingCells = 42 - calendarDays.length; // 6 weeks * 7 days
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push(new Date(year, month + 1, day));
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(month + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.startDate, date));
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6B7280';
  };

  const handleDragStart = (e: React.DragEvent, event: Event) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedEvent(null);
    dragCounter.current = 0;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    dragCounter.current = 0;
    
    if (draggedEvent) {
      onEventDrop(draggedEvent.id, date);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Calendar Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-600/50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => onDateChange(new Date())}
              className="px-3 py-1 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-600/50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-3 sm:p-6">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.substring(0, 1)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const isCurrentMonth = date.getMonth() === month;
            const isToday = isSameDay(date, today);
            const isSelected = isSameDay(date, selectedDate);
            const dayEvents = getEventsForDate(date);

            return (
              <div
                key={index}
                className={`
                  min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border border-gray-200 dark:border-gray-600 cursor-pointer transition-all duration-200 rounded-lg
                  ${isCurrentMonth ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700' : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500'}
                  ${isToday ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700' : ''}
                  ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                  ${draggedEvent ? 'hover:bg-blue-100 dark:hover:bg-blue-900/50' : ''}
                `}
                onClick={() => onDateClick(date)}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, date)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`
                    text-xs sm:text-sm font-medium
                    ${isToday ? 'bg-blue-600 dark:bg-blue-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs' : 'text-gray-900 dark:text-gray-100'}
                  `}>
                    {date.getDate()}
                  </span>
                  {dayEvents.length > 2 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{dayEvents.length - 2}
                    </span>
                  )}
                </div>

                <div className="space-y-0.5 sm:space-y-1">
                  {dayEvents.slice(0, 2).map((event, eventIndex) => (
                    <EventCard
                      key={`${event.id}-${eventIndex}`}
                      event={event}
                      color={getCategoryColor(event.categoryId)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      onDragStart={(e) => handleDragStart(e, event)}
                      onDragEnd={handleDragEnd}
                      isDragging={draggedEvent?.id === event.id}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
