import { useEffect, useRef } from 'react';
import { fetchAudioFiles } from './Files';

const audioDownloadUrl = (id) =>
  `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/audio/${id}/download/`;

export function useAudioEffects({
  selectedFile,
  setAudioFiles,
  setLoading,
  setError,
  setEditParams,
  audioRef,
}) {
  const audioContextRef = useRef(null);
  
  useEffect(() => {
    fetchAudioFiles({ setLoading, setError, setAudioFiles });
    
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.error('Web Audio API is not supported in this browser:', e);
    }
    
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [setAudioFiles, setError, setLoading]);
  
  useEffect(() => {
    if (!selectedFile || !audioRef.current) return;

      if (selectedFile.file) {
        audioRef.current.src = selectedFile.file;
      } else {
      audioRef.current.src = audioDownloadUrl(selectedFile.id);
      }
      
      setEditParams({
        volume: 0,
        trim: { 
          start: 0, 
        end: selectedFile.duration ? Math.min(30, selectedFile.duration) : 30,
        },
        reverb: { roomScale: 0.7, damping: 0.5 },
      speed: 1.0,
    });
  }, [selectedFile, audioRef, setEditParams]);
}
