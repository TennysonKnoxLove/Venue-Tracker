import api from './axios';
import { AISearchQuery, AIVenueResult } from '../types';

export const discoverVenues = async (state: string, city: string, radius: number): Promise<AISearchQuery> => {
  const response = await api.post('/ai/discover/', { state, city, radius });
  return response.data;
};

export const getSearchHistory = async (): Promise<AISearchQuery[]> => {
  const response = await api.get('/ai/searches/');
  return response.data;
};

export const getSearchResults = async (id: number): Promise<AISearchQuery> => {
  const response = await api.get(`/ai/searches/${id}/`);
  return response.data;
};

export const importVenues = async (searchId: number, venueIndices: number[]): Promise<any> => {
  const response = await api.post(`/ai/searches/${searchId}/import/`, { venue_indices: venueIndices });
  return response.data;
}; 