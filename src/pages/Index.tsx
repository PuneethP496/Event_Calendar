
import React, { useState, useEffect } from 'react';
import Calendar from '../components/Calendar/Calendar';
import EventModal from '../components/EventModal/EventModal';
import Sidebar from '../components/Sidebar/Sidebar';
import { Event, EventCategory } from '../types/event';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateRecurringEvents, detectConflicts } from '../utils/eventUtils';

const Index = () => {
  const [events, setEvents] = useLocalStorage<Event[]>('calendar-events', []);
  const [categories, setCategories] = useLocalStorage<EventCategory[]>('calendar-categories', [
    { id: '1', name: 'Work', color: '#3B82F6' },
    { id: '2', name: 'Personal', color: '#10B981' },
    { id: '3', name: 'Health', color: '#F59E0B' },
    { id: '4', name: 'Social', color: '#EF4444' },
  ]);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Generate all events including recurring ones
  const allEvents = React.useMemo(() => {
    const generated = events.flatMap(event => 
      event.recurrence ? generateRecurringEvents(event, selectedDate) : [event]
    );
    return generated;
  }, [events, selectedDate]);

  // Filter events based on search and categories
  const filteredEvents = React.useMemo(() => {
    return allEvents.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || 
                             selectedCategories.includes(event.categoryId);
      return matchesSearch && matchesCategory;
    });
  }, [allEvents, searchTerm, selectedCategories]);

  const handleAddEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
    };

    // Check for conflicts
    const conflicts = detectConflicts(newEvent, allEvents);
    if (conflicts.length > 0) {
      const confirmed = window.confirm(
        `This event conflicts with ${conflicts.length} other event(s). Do you want to continue?`
      );
      if (!confirmed) return;
    }

    setEvents([...events, newEvent]);
    setShowEventModal(false);
  };

  const handleEditEvent = (eventData: Omit<Event, 'id'>) => {
    if (!editingEvent) return;
    
    const updatedEvent = { ...eventData, id: editingEvent.id };
    const otherEvents = allEvents.filter(e => e.id !== editingEvent.id);
    const conflicts = detectConflicts(updatedEvent, otherEvents);
    
    if (conflicts.length > 0) {
      const confirmed = window.confirm(
        `This event conflicts with ${conflicts.length} other event(s). Do you want to continue?`
      );
      if (!confirmed) return;
    }

    setEvents(events.map(e => e.id === editingEvent.id ? updatedEvent : e));
    setEditingEvent(null);
    setShowEventModal(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this event?');
    if (confirmed) {
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  const handleEventDrop = (eventId: string, newDate: Date, newTime?: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const updatedEvent = {
      ...event,
      startDate: newDate,
      endDate: newDate,
      startTime: newTime || event.startTime,
    };

    const otherEvents = allEvents.filter(e => e.id !== eventId);
    const conflicts = detectConflicts(updatedEvent, otherEvents);
    
    if (conflicts.length > 0) {
      const confirmed = window.confirm(
        `Moving this event conflicts with ${conflicts.length} other event(s). Do you want to continue?`
      );
      if (!confirmed) return;
    }

    setEvents(events.map(e => e.id === eventId ? updatedEvent : e));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const handleEventClick = (event: Event) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoryToggle={(categoryId) => {
          setSelectedCategories(prev => 
            prev.includes(categoryId) 
              ? prev.filter(id => id !== categoryId)
              : [...prev, categoryId]
          );
        }}
        events={filteredEvents}
        onEventClick={handleEventClick}
        onAddCategory={(category) => setCategories([...categories, category])}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Event Calendar</h1>
              <div className="text-sm text-gray-500">
                FLAM AR Experiences - Frontend Assignment
              </div>
            </div>
            <button
              onClick={() => {
                setEditingEvent(null);
                setShowEventModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Event
            </button>
          </div>
        </header>

        {/* Calendar */}
        <main className="flex-1 overflow-auto p-6">
          <Calendar
            events={filteredEvents}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onEventDrop={handleEventDrop}
            categories={categories}
          />
        </main>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setEditingEvent(null);
          }}
          onSave={editingEvent ? handleEditEvent : handleAddEvent}
          onDelete={editingEvent ? () => handleDeleteEvent(editingEvent.id) : undefined}
          event={editingEvent}
          initialDate={selectedDate}
          categories={categories}
        />
      )}
    </div>
  );
};

export default Index;
