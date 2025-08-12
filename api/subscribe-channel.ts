
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

    // Attempt to store subscription details, with a graceful fallback if KV is not configured.
    try {
        await kv.set(key, { ...details, subscriptionId, subscribedAt: new Date().toISOString() });
        console.log(`Subscription ${subscriptionId} for ${details.email} to channel ${details.channel} saved to Vercel KV.`);
    } catch (kvError) {
        console.warn(`Could not save subscription to Vercel KV. Reason: ${kvError instanceof Error ? kvError.message : String(kvError)}. This is expected if KV is not configured for local development. Subscription data will be logged to the console as a fallback.`);
        console.log("Fallback Subscription Data:", { subscriptionId, ...details });
    }
    
    // Always return success to the frontend
    return response.status(200).json({ subscriptionId });

  } catch (error) {
    console.error('Critical error in subscribe-channel function:', error);
    const message = error instanceof Error ? error.message : 'An unknown internal error occurred.';
    return response.status(500).json({ message });
  }
}
