import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ServiceTicketDetails } from '../../types';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Only POST requests are allowed' });
  }

  try {
    const details: ServiceTicketDetails = request.body;

    // Basic validation
    if (!details.email || !details.firstName || !details.description) {
      return response.status(400).json({ message: 'Missing required ticket details.' });
    }
    
    // Generate a unique ticket ID
    const ticketId = `TICKET-${Date.now()}`;

    // --- In a real application, you would save this to a database ---
    // For now, we just log it to the serverless function logs on Vercel
    console.log('--- New Service Ticket Created ---');
    console.log('Ticket ID:', ticketId);
    console.log('Details:', JSON.stringify(details, null, 2));
    console.log('------------------------------------');
    // ----------------------------------------------------------------

    // Return the ticket ID to the frontend for confirmation
    return response.status(200).json({ ticketId });

  } catch (error) {
    console.error('Error in create-ticket function:', error);
    const message = error instanceof Error ? error.message : 'An unknown internal error occurred.';
    return response.status(500).json({ message });
  }
}
