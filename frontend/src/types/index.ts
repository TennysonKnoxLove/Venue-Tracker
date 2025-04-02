// User types
export interface User {
  id: number;
  username: string;
  email: string;
}

// State types
export interface State {
  id: number;
  name: string;
  abbreviation: string;
  created_at: string;
  updated_at: string;
}

// Venue types
export interface Venue {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state_id: number;
  state_name: string;
  state_abbreviation: string;
  zipcode: string;
  phone: string;
  email: string;
  website: string;
  capacity: number | null;
  open_time: string | null;
  close_time: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

// Contact History types
export interface ContactHistory {
  id: number;
  venue_id: number;
  contact_date: string;
  contact_type: 'email' | 'phone' | 'in_person' | 'other';
  contact_person?: string;
  notes?: string;
  follow_up_date?: string;
  follow_up_completed: boolean;
  created_at: string;
  updated_at: string;
  user_id: number;
}

// Audio-related types
export interface AudioFile {
  id: number;
  title: string;
  file: string;
  file_type: string;
  duration?: number;
  waveform_data?: any;
  created_at: string;
  updated_at: string;
  user_id: number;
}

export interface AudioEdit {
  id: number;
  audio_file_id: number;
  edit_type: 'trim' | 'fade' | 'speed' | 'reverb' | 'other';
  parameters: Record<string, any>;
  created_at: string;
  user_id: number;
}

// AI Venue types
export interface AIVenueResult {
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  phone?: string;
  email?: string;
  website?: string;
  capacity?: number;
  genres?: string;
}

export interface AISearchQuery {
  id: number;
  state: string;
  city: string;
  radius: number;
  results: AIVenueResult[];
  created_at: string;
  user_id: number;
}

// Auth-related types
export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
} 