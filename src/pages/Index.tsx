import React, { useState, useEffect } from 'react';
import { Menu, Plus } from 'lucide-react';
import Calendar from '../components/Calendar/Calendar';
import EventModal from '../components/EventModal/EventModal';
import Sidebar from '../components/Sidebar/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <div className="flex h-screen">
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
          {/* Enhanced Header */}
          <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Open sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                <div className="flex flex-col">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Event Calendar
                  </h1>
                  <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">
                    FLAM AR Experiences - Frontend Assignment
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <button
                  onClick={() => {
                    setEditingEvent(null);
                    setShowEventModal(true);
                  }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Event</span>
                </button>
              </div>
            </div>
          </header>

          {/* Calendar with enhanced responsive design */}
          <main className="flex-1 overflow-auto p-3 sm:p-6">
            <div className="max-w-7xl mx-auto">
              <Calendar
                events={filteredEvents}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
                onEventDrop={handleEventDrop}
                categories={categories}
              />
            </div>
          </main>
        </div>
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
