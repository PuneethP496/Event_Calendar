
export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  categoryId: string;
  recurrence?: RecurrenceRule;
  isAllDay?: boolean;
}

export interface RecurrenceRule {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number; // Every X days/weeks/months
  endDate?: Date;
  daysOfWeek?: number[]; // For weekly: 0 = Sunday, 1 = Monday, etc.
  dayOfMonth?: number; // For monthly
}

export interface EventCategory {
  id: string;
  name: string;
  color: string;
}

export interface EventConflict {
  event1: Event;
  event2: Event;
  type: 'overlap' | 'same_time';
}
