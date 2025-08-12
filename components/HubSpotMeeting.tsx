
import React, { useEffect } from 'react';

const HubSpotMeeting: React.FC = () => {
    useEffect(() => {
        const scriptId = 'hubspot-meetings-script';
        
        // Prevent adding the script multiple times
        if (document.getElementById(scriptId)) {
            // If script is already there, HubSpot's code might need a nudge to find new containers.
            // Often, it scans on load and may not need it. If embeds don't load,
            // we might need to call a function like `window.HubSpotMeetings.create()`.
            // For now, assume it's handled by the script.
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.type = 'text/javascript';
        script.src = 'https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js';
        script.async = true;
        
        document.body.appendChild(script);

        // Don't remove the script on unmount, as it's a global resource and other
        // instances might need it.
    }, []);

    return (
        <div className="p-1 rounded-2xl bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 shadow-sm min-h-[720px] -mt-2">
            <div 
                className="meetings-iframe-container" 
                // This is the scheduling link provided in the prompt.
                data-src="https://meetings-eu1.hubspot.com/anil-emre?embed=true"
            ></div>
        </div>
    );
};

export default HubSpotMeeting;
