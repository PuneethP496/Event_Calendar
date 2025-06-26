
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, Repeat, Trash2 } from 'lucide-react';
import { Event, EventCategory, RecurrenceRule } from '../../types/event';
import RecurrenceForm from './RecurrenceForm';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, 'id'>) => void;
  onDelete?: () => void;
  event?: Event | null;
  initialDate?: Date;
  categories: EventCategory[];
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  initialDate,
  categories
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    startTime: '',
    endTime: '',
    categoryId: categories[0]?.id || '',
    isAllDay: false,
    hasRecurrence: false,
    recurrence: undefined as RecurrenceRule | undefined,
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        startDate: event.startDate,
        endDate: event.endDate,
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        categoryId: event.categoryId,
        isAllDay: event.isAllDay || false,
        hasRecurrence: !!event.recurrence,
        recurrence: event.recurrence,
      });
    } else if (initialDate) {
      setFormData(prev => ({
        ...prev,
        startDate: initialDate,
        endDate: initialDate,
        categoryId: categories[0]?.id || '',
      }));
    }
  }, [event, initialDate, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData: Omit<Event, 'id'> = {
      title: formData.title,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      startTime: formData.isAllDay ? undefined : formData.startTime,
      endTime: formData.isAllDay ? undefined : formData.endTime,
      categoryId: formData.categoryId,
      isAllDay: formData.isAllDay,
      recurrence: formData.hasRecurrence ? formData.recurrence : undefined,
    };

    onSave(eventData);
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const date = new Date(value);
    setFormData(prev => ({
      ...prev,
      [field]: date,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {event ? 'Edit Event' : 'Create Event'}
            </h2>
            <div className="flex items-center space-x-2">
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter event title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter event description"
              />
            </div>

            {/* Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formatDateForInput(formData.startDate)}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formatDateForInput(formData.endDate)}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* All Day Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allDay"
                checked={formData.isAllDay}
                onChange={(e) => setFormData(prev => ({ ...prev, isAllDay: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="allDay" className="ml-2 text-sm text-gray-700">
                All day event
              </label>
            </div>

            {/* Time */}
            {!formData.isAllDay && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Tag className="w-4 h-4 inline mr-1" />
                Category *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Recurrence Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasRecurrence"
                checked={formData.hasRecurrence}
                onChange={(e) => setFormData(prev => ({ ...prev, hasRecurrence: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="hasRecurrence" className="ml-2 text-sm text-gray-700">
                <Repeat className="w-4 h-4 inline mr-1" />
                Repeat event
              </label>
            </div>

            {/* Recurrence Form */}
            {formData.hasRecurrence && (
              <RecurrenceForm
                recurrence={formData.recurrence}
                onChange={(recurrence) => setFormData(prev => ({ ...prev, recurrence }))}
              />
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {event ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
