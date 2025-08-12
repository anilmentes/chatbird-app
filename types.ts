

export interface AppointmentDetails {
  name: string;
  email: string;
  company?: string;
  notes: string;
  selectedSlot: string; // ISO string
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
  sources?: WebSource[];
  ticketId?: string;
  appointmentDetails?: {
    name: string;
    formattedSlot: string;
  };
}
