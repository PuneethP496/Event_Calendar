
import React from 'react';
import { Event } from '../../types/event';
import { formatEventTime } from '../../utils/eventUtils';

interface EventCardProps {
  event: Event;
  color: string;
  onClick: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  color,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging = false
}) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`
        group relative p-1 sm:p-1.5 rounded text-xs cursor-pointer transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-lg hover:scale-105 hover:-translate-y-0.5'}
        text-white font-medium
      `}
      style={{ backgroundColor: color }}
    >
      <div className="truncate font-medium text-xs sm:text-xs leading-tight">{event.title}</div>
      {event.startTime && (
        <div className="truncate opacity-90 text-xs leading-tight hidden sm:block">
          {formatEventTime(event)}
        </div>
      )}
      
      {/* Recurrence indicator */}
      {event.recurrence && (
        <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white bg-opacity-80 rounded-full"></div>
      )}
      
      {/* Enhanced hover effect */}
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded transition-all duration-200"></div>
    </div>
  );
};

export default EventCard;
