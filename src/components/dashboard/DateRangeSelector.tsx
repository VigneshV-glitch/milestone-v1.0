/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, 
  isSameDay, isBefore, isAfter, parseISO 
} from 'date-fns';

export const DateRangeSelector: React.FC<{ 
  onRangeChange?: (start: Date | null, end: Date | null) => void 
}> = ({ onRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateClick = (day: Date) => {
    let newStart = startDate;
    let newEnd = endDate;

    if (!startDate || (startDate && endDate) || isBefore(day, startDate)) {
      newStart = day;
      newEnd = null;
    } else {
      newEnd = day;
    }
    
    setStartDate(newStart);
    setEndDate(newEnd);
    
    if (onRangeChange) {
      onRangeChange(newStart, newEnd);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDateOfWeek = startOfWeek(monthStart);
  const endDateOfWeek = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDateOfWeek,
    end: endDateOfWeek
  });

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#3d3d3d] rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2d2d2d]"
      >
        <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
        {startDate ? format(startDate, 'MMM d, yyyy') : 'Select Start'}
        {' - '}
        {endDate ? format(endDate, 'MMM d, yyyy') : 'Select End'}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#3d3d3d] rounded-lg shadow-xl z-50 p-4 w-72">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft className="w-4 h-4" /></button>
            <span className="font-bold">{format(currentMonth, 'MMMM yyyy')}</span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              const isSelected = (startDate && isSameDay(day, startDate)) || (endDate && isSameDay(day, endDate));
              const isInRange = startDate && endDate && isAfter(day, startDate) && isBefore(day, endDate);
              
              return (
                <button
                  key={idx}
                  onClick={() => handleDateClick(day)}
                  className={`p-2 text-xs rounded-full ${
                    !isSameMonth(day, monthStart) ? 'text-gray-300' : 
                    isSelected ? 'bg-primary-500 text-white' : 
                    isInRange ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100 dark:hover:bg-[#2d2d2d]'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
          <button 
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
              if (onRangeChange) onRangeChange(null, null);
            }}
            className="w-full mt-4 text-xs text-center text-primary-600 hover:text-primary-800 font-medium"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
