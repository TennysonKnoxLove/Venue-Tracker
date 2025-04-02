import api from './axios';
import { AudioFile, AudioEdit } from '../types';

export const getAudioFiles = async (): Promise<AudioFile[]> => {
  const response = await api.get('/audio/');
  return response.data;
};

export const getAudioFile = async (id: number): Promise<AudioFile> => {
  const response = await api.get(`/audio/${id}/`);
  return response.data;
};

export const uploadAudioFile = async (formData: FormData): Promise<AudioFile> => {
  const response = await api.post('/audio/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteAudioFile = async (id: number): Promise<void> => {
  await api.delete(`/audio/${id}/`);
};

export const applyAudioEdit = async (audioId: number, editType: string, parameters: Record<string, any>): Promise<AudioFile> => {
  const response = await api.post(`/audio/${audioId}/edit/`, {
    edit_type: editType,
    parameters,
  });
  return response.data;
};

export const getAudioEdits = async (audioId: number): Promise<AudioEdit[]> => {
  const response = await api.get(`/audio/${audioId}/edits/`);
  return response.data;
};

export const downloadProcessedAudio = async (audioId: number): Promise<Blob> => {
  const response = await api.get(`/audio/${audioId}/download/`, {
    responseType: 'blob',
  });
  return response.data;
}; 