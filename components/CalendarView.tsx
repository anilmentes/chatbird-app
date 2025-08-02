import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icon';
import { toYyyyMmDd } from '../utils/time';

interface CalendarViewProps {
    slots: Map<string, Date[]>;
    currentMonth: Date;
    onMonthChange: (newMonth: Date) => void;
    selectedDate: string | null;
    onDateSelect: (date: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ slots, currentMonth, onMonthChange, selectedDate, onDateSelect }) => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const dates: Date[] = [];
    let currentDateIterator = new Date(startDate);
    while (currentDateIterator <= endDate) {
        dates.push(new Date(currentDateIterator));
        currentDateIterator.setDate(currentDateIterator.getDate() + 1);
    }

    const prevMonth = () => {
        onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                    <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button type="button" onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                    <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {weekDays.map(day => (
                    <div key={day} className="font-medium text-gray-500 dark:text-gray-400 p-2">{day[0]}</div>
                ))}
                {dates.map((date) => {
                    const dateStr = toYyyyMmDd(date);
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const isSelectable = slots.has(dateStr);
                    const isSelected = selectedDate === dateStr;

                    const baseClasses = "w-10 h-10 flex items-center justify-center rounded-full transition-colors relative";
                    let dayClasses = '';

                    if (!isCurrentMonth) {
                        dayClasses = 'text-gray-300 dark:text-gray-600';
                    } else if (isSelected) {
                        dayClasses = 'bg-blue-500 text-white font-bold shadow-lg';
                    } else if (isSelectable) {
                        dayClasses = 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer';
                    } else {
                         dayClasses = 'text-gray-500 dark:text-gray-400';
                    }

                    return (
                        <div key={date.toISOString()} className="flex justify-center items-center h-10">
                             <button
                                type="button"
                                disabled={!isSelectable}
                                onClick={() => onDateSelect(dateStr)}
                                className={`${baseClasses} ${dayClasses} disabled:cursor-not-allowed`}
                            >
                                {date.getDate()}
                                {isSelectable && !isSelected && <span className="absolute bottom-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;