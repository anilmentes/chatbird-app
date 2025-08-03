
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Self-contained utility function to avoid frontend dependencies in the backend.
const toYyyyMmDd = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Only GET requests are allowed' });
  }
  
  try {
    const hubspotApiKey = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
    const meetingUrl = process.env.HUBSPOT_MEETING_URL;

    if (!hubspotApiKey || !meetingUrl) {
      console.error("Server configuration error: Missing HubSpot environment variables (HUBSPOT_PRIVATE_APP_TOKEN or HUBSPOT_MEETING_URL).");
      throw new Error("Server configuration error: Missing HubSpot credentials.");
    }

    const parsedUrl = new URL(meetingUrl);
    const schedulingLink = parsedUrl.pathname.substring(1); // Remove leading '/'
    const hubspotApiDomain = parsedUrl.hostname.includes('meetings-')
      ? parsedUrl.hostname.replace('meetings-', 'api.')
      : 'api.hubapi.com'; // Fallback for standard non-regional URLs
    
    const now = new Date();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 60); // Look 60 days into the future

    const availabilityUrl = `https://${hubspotApiDomain}/meetings/v3/availability/public/availability/${schedulingLink}?startTime=${startDate.toISOString()}&endTime=${endDate.toISOString()}`;
    
    const apiResponse = await fetch(availabilityUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${hubspotApiKey}`,
      },
    });

    if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error(`HubSpot Availability API Error. URL: ${availabilityUrl}. Status: ${apiResponse.status}. Response: ${errorText}`);
        throw new Error(`Failed to fetch availability from HubSpot. Status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    // Transform the data for the frontend
    const slotsMap = new Map<string, Date[]>();
    data.forEach((slot: { startDateTime: string }) => {
      const date = new Date(slot.startDateTime);
      // Filter out past slots just in case API returns them
      if (date > now) {
        const dayKey = toYyyyMmDd(date);
        if (!slotsMap.has(dayKey)) {
          slotsMap.set(dayKey, []);
        }
        slotsMap.get(dayKey)?.push(date);
      }
    });

    // Sort times within each day
    for (const times of slotsMap.values()) {
        times.sort((a, b) => a.getTime() - b.getTime());
    }

    // Convert map to array for JSON serialization
    const slotsArray = Array.from(slotsMap.entries());

    return response.status(200).json({ slots: slotsArray });

  } catch (error) {
    console.error('Error in get-availability function:', error);
    const message = error instanceof Error ? error.message : 'An unknown internal error occurred.';
    return response.status(500).json({ message });
  }
}
