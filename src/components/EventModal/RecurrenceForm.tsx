
import React from 'react';
import { RecurrenceRule } from '../../types/event';

interface RecurrenceFormProps {
  recurrence?: RecurrenceRule;
  onChange: (recurrence: RecurrenceRule) => void;
}

const RecurrenceForm: React.FC<RecurrenceFormProps> = ({ recurrence, onChange }) => {
  const defaultRecurrence: RecurrenceRule = {
    type: 'weekly',
    interval: 1,
  };

  const currentRecurrence = recurrence || defaultRecurrence;

  const handleChange = (updates: Partial<RecurrenceRule>) => {
    onChange({ ...currentRecurrence, ...updates });
  };

  const weekDays = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
  ];

  const formatDateForInput = (date?: Date) => {
    return date ? date.toISOString().split('T')[0] : '';
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-md">
      <h4 className="text-sm font-medium text-gray-700">Repeat Settings</h4>
      
      {/* Recurrence Type */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">Repeat</label>
        <select
          value={currentRecurrence.type}
          onChange={(e) => handleChange({ type: e.target.value as RecurrenceRule['type'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* Interval */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Every {currentRecurrence.interval} {currentRecurrence.type === 'daily' ? 'day(s)' : 
                   currentRecurrence.type === 'weekly' ? 'week(s)' : 'month(s)'}
        </label>
        <input
          type="number"
          min="1"
          max="365"
          value={currentRecurrence.interval}
          onChange={(e) => handleChange({ interval: parseInt(e.target.value) || 1 })}
          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Weekly Days */}
      {currentRecurrence.type === 'weekly' && (
        <div>
          <label className="block text-sm text-gray-600 mb-2">Repeat on</label>
          <div className="flex flex-wrap gap-2">
            {weekDays.map(day => (
              <label key={day.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentRecurrence.daysOfWeek?.includes(day.value) || false}
                  onChange={(e) => {
                    const daysOfWeek = currentRecurrence.daysOfWeek || [];
                    if (e.target.checked) {
                      handleChange({ daysOfWeek: [...daysOfWeek, day.value] });
                    } else {
                      handleChange({ daysOfWeek: daysOfWeek.filter(d => d !== day.value) });
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-1 text-sm text-gray-700">{day.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Day */}
      {currentRecurrence.type === 'monthly' && (
        <div>
          <label className="block text-sm text-gray-600 mb-1">Day of month</label>
          <input
            type="number"
            min="1"
            max="31"
            value={currentRecurrence.dayOfMonth || 1}
            onChange={(e) => handleChange({ dayOfMonth: parseInt(e.target.value) || 1 })}
            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* End Date */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">End date (optional)</label>
        <input
          type="date"
          value={formatDateForInput(currentRecurrence.endDate)}
          onChange={(e) => {
            const endDate = e.target.value ? new Date(e.target.value) : undefined;
            handleChange({ endDate });
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default RecurrenceForm;
