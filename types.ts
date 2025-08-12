
export interface AppointmentDetails {
  name: string;
  email: string;
  company?: string;
  notes: string;
  selectedSlot: string; // This should be the ISO string of the selected time
}

export interface InformationChannelDetails {
  name: string;
  email: string;
  channel: string;
}

export interface ServiceTicketDetails {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  description: string;
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  type?: 'text' | 'appointment-form' | 'appointment-confirmation' | 'info-channel-form' | 'info-channel-confirmation' | 'service-ticket-form' | 'service-ticket-confirmation' | 'initial-options';
  isSubmitted?: boolean; // Kept for visual feedback on forms after submission
  availableSlots?: Map<string, Date[]>;
  isCalendarLoading?: boolean; // For showing loading state on appointment form
  sources?: WebSource[];
  bookingId?: string;
  ticketId?: string;
}
