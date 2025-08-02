
import { WebSource, Message } from '../types';

export const sendMessageToGemini = async (inputText: string, history: Message[]): Promise<{ text: string, requestType: string, sources: WebSource[] }> => {
    try {
        const response = await fetch('/api/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inputText, history }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to get response from AI service.');
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error sending message to backend service:", error);
        if (error instanceof Error) {
            // The frontend will catch this and display a user-friendly message.
            throw error;
        }
        throw new Error("An unknown error occurred while communicating with the AI service.");
    }
};
