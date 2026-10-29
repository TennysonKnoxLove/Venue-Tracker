import { useRef, useState } from 'react';
import Window from '../../components/layout/Window';
import Button from '../../components/layout/Button';
import { audioService } from '../../api';
import { useAuth } from '../../auth/AuthContext';
import { getFileActions } from './Files';
import { getEditActions } from './Edit';
import { getPlayerActions } from './Player';
import { useAudioEffects } from './AudioEffects';

const AudioEditorPage = () => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editParams, setEditParams] = useState({
    volume: 0,
    trim: { start: 0, end: 30 },
    reverb: { roomScale: 0.7, damping: 0.5 },
    speed: 1.0,
  });
  const { user } = useAuth();
  const audioRef = useRef(null);

  useAudioEffects({
    selectedFile,
    setAudioFiles,
    setLoading,
    setError,
    setEditParams,
    audioRef,
  });

  const {
    handleFileUpload,
    handleDeleteFile,
    isOwner,
  } = getFileActions({
    setIsUploading,
    setError,
    setAudioFiles,
    setSelectedFile,
    selectedFile,
    audioRef,
    user,
    setLoading,
  });

  const {
    handleApplyEdit,
    handleTrimStartChange,
    handleTrimEndChange,
    handleReverbRoomScaleChange,
    handleReverbDampingChange,
    handleSpeedChange,
  } = getEditActions({
    selectedFile,
    editParams,
    setEditParams,
    setSelectedFile,
    setAudioFiles,
    setError,
  });

  const {
    handlePlay,
    handlePause,
    handleStop,
    handleRewind,
    handleForward,
    handleVolumeChange,
  } = getPlayerActions({
    audioRef,
    setIsPlaying,
    setError,
    setEditParams,
  });

  return (
    <Window title="Audio Editor" width="900px">
      <div className="audio-editor">
        <h2 className="text-2xl font-bold mb-4">Audio Editor</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onError={(e) => {
            console.error('Audio element error:', e);
            setError('Error playing audio file. It might be corrupted or inaccessible.');
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
                    {audioFiles.map((file) => (
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
                          transition: 'transform 0.1s ease-in-out, background-color 0.1s ease-in-out, box-shadow 0.1s ease-in-out',
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
                              transition: 'transform 0.1s ease-in-out',
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
                    <p className="text-xs">
                      Duration: {typeof selectedFile.duration === 'number' ? selectedFile.duration.toFixed(1) : 'N/A'}s
                    </p>
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
