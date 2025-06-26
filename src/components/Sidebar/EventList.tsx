
import React from 'react';
import { Calendar, Clock, Repeat } from 'lucide-react';
import { Event, EventCategory } from '../../types/event';
import { formatEventTime, formatDate, isSameDay } from '../../utils/eventUtils';

interface EventListProps {
  events: Event[];
  categories: EventCategory[];
  onEventClick: (event: Event) => void;
}

const EventList: React.FC<EventListProps> = ({
  events,
  categories,
  onEventClick
}) => {
  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6B7280';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  // Group events by date
  const eventsByDate = events.reduce((groups, event) => {
    const dateKey = event.startDate.toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {} as Record<string, Event[]>);

  // Sort dates
  const sortedDates = Object.keys(eventsByDate).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  const today = new Date();

  if (events.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No events found</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {sortedDates.map(dateKey => {
        const date = new Date(dateKey);
        const dayEvents = eventsByDate[dateKey];
        const isToday = isSameDay(date, today);
        
        return (
          <div key={dateKey} className="space-y-2">
            <div className={`
              text-sm font-medium px-2 py-1 rounded-lg
              ${isToday ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}
            `}>
              {isToday ? 'Today' : formatDate(date)}
            </div>
            
            <div className="space-y-2">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0 ring-2 ring-white dark:ring-gray-700"
                      style={{ backgroundColor: getCategoryColor(event.categoryId) }}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {event.title}
                        </h4>
                        {event.recurrence && (
                          <Repeat className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatEventTime(event)}
                        </div>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {getCategoryName(event.categoryId)}
                        </div>
                        
                        {event.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EventList;
