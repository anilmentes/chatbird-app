import React, { useState } from 'react';
import { InformationChannelDetails } from '../types';

interface InformationChannelFormProps {
    messageId: string;
    onSubmit: (messageId: string, details: InformationChannelDetails) => void;
    isSubmitted: boolean;
}

const channels = [
    "Technical Updates",
    "Regulatory News",
    "Company Blog",
    "General Newsletter",
];

const InformationChannelForm: React.FC<InformationChannelFormProps> = ({ messageId, onSubmit, isSubmitted }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedChannel, setSelectedChannel] = useState(channels[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitted || isSubmitting) return;
        setIsSubmitting(true);
        onSubmit(messageId, { name, email, channel: selectedChannel });
    };
    
    const inputClasses = "mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 dark:text-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset disabled={isSubmitted || isSubmitting}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor={`name-info-${messageId}`} className={labelClasses}>Full Name</label>
                            <input type="text" id={`name-info-${messageId}`} value={name} onChange={e => setName(e.target.value)} required className={inputClasses} placeholder="Jane Doe" />
                        </div>
                        <div>
                            <label htmlFor={`email-info-${messageId}`} className={labelClasses}>Email Address</label>
                            <input type="email" id={`email-info-${messageId}`} value={email} onChange={e => setEmail(e.target.value)} required className={inputClasses} placeholder="you@company.com" />
                        </div>
                        <div>
                            <label htmlFor={`channel-info-${messageId}`} className={labelClasses}>Information Channel</label>
                            <select id={`channel-info-${messageId}`} value={selectedChannel} onChange={e => setSelectedChannel(e.target.value)} className={inputClasses}>
                                {channels.map(channel => (
                                    <option key={channel} value={channel}>{channel}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isSubmitted || isSubmitting}
                        className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition"
                    >
                        {isSubmitted ? 'Subscribed!' : isSubmitting ? 'Subscribing...' : 'Subscribe'}
                    </button>
                </fieldset>
            </form>
        </div>
    );
};

export default InformationChannelForm;
