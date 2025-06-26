
import { Event, EventConflict, RecurrenceRule } from '../types/event';

export function generateRecurringEvents(event: Event, viewDate: Date): Event[] {
  if (!event.recurrence) return [event];

  const events: Event[] = [event];
  const { type, interval, endDate, daysOfWeek, dayOfMonth } = event.recurrence;
  
  // Generate events for the current month and adjacent months for better UX
  const startRange = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
  const endRange = new Date(viewDate.getFullYear(), viewDate.getMonth() + 2, 0);
  
  let currentDate = new Date(event.startDate);
  
  while (currentDate <= endRange && (!endDate || currentDate <= endDate)) {
    if (type === 'daily') {
      currentDate = new Date(currentDate.getTime() + (interval * 24 * 60 * 60 * 1000));
    } else if (type === 'weekly') {
      if (daysOfWeek && daysOfWeek.length > 0) {
        // Handle weekly recurrence with specific days
        for (const dayOfWeek of daysOfWeek) {
          const nextDate = getNextWeekday(currentDate, dayOfWeek);
          if (nextDate > event.startDate && nextDate >= startRange && nextDate <= endRange) {
            events.push({
              ...event,
              id: `${event.id}-${nextDate.getTime()}`,
              startDate: nextDate,
              endDate: nextDate,
            });
          }
        }
        currentDate = new Date(currentDate.getTime() + (7 * interval * 24 * 60 * 60 * 1000));
      } else {
        currentDate = new Date(currentDate.getTime() + (7 * interval * 24 * 60 * 60 * 1000));
      }
    } else if (type === 'monthly') {
      const nextMonth = new Date(currentDate);
      nextMonth.setMonth(nextMonth.getMonth() + interval);
      if (dayOfMonth) {
        nextMonth.setDate(dayOfMonth);
      }
      currentDate = nextMonth;
    }
    
    if (currentDate > event.startDate && currentDate >= startRange && currentDate <= endRange) {
      events.push({
        ...event,
        id: `${event.id}-${currentDate.getTime()}`,
        startDate: new Date(currentDate),
        endDate: new Date(currentDate),
      });
    }
  }
  
  return events.filter(e => e.startDate >= startRange && e.startDate <= endRange);
}

function getNextWeekday(date: Date, targetDay: number): Date {
  const result = new Date(date);
  const currentDay = result.getDay();
  const daysUntilTarget = (targetDay - currentDay + 7) % 7;
  result.setDate(result.getDate() + (daysUntilTarget || 7));
  return result;
}

export function detectConflicts(newEvent: Event, existingEvents: Event[]): EventConflict[] {
  const conflicts: EventConflict[] = [];
  
  for (const existing of existingEvents) {
    if (eventsOverlap(newEvent, existing)) {
      conflicts.push({
        event1: newEvent,
        event2: existing,
        type: eventTimesEqual(newEvent, existing) ? 'same_time' : 'overlap'
      });
    }
  }
  
  return conflicts;
}

function eventsOverlap(event1: Event, event2: Event): boolean {
  const date1 = event1.startDate.toDateString();
  const date2 = event2.startDate.toDateString();
  
  if (date1 !== date2) return false;
  
  if (event1.isAllDay || event2.isAllDay) return true;
  if (!event1.startTime || !event2.startTime) return false;
  
  const start1 = timeToMinutes(event1.startTime);
  const end1 = timeToMinutes(event1.endTime || event1.startTime);
  const start2 = timeToMinutes(event2.startTime);
  const end2 = timeToMinutes(event2.endTime || event2.startTime);
  
  return start1 < end2 && start2 < end1;
}

function eventTimesEqual(event1: Event, event2: Event): boolean {
  return event1.startTime === event2.startTime && event1.endTime === event2.endTime;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatEventTime(event: Event): string {
  if (event.isAllDay) return 'All day';
  if (!event.startTime) return '';
  
  const start = formatTime(event.startTime);
  const end = event.endTime ? formatTime(event.endTime) : '';
  
  return end ? `${start} - ${end}` : start;
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
