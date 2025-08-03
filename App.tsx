
import React, { useState, useEffect, useRef } from 'react';
import { Message, AppointmentDetails, InformationChannelDetails, ServiceTicketDetails } from './types';
import { sendMessageToGemini } from './services/geminiService';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Map<string, Date[]>>(new Map());
  const [isCalendarLoading, setIsCalendarLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set initial greeting messages
    setMessages([
      {
        id: 'initial-1',
        text: 'Hello! I am ChatBird, your AI assistant. How can I help you today?',
        sender: 'bot',
        type: 'text',
      },
       {
        id: 'initial-2',
        text: 'You can ask me about our company, subscribe to information channels, request service, or schedule an appointment.',
        sender: 'bot',
        type: 'text',
      }
    ]);
    
    // Fetch real-time availability from HubSpot via our secure backend
    const fetchAvailability = async () => {
        try {
            const response = await fetch('/api/get-availability');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch calendar availability.');
            }
            const data = await response.json();
            // The data from backend is serialized. We need to convert string dates back to Date objects.
            const slotsMap = new Map<string, Date[]>(
                data.slots.map(([day, times]: [string, string[]]) => [
                    day,
                    times.map(t => new Date(t))
                ])
            );
            setAvailableSlots(slotsMap);
        } catch (err) {
             console.error("Error fetching availability:", err);
             // Silently fail for the user, the form will show no available slots.
             // A more robust solution could show a specific error message on the calendar.
        } finally {
            setIsCalendarLoading(false);
        }
    };

    fetchAvailability();
  }, []);

  const handleSendMessage = async (inputText: string) => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText,
      sender: 'user',
      type: 'text',
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      // Pass the message history to Gemini for better context
      const { text: botResponseText, requestType, sources } = await sendMessageToGemini(inputText, newMessages);
      let botMessage: Message;
      
      switch(requestType) {
        case 'appointment':
          botMessage = {
            id: `bot-form-${Date.now()}`,
            text: botResponseText,
            sender: 'bot',
            type: 'appointment-form',
            availableSlots: availableSlots, // Use real slots from state
            isCalendarLoading: isCalendarLoading,
            sources: sources,
          };
          break;
        case 'info-channel':
           botMessage = {
            id: `bot-form-${Date.now()}`,
            text: botResponseText,
            sender: 'bot',
            type: 'info-channel-form',
            sources: sources,
          };
          break;
        case 'service-ticket':
           botMessage = {
            id: `bot-form-${Date.now()}`,
            text: botResponseText,
            sender: 'bot',
            type: 'service-ticket-form',
            sources: sources,
          };
          break;
        default:
          botMessage = {
            id: `bot-${Date.now()}`,
            text: botResponseText,
            sender: 'bot',
            type: 'text',
            sources: sources,
          };
          break;
      }

      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError('Sorry, I am having trouble connecting. Please try again later.');
      console.error(errorMessage);
       const botError: Message = {
        id: `bot-error-${Date.now()}`,
        text: 'Sorry, I am having trouble connecting. Please try again later.',
        sender: 'bot',
        type: 'text',
      };
      setMessages(prevMessages => [...prevMessages, botError]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFullSlotForDisplay = (isoString: string): string => {
    if (!isoString) return 'your selected time';
    try {
        return new Date(isoString).toLocaleString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        });
    } catch {
        return 'your selected time';
    }
  };

  const handleAppointmentSubmit = async (messageId: string, details: AppointmentDetails) => {
    // Immediately mark the form as submitted to disable it
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, isSubmitted: true } : msg
      )
    );

    try {
      // Call the secure backend endpoint
      const response = await fetch('/api/create-meeting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(details),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to book appointment.');
      }
      
      const { meetingId } = await response.json();

      // Create a success confirmation message
      const confirmationMessage: Message = {
        id: `bot-confirmation-${Date.now()}`,
        text: `Thank you, ${details.name}! Your appointment for ${formatFullSlotForDisplay(details.selectedSlot)} has been successfully booked.`,
        sender: 'bot',
        type: 'appointment-confirmation',
        bookingId: meetingId,
      };

      setMessages(prevMessages => [...prevMessages, confirmationMessage]);
      console.log("HubSpot Appointment Successfully Created:", { details, meetingId });

    } catch (apiError) {
      console.error("HubSpot API Error:", apiError);
      
      const errorMessageText = apiError instanceof Error ? apiError.message : "We're sorry, but we couldn't book your appointment at this time. Please try again later or contact us directly.";
      
      // Create an error message for the user in the chat
      const errorMessage: Message = {
        id: `bot-error-${Date.now()}`,
        text: errorMessageText,
        sender: 'bot',
        type: 'text',
      };
       setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  };

  const handleInfoChannelSubmit = (messageId: string, details: InformationChannelDetails) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, isSubmitted: true } : msg
      )
    );

    const confirmationMessage: Message = {
      id: `bot-info-confirmation-${Date.now()}`,
      text: `Thank you, ${details.name}! You've been subscribed to the "${details.channel}" channel. We'll send updates to ${details.email}.`,
      sender: 'bot',
      type: 'info-channel-confirmation',
    };

    console.log("Information Channel Subscription:", details);
     setTimeout(() => {
      setMessages(prevMessages => [...prevMessages, confirmationMessage]);
    }, 500);
  };
  
  const handleServiceTicketSubmit = (messageId: string, details: ServiceTicketDetails) => {
     setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, isSubmitted: true } : msg
      )
    );

    const confirmationMessage: Message = {
      id: `bot-ticket-confirmation-${Date.now()}`,
      text: `Thank you, ${details.name}! Your service ticket has been created. A support team member will contact you at ${details.email} shortly.`,
      sender: 'bot',
      type: 'service-ticket-confirmation',
    };
    
    console.log("Service Ticket Request:", details);
     setTimeout(() => {
      setMessages(prevMessages => [...prevMessages, confirmationMessage]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <Header />
      <div className="flex-grow flex flex-col items-center justify-center p-4 overflow-hidden">
          <div className="w-full max-w-4xl h-full flex flex-col bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <ChatWindow 
              messages={messages} 
              isLoading={isLoading} 
              onAppointmentSubmit={handleAppointmentSubmit}
              onInfoChannelSubmit={handleInfoChannelSubmit}
              onServiceTicketSubmit={handleServiceTicketSubmit}
            />
            <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            {error && <p className="text-center text-red-500 text-sm p-2">{error}</p>}
          </div>
      </div>
    </div>
  );
};

export default App;
