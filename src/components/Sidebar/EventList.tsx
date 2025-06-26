
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
      <div className="p-4 text-center text-gray-500">
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
              text-sm font-medium px-2 py-1 rounded
              ${isToday ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}
            `}>
              {isToday ? 'Today' : formatDate(date)}
            </div>
            
            <div className="space-y-2">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: getCategoryColor(event.categoryId) }}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {event.title}
                        </h4>
                        {event.recurrence && (
                          <Repeat className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatEventTime(event)}
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          {getCategoryName(event.categoryId)}
                        </div>
                        
                        {event.description && (
                          <p className="text-xs text-gray-600 truncate">
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
