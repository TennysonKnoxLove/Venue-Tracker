import React, { useState, useEffect, useRef } from 'react';
import Window from '../components/layout/Window';
import Button from '../components/layout/Button';
import { audioService } from '../api';
import { useAuth } from '../context/AuthContext';

const AudioEditorPage = () => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { user } = useAuth();
  const [editParams, setEditParams] = useState({
    volume: 0,
    trim: { start: 0, end: 30 },
    reverb: { roomScale: 0.7, damping: 0.5 },
    speed: 1.0
  });
  
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioSourceRef = useRef(null);
  
  // Fetch audio files on component mount
  useEffect(() => {
    const fetchAudioFiles = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use the actual API service
        const result = await audioService.getAudioFiles();
        setAudioFiles(result || []);
      } catch (err) {
        console.error("Error fetching audio files:", err);
        setError("Failed to load audio files. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAudioFiles();
    
    // Initialize audio context
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser:", e);
    }
    
    return () => {
      // Cleanup audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  // Set up audio element when selected file changes
  useEffect(() => {
    if (selectedFile && audioRef.current) {
      if (selectedFile.file) {
        audioRef.current.src = selectedFile.file;
      } else {
        // For newly uploaded files or files without a proper file URL
        audioRef.current.src = `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/audio/${selectedFile.id}/download/`;
      }
      
      // Reset edit parameters based on the new audio file
      setEditParams({
        volume: 0,
        trim: { 
          start: 0, 
          end: selectedFile.duration ? Math.min(30, selectedFile.duration) : 30 
        },
        reverb: { roomScale: 0.7, damping: 0.5 },
        speed: 1.0
      });
    }
  }, [selectedFile]);
  
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      setError(null);
      
      try {
        // Use the actual API service
        const result = await audioService.uploadAudio(file, file.name);
        
        // Get additional file details to ensure we have complete information
        const detailedFile = await audioService.getAudioDetails(result.id);
        
        // Update the audio files list with the new file
        setAudioFiles(prev => [...prev, detailedFile]);
        setSelectedFile(detailedFile);
        
        // Ensure the audio element has the correct source
        if (audioRef.current) {
          const token = localStorage.getItem('authToken');
          audioRef.current.src = `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/audio/${detailedFile.id}/download/`;
        }
      } catch (err) {
        console.error("Error uploading audio file:", err);
        setError("Failed to upload audio file. Could be too large, or an incorrect format. Please try again.");
      } finally {
        setIsUploading(false);
        // Reset the file input
        e.target.value = '';
      }
    }
  };
  
  const handleDeleteFile = async (fileId) => {
    try {
      // Use the actual API service
      await audioService.deleteAudio(fileId);
      
      // Update state after successful deletion
      setAudioFiles(prev => prev.filter(file => file.id !== fileId));
      if (selectedFile && selectedFile.id === fileId) {
        setSelectedFile(null);
      }
    } catch (err) {
      console.error("Error deleting audio file:", err);
      setError("Failed to delete audio file. Please try again.");
    }
  };
  
  const handleApplyEdit = async (editType) => {
    if (!selectedFile) return;
    
    try {
      // Specific parameters would depend on the edit type
      const parameters = {};
      
      switch (editType) {
        case 'trim':
          parameters.start_ms = editParams.trim.start * 1000;
          parameters.end_ms = editParams.trim.end * 1000;
          break;
        case 'volume':
          parameters.volume_change_db = editParams.volume;
          break;
        case 'reverb':
          parameters.room_scale = editParams.reverb.roomScale;
          parameters.damping = editParams.reverb.damping;
          break;
        case 'speed':
          parameters.speed_factor = editParams.speed;
          break;
        default:
          break;
      }
      
      // Use the actual API service
      const result = await audioService.applyEdit(selectedFile.id, editType, parameters);
      // Get the updated file data
      const updatedFile = await audioService.getAudioDetails(selectedFile.id);
      setSelectedFile(updatedFile);
      
      // Also update the file in the list
      setAudioFiles(prev => 
        prev.map(file => file.id === updatedFile.id ? updatedFile : file)
      );
    } catch (err) {
      console.error(`Error applying ${editType} edit:`, err);
      setError(`Failed to apply ${editType} edit. Please try again.`);
    }
  };
  
  // Audio playback controls
  const handlePlay = () => {
    if (audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(_ => {
          // Automatic playback started!
          setIsPlaying(true);
        })
        .catch(error => {
          // Auto-play was prevented
          // Show a UI element to let the user manually start playback
          console.error("Audio playback error:", error);
          setError("Failed to play audio. Please check the file or network.");
          setIsPlaying(false);
        });
      } else {
        // Fallback for browsers that don't return a promise from play()
        // In this case, we rely on the onPlay/onPause events of the audio element
      }
    }
  };
  
  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };
  
  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
    }
  };
  
  const handleForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.duration, 
        audioRef.current.currentTime + 5
      );
    }
  };
  
  // Edit parameter controls
  const handleVolumeChange = (e) => {
    setEditParams(prev => ({
      ...prev,
      volume: parseFloat(e.target.value)
    }));
  };
  
  const handleTrimStartChange = (e) => {
    const newStart = parseFloat(e.target.value);
    setEditParams(prev => ({
      ...prev,
      trim: {
        ...prev.trim,
        start: newStart,
        end: Math.max(newStart + 1, prev.trim.end)
      }
    }));
  };
  
  const handleTrimEndChange = (e) => {
    const newEnd = parseFloat(e.target.value);
    setEditParams(prev => ({
      ...prev,
      trim: {
        ...prev.trim,
        end: newEnd,
        start: Math.min(prev.trim.start, newEnd - 1)
      }
    }));
  };
  
  const handleReverbRoomScaleChange = (e) => {
    setEditParams(prev => ({
      ...prev,
      reverb: {
        ...prev.reverb,
        roomScale: parseFloat(e.target.value)
      }
    }));
  };
  
  const handleReverbDampingChange = (e) => {
    setEditParams(prev => ({
      ...prev,
      reverb: {
        ...prev.reverb,
        damping: parseFloat(e.target.value)
      }
    }));
  };
  
  const handleSpeedChange = (e) => {
    setEditParams(prev => ({
      ...prev,
      speed: parseFloat(e.target.value)
    }));
  };
  
  // Add this helper function to check if user owns a file
  const isOwner = (file) => {
    return file.user === user.id;
  };
  
  return (
    <Window title="Audio Editor" width="900px">
      <div className="audio-editor">
        <h2 className="text-2xl font-bold mb-4">Audio Editor</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Hidden audio element for playback */}
        <audio 
          ref={audioRef} 
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onError={(e) => {
            console.error("Audio element error:", e);
            setError("Error playing audio file. It might be corrupted or inaccessible.");
            setIsPlaying(false);
          }}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Window title="Audio Library">
              <div className="mb-4">
                <input
                  type="file"
                  id="audio-upload"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  ref={(input) => {
                    // Store input reference to trigger click programmatically
                    window.audioFileInput = input;
                  }}
                />
                <Button 
                  fullWidth 
                  disabled={isUploading}
                  onClick={() => window.audioFileInput && window.audioFileInput.click()}
                >
                  {isUploading ? 'Uploading...' : 'Upload Audio File'}
                </Button>
              </div>
              
              {loading ? (
                <div className="text-center py-4">
                  <p>Loading audio files...</p>
                </div>
              ) : audioFiles.length > 0 ? (
                <div className="audio-files-section">
                  <h3 className="text-md font-bold pl-2 mb-1">Audio Files</h3>
                  <ul className="audio-files-list">
                    {audioFiles.map(file => (
                      <li 
                        key={file.id} 
                        className={selectedFile && selectedFile.id === file.id ? 'selected' : ''}
                        onClick={() => setSelectedFile(file)}
                        style={{
                          padding: '8px',
                          margin: '4px',
                          border: '2px solid #808080',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.7)',
                          boxShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'transform 0.1s ease-in-out, background-color 0.1s ease-in-out, box-shadow 0.1s ease-in-out'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'scale(1.03)';
                          e.currentTarget.style.backgroundColor = '#e5e7eb';
                          e.currentTarget.style.boxShadow = '2px 2px 5px rgba(0, 0, 0, 0.2)';
                          e.currentTarget.style.borderColor = '#000080';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                          e.currentTarget.style.boxShadow = '1px 1px 2px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.borderColor = '#808080';
                        }}
                      >
                        <span style={{ fontWeight: 'bold', paddingRight: '35px' }}>{file.title}</span>
                        {isOwner(file) && (
                          <button 
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '12px',
                              color: '#ff0000',
                              fontWeight: 'bold',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                              transition: 'transform 0.1s ease-in-out'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'scale(1.2)';
                              e.currentTarget.style.color = '#b91c1c';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.color = '#ff0000';
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFile(file.id);
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p>No audio files. Upload one to get started.</p>
                </div>
              )}
            </Window>
          </div>
          
          <div className="md:col-span-2">
            <Window title="Waveform & Editor" className="mb-4">
              {selectedFile ? (
                <div>
                  <div className="bg-black h-32 flex items-center justify-center">
                    {selectedFile.waveform_data && selectedFile.waveform_data.length > 0 ? (
                      <div className="w-full h-full">
                        {/* Simple waveform visualization */}
                        <div className="flex items-center justify-center h-full">
                          {selectedFile.waveform_data.map((point, index) => (
                            <div 
                              key={index}
                              className="bg-green-500 w-1 mx-px"
                              style={{ height: `${Math.max(5, point * 100)}%` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-white">Waveform data not available</p>
                    )}
                  </div>
                  <div className="flex justify-center space-x-2 mt-4">
                    <Button onClick={handleRewind}>⏪</Button>
                    <Button onClick={isPlaying ? handlePause : handlePlay}>
                      {isPlaying ? '⏸' : '▶'}
                    </Button>
                    <Button onClick={handleStop}>⏹</Button>
                    <Button onClick={handleForward}>⏩</Button>
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-sm">Playing: {selectedFile.title}</p>
                    <p className="text-xs">Duration: {typeof selectedFile.duration === 'number' ? selectedFile.duration.toFixed(1) : 'N/A'}s</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>Select an audio file to edit</p>
                </div>
              )}
            </Window>
            
            {selectedFile && (
              <Window title="Edit Tools">
                <div className="edit-section">
                  <h3>Edit Audio</h3>
                  {isOwner(selectedFile) ? (
                    <div className="edit-controls">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-bold mb-2">Basic Edits</h4>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span>Trim</span>
                                <span>Start: {editParams.trim.start}s, End: {editParams.trim.end}s</span>
                              </div>
                              <div className="mb-2">
                                <label className="block text-xs mb-1">Start Time (seconds)</label>
                                <input 
                                  type="range" 
                                  min="0" 
                                  max={selectedFile.duration || 30} 
                                  step="0.1"
                                  value={editParams.trim.start}
                                  onChange={handleTrimStartChange}
                                  className="w-full"
                                />
                              </div>
                              <div className="mb-2">
                                <label className="block text-xs mb-1">End Time (seconds)</label>
                                <input 
                                  type="range" 
                                  min="0" 
                                  max={selectedFile.duration || 30} 
                                  step="0.1"
                                  value={editParams.trim.end}
                                  onChange={handleTrimEndChange}
                                  className="w-full"
                                />
                              </div>
                              <Button fullWidth onClick={() => handleApplyEdit('trim')}>Apply Trim</Button>
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <span>Volume</span>
                                <span>{editParams.volume > 0 ? '+' : ''}{editParams.volume} dB</span>
                              </div>
                              <input 
                                type="range" 
                                min="-12" 
                                max="12" 
                                step="1"
                                value={editParams.volume}
                                onChange={handleVolumeChange}
                                className="w-full mb-2"
                              />
                              <Button fullWidth onClick={() => handleApplyEdit('volume')}>Apply Volume</Button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold mb-2">Effects</h4>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span>Reverb</span>
                              </div>
                              <div className="mb-2">
                                <label className="block text-xs mb-1">Room Scale: {editParams.reverb.roomScale.toFixed(1)}</label>
                                <input 
                                  type="range" 
                                  min="0" 
                                  max="1" 
                                  step="0.1"
                                  value={editParams.reverb.roomScale}
                                  onChange={handleReverbRoomScaleChange}
                                  className="w-full mb-1"
                                />
                              </div>
                              <div className="mb-2">
                                <label className="block text-xs mb-1">Damping: {editParams.reverb.damping.toFixed(1)}</label>
                                <input 
                                  type="range" 
                                  min="0" 
                                  max="1" 
                                  step="0.1"
                                  value={editParams.reverb.damping}
                                  onChange={handleReverbDampingChange}
                                  className="w-full mb-1"
                                />
                              </div>
                              <Button fullWidth onClick={() => handleApplyEdit('reverb')}>Apply Reverb</Button>
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <span>Speed</span>
                                <span>{editParams.speed.toFixed(1)}x</span>
                              </div>
                              <input 
                                type="range" 
                                min="0.5" 
                                max="2.0" 
                                step="0.1"
                                value={editParams.speed}
                                onChange={handleSpeedChange}
                                className="w-full mb-2"
                              />
                              <Button fullWidth onClick={() => handleApplyEdit('speed')}>Apply Speed</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p>You can only edit audio files that you own.</p>
                  )}
                  
                  <div className="mt-4 text-center">
                    <Button 
                      onClick={() => audioService.downloadAudio(
                        selectedFile.id, 
                        `${selectedFile.title}.${selectedFile.file_type}`
                      )}
                    >
                      Download Audio
                    </Button>
                  </div>
                </div>
              </Window>
            )}
          </div>
        </div>
      </div>
    </Window>
  );
};

export default AudioEditorPage; 