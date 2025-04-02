import api from './axios';
import { State } from '../types';

export const getStates = async (): Promise<State[]> => {
  const response = await api.get('/states/');
  return response.data;
};

export const getState = async (id: number): Promise<State> => {
  const response = await api.get(`/states/${id}/`);
  return response.data;
};

export const createState = async (data: Partial<State>): Promise<State> => {
  const response = await api.post('/states/', data);
  return response.data;
};

export const updateState = async (id: number, data: Partial<State>): Promise<State> => {
  const response = await api.put(`/states/${id}/`, data);
  return response.data;
};

export const deleteState = async (id: number): Promise<void> => {
  await api.delete(`/states/${id}/`);
}; 