import api from './axios';
import { Venue } from '../types';

export const getVenues = async (stateId?: number): Promise<Venue[]> => {
  const url = stateId ? `/states/${stateId}/venues/` : '/venues/';
  const response = await api.get(url);
  return response.data;
};

export const getVenue = async (id: number): Promise<Venue> => {
  const response = await api.get(`/venues/${id}/`);
  return response.data;
};

export const createVenue = async (data: Partial<Venue>): Promise<Venue> => {
  const response = await api.post('/venues/', data);
  return response.data;
};

export const updateVenue = async (id: number, data: Partial<Venue>): Promise<Venue> => {
  const response = await api.put(`/venues/${id}/`, data);
  return response.data;
};

export const deleteVenue = async (id: number): Promise<void> => {
  await api.delete(`/venues/${id}/`);
}; 