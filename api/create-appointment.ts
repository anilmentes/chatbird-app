
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AppointmentDetails } from '../../types';

// Helper function to find a contact by email
const findContactByEmail = async (email: string, apiKey: string, hubspotApiDomain: string): Promise<string | null> => {
    const searchUrl = `https://${hubspotApiDomain}/crm/v3/objects/contacts/search`;
    const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            filterGroups: [{
                filters: [{
                    propertyName: 'email',
                    operator: 'EQ',
                    value: email
                }]
            }],
            properties: ['email'],
            limit: 1,
        }),
    });

    if (!response.ok) {
        console.error("Error searching for HubSpot contact:", await response.text());
        return null; // Don't block meeting creation if search fails
    }

    const data = await response.json();
    return data.results.length > 0 ? data.results[0].id : null;
};

// Helper function to create a new contact
const createContact = async (details: { email: string, name: string, company?: string }, apiKey: string, hubspotApiDomain: string): Promise<string | null> => {
    const createUrl = `https://${hubspotApiDomain}/crm/v3/objects/contacts`;
    const [firstName, ...lastNameParts] = details.name.split(' ');
    const lastName = lastNameParts.join(' ');

    const response = await fetch(createUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            properties: {
                email: details.email,
                firstname: firstName || '',
                lastname: lastName || '',
                company: details.company || '',
            }
        }),
    });

    if (!response.ok) {
        console.error("Error creating HubSpot contact:", await response.text());
        return null; // Don't block meeting creation if create fails
    }

    const data = await response.json();
    return data.id;
};


export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Only POST requests are allowed' });
  }

  try {
    const details: AppointmentDetails = request.body;
    const hubspotApiKey = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
    const meetingUrl = process.env.HUBSPOT_MEETING_URL;

    if (!hubspotApiKey) {
      throw new Error("HUBSPOT_PRIVATE_APP_TOKEN environment variable not set.");
    }
    
    // Determine the API domain from the meeting URL, with a fallback
    let hubspotApiDomain = 'api.hubapi.com';
    if(meetingUrl) {
      try {
        const parsedUrl = new URL(meetingUrl);
        if (parsedUrl.hostname.includes('meetings-')) {
          hubspotApiDomain = parsedUrl.hostname.replace('meetings-', 'api.');
        }
      } catch (e) {
        console.warn("Could not parse HUBSPOT_MEETING_URL, falling back to default API domain.", e);
      }
    }

    // Step 1: Find or create a contact
    let contactId = await findContactByEmail(details.email, hubspotApiKey, hubspotApiDomain);
    if (!contactId) {
        contactId = await createContact(details, hubspotApiKey, hubspotApiDomain);
    }
    
    // Step 2: Create the appointment payload
    const startTime = new Date(details.selectedSlot);
    const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 min meeting

    const appointmentPayload: any = {
      properties: {
        hs_appointment_title: `Appointment with ${details.name}`,
        hs_body: `Scheduled via ChatBird.\n\nCompany: ${details.company || 'N/A'}\nEmail: ${details.email}\nNotes: ${details.notes}`,
        hs_timestamp: startTime.toISOString(),
        hs_appointment_start_time: startTime.toISOString(),
        hs_appointment_end_time: endTime.toISOString(),
      },
    };

    // Step 3: Add association if we have a contact ID
    if (contactId) {
        appointmentPayload.associations = [{
            to: { id: contactId },
            types: [{
                associationCategory: "HUBSPOT_DEFINED",
                // This is the ID for "Contact to Appointment"
                associationTypeId: 194
            }]
        }];
    }

    // Step 4: Create the appointment in HubSpot
    const apiResponse = await fetch(`https://${hubspotApiDomain}/crm/v3/objects/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hubspotApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentPayload),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.json();
      console.error('HubSpot API Error:', errorBody);
      throw new Error(errorBody.message || 'Failed to create appointment in HubSpot.');
    }

    const responseData = await apiResponse.json();
    return response.status(200).json({ appointmentId: responseData.id });

  } catch (error) {
    console.error('Error in create-appointment function:', error);
    const message = error instanceof Error ? error.message : 'An unknown internal error occurred.';
    return response.status(500).json({ message });
  }
}
