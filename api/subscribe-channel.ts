
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import { InformationChannelDetails } from '../../types';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Only POST requests are allowed' });
  }

  try {
    const details: InformationChannelDetails = request.body;

    // Basic validation
    if (!details.email || !details.name || !details.channel) {
      return response.status(400).json({ message: 'Missing required subscription details.' });
    }
    
    const subscriptionId = `sub_${Date.now()}`;
    const key = `subscription:${details.email}:${details.channel}`;

    // Store subscription details. Using a key with email and channel prevents duplicates.
    await kv.set(key, { ...details, subscriptionId, subscribedAt: new Date().toISOString() });
    
    // --- In a real application, you might also add this email to a mailing list (e.g., Mailchimp, SendGrid) ---
    console.log(`New subscription added for ${details.email} to channel ${details.channel}`);
    // -----------------------------------------------------------------------------------------------------------

    return response.status(200).json({ subscriptionId });

  } catch (error) {
    console.error('Error in subscribe-channel function:', error);
    const message = error instanceof Error ? error.message : 'An unknown internal error occurred.';
    return response.status(500).json({ message });
  }
}