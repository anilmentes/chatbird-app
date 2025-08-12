
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

  try {
    const details: ServiceTicketDetails = request.body;

    // Basic validation
    if (!details.email || !details.firstName || !details.description) {
      return response.status(400).json({ message: 'Missing required ticket details.' });
    }
    
    const ticketId = `TICKET-${Date.now()}`;

    // 1. Attempt to save the ticket to Vercel KV, with a fallback for local dev
    try {
        await kv.set(`ticket:${ticketId}`, details);
        console.log(`Ticket ${ticketId} saved to Vercel KV.`);
    } catch (kvError) {
        console.warn(`Could not save ticket to Vercel KV. Reason: ${kvError instanceof Error ? kvError.message : String(kvError)}. This is expected if KV is not configured for local development. Ticket data will be logged to the console as a fallback.`);
        console.log("Fallback Ticket Data:", { ticketId, ...details });
    }
    
    // 2. Attempt to send an email notification if configured
    const resendApiKey = process.env.RESEND_API_KEY;
    const supportEmail = process.env.SUPPORT_EMAIL_ADDRESS;
    const senderEmail = process.env.SENDER_EMAIL_ADDRESS;
  
    if (resendApiKey && supportEmail && senderEmail) {
        try {
            const resend = new Resend(resendApiKey);
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
            console.log(`Email notification sent for ticket ${ticketId}.`);
        } catch (emailError) {
            console.error(`Failed to send email notification for ticket ${ticketId}. Reason: ${emailError instanceof Error ? emailError.message : String(emailError)}`);
            // Do not fail the request if only email sending fails.
        }
    } else {
        console.warn("Email service is not configured; skipping email notification. Please set RESEND_API_KEY, SUPPORT_EMAIL_ADDRESS, and SENDER_EMAIL_ADDRESS environment variables to enable email notifications.");
    }

    // Always return the ticket ID to the frontend for a successful confirmation
    return response.status(200).json({ ticketId });

  } catch (error) {
    console.error('Critical error in create-ticket function:', error);
    const message = error instanceof Error ? error.message : 'An unknown internal error occurred.';
    return response.status(500).json({ message });
  }
}
