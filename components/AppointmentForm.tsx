
import React, { useState } from 'react';
import { AppointmentDetails } from '../types';
import { ClockIcon } from './Icon';
import CalendarView from './CalendarView';

interface AppointmentFormProps {
    messageId: string;
    onSubmit: (messageId: string, details: AppointmentDetails) => void;
    isSubmitted: boolean;
    availableSlots: Map<string, Date[]>;
    isCalendarLoading: boolean;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ messageId, onSubmit, isSubmitted, availableSlots, isCalendarLoading }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [notes, setNotes] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [touched, setTouched] = useState(false);
    
    // This function is for display purposes in the confirmation message
    const formatFullSlotForDisplay = (date: Date): string => {
        return date.toLocaleString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setTouched(true);
        if (isSubmitted || isSubmitting || !selectedTime) return;
        setIsSubmitting(true);
        // The backend expects an ISO string for the selected slot
        const selectedSlotISO = selectedTime.toISOString();
        onSubmit(messageId, { name, email, company, notes, selectedSlot: selectedSlotISO });
    };

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        setSelectedTime(null); // Reset time when a new date is selected
    };

    const formatDisplayDate = (dateStr: string) => {
        // Parse the 'YYYY-MM-DD' string. new Date() treats this as UTC midnight.
        const date = new Date(dateStr);
        // Format the date using toLocaleDateString, but specify UTC timezone to avoid local timezone shifts.
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric',
            timeZone: 'UTC'
        });
    };

    const inputClasses = "mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 dark:text-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset disabled={isSubmitted || isSubmitting}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor={`name-${messageId}`} className={labelClasses}>Full Name</label>
                            <input type="text" id={`name-${messageId}`} value={name} onChange={e => setName(e.target.value)} required className={inputClasses} placeholder="John Doe" />
                        </div>
                        <div>
                            <label htmlFor={`email-${messageId}`} className={labelClasses}>Email Address</label>
                            <input type="email" id={`email-${messageId}`} value={email} onChange={e => setEmail(e.target.value)} required className={inputClasses} placeholder="you@company.com" />
                        </div>
                        <div>
                            <label htmlFor={`company-${messageId}`} className={labelClasses}>Company (Optional)</label>
                            <input type="text" id={`company-${messageId}`} value={company} onChange={e => setCompany(e.target.value)} className={inputClasses} />
                        </div>
                        <div>
                            <label htmlFor={`notes-${messageId}`} className={labelClasses}>Notes / Purpose of meeting</label>
                            <textarea id={`notes-${messageId}`} value={notes} onChange={e => setNotes(e.target.value)} rows={3} required className={inputClasses} placeholder="e.g., Interested in a demo for our research team."></textarea>
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Select a Date & Time</label>
                         {isCalendarLoading ? (
                            <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 text-center text-gray-500 dark:text-gray-400">
                                <p>Loading calendar...</p>
                            </div>
                         ) : (
                            <CalendarView 
                                slots={availableSlots}
                                currentMonth={currentMonth}
                                onMonthChange={setCurrentMonth}
                                selectedDate={selectedDate}
                                onDateSelect={handleDateSelect}
                            />
                         )}
                    </div>
                     {touched && !selectedTime && <p className="text-red-500 text-xs -mt-2 text-center font-medium">Please select a date and time to proceed.</p>}


                    {selectedDate && availableSlots.has(selectedDate) && (
                        <div>
                             <p className={`${labelClasses} text-center mb-3`}>Available times for {formatDisplayDate(selectedDate)}</p>
                            <div className="grid grid-cols-2 gap-2">
                                {availableSlots.get(selectedDate)?.map(time => (
                                    <button
                                        type="button"
                                        key={time.toISOString()}
                                        onClick={() => setSelectedTime(time)}
                                        className={`flex items-center justify-center text-center p-3 rounded-lg border transition duration-200 ${
                                            selectedTime?.toISOString() === time.toISOString()
                                                ? 'bg-blue-500 border-blue-500 text-white shadow-md ring-2 ring-blue-400'
                                                : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <ClockIcon className={`w-4 h-4 mr-2 flex-shrink-0`} />
                                        <span className="font-medium text-sm">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={!selectedTime || isSubmitted || isSubmitting}
                        className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition"
                    >
                        {isSubmitted ? 'Request Sent!' : isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                </fieldset>
            </form>
        </div>
    );
};

export default AppointmentForm;
