import api from './axios';
import { ContactHistory } from '../types';

export const getContacts = async (venueId?: number): Promise<ContactHistory[]> => {
  const url = venueId ? `/venues/${venueId}/contacts/` : '/contacts/';
  const response = await api.get(url);
  return response.data;
};

export const getContact = async (id: number): Promise<ContactHistory> => {
  const response = await api.get(`/contacts/${id}/`);
  return response.data;
};

export const createContact = async (data: Partial<ContactHistory>): Promise<ContactHistory> => {
  const response = await api.post('/contacts/', data);
  return response.data;
};

export const updateContact = async (id: number, data: Partial<ContactHistory>): Promise<ContactHistory> => {
  const response = await api.put(`/contacts/${id}/`, data);
  return response.data;
};

export const deleteContact = async (id: number): Promise<void> => {
  await api.delete(`/contacts/${id}/`);
};

export const getPendingFollowups = async (): Promise<ContactHistory[]> => {
  const response = await api.get('/contacts/pending-followups/');
  return response.data;
}; 