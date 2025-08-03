
import React, { useState } from 'react';
import { ServiceTicketDetails } from '../types';

interface ServiceTicketFormProps {
    messageId: string;
    onSubmit: (messageId: string, details: ServiceTicketDetails) => void;
    isSubmitted: boolean;
}

const ServiceTicketForm: React.FC<ServiceTicketFormProps> = ({ messageId, onSubmit, isSubmitted }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitted || isSubmitting) return;
        setIsSubmitting(true);
        onSubmit(messageId, { firstName, lastName, email, company, description });
    };

    const inputClasses = "mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 dark:text-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 shadow-sm">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Create Service Ticket</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset disabled={isSubmitted || isSubmitting}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor={`first-name-ticket-${messageId}`} className={labelClasses}>First name</label>
                                <input type="text" id={`first-name-ticket-${messageId}`} value={firstName} onChange={e => setFirstName(e.target.value)} required className={inputClasses} />
                            </div>
                            <div>
                                <label htmlFor={`last-name-ticket-${messageId}`} className={labelClasses}>Last name</label>
                                <input type="text" id={`last-name-ticket-${messageId}`} value={lastName} onChange={e => setLastName(e.target.value)} required className={inputClasses} />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor={`email-ticket-${messageId}`} className={labelClasses}>Email</label>
                                <input type="email" id={`email-ticket-${messageId}`} value={email} onChange={e => setEmail(e.target.value)} required className={inputClasses} placeholder="you@company.com" />
                            </div>
                             <div>
                                <label htmlFor={`company-ticket-${messageId}`} className={labelClasses}>Company name</label>
                                <input type="text" id={`company-ticket-${messageId}`} value={company} onChange={e => setCompany(e.target.value)} className={inputClasses} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor={`description-ticket-${messageId}`} className={labelClasses}>Please describe the issue you are experiencing.</label>
                            <textarea id={`description-ticket-${messageId}`} value={description} onChange={e => setDescription(e.target.value)} rows={4} required className={inputClasses}></textarea>
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isSubmitted || isSubmitting}
                        className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition"
                    >
                        {isSubmitted ? 'Ticket Submitted!' : isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </fieldset>
            </form>
        </div>
    );
};

export default ServiceTicketForm;
