
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import { Resend } from 'resend';
import { ServiceTicketDetails } from '../../types';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const supportEmail = process.env.SUPPORT_EMAIL_ADDRESS;
  const senderEmail = process.env.SENDER_EMAIL_ADDRESS;
  
  if (!resendApiKey || !supportEmail || !senderEmail) {
    console.error("Missing Resend or Email Configuration Environment Variables");
    return response.status(500).json({ message: 'Server configuration error: Email service is not configured.' });
  }

  const resend = new Resend(resendApiKey);

  try {
    const details: ServiceTicketDetails = request.body;

    // Basic validation
    if (!details.email || !details.firstName || !details.description) {
      return response.status(400).json({ message: 'Missing required ticket details.' });
    }
    
    const ticketId = `TICKET-${Date.now()}`;

    // 1. Save the ticket to Vercel KV database
    await kv.set(`ticket:${ticketId}`, details);
    
    // 2. Send an email notification
    await resend.emails.send({
        from: `ChatBird Notification <${senderEmail}>`,
        to: [supportEmail],
        subject: `New Service Ticket from ${details.firstName} ${details.lastName}: ${ticketId}`,
        html: `
            <h1>New Service Ticket Created</h1>
            <p>A new service ticket has been submitted through the ChatBird assistant.</p>
            <ul>
                <li><strong>Ticket ID:</strong> ${ticketId}</li>
                <li><strong>Name:</strong> ${details.firstName} ${details.lastName}</li>
                <li><strong>Email:</strong> ${details.email}</li>
                <li><strong>Company:</strong> ${details.company || 'N/A'}</li>
            </ul>
            <h2>Description:</h2>
            <p style="white-space: pre-wrap; background-color: #f4f4f4; padding: 15px; border-radius: 5px;">${details.description}</p>
        `,
    });

    // Return the ticket ID to the frontend for confirmation
    return response.status(200).json({ ticketId });

  } catch (error) {
    console.error('Error in create-ticket function:', error);
    const message = error instanceof Error ? error.message : 'An unknown internal error occurred.';
    return response.status(500).json({ message });
  }
}