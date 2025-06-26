
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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDateChange(new Date())}
              className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
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
                  min-h-[120px] p-2 border border-gray-200 cursor-pointer transition-colors
                  ${isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                  ${isToday ? 'bg-blue-50 border-blue-200' : ''}
                  ${isSelected ? 'ring-2 ring-blue-500' : ''}
                  ${draggedEvent ? 'hover:bg-blue-100' : ''}
                `}
                onClick={() => onDateClick(date)}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, date)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`
                    text-sm font-medium
                    ${isToday ? 'bg-blue-600 text-white px-2 py-1 rounded-full' : ''}
                  `}>
                    {date.getDate()}
                  </span>
                  {dayEvents.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{dayEvents.length - 3}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
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
