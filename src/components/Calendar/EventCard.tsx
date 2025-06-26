
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
        group relative p-1.5 rounded text-xs cursor-pointer transition-all
        ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md hover:scale-105'}
        text-white font-medium
      `}
      style={{ backgroundColor: color }}
    >
      <div className="truncate font-medium">{event.title}</div>
      {event.startTime && (
        <div className="truncate opacity-90 text-xs">
          {formatEventTime(event)}
        </div>
      )}
      
      {/* Recurrence indicator */}
      {event.recurrence && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-white bg-opacity-80 rounded-full m-1"></div>
      )}
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded transition-opacity"></div>
    </div>
  );
};

export default EventCard;
