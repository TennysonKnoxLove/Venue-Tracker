# Audio Processing

The Venue Tracker application includes basic audio editing functionality for processing music samples and demos. This document outlines the implementation details of the audio processing features.

## Supported Features

The audio editor supports the following operations:

1. **Trimming**: Cut sections from the beginning, end, or middle of audio files
2. **Speed Adjustment**: Increase or decrease playback speed without changing pitch
3. **Reverb**: Add reverb effects with customizable room size and damping
4. **Volume Adjustment**: Increase or decrease the volume of the audio

## Implementation

### Backend Processing

The audio processing functionality is implemented using the `pydub` library for Python:

```python
# backend/api/audio/processing.py

from pydub import AudioSegment
import os
import uuid
import tempfile

def process_audio(file_path, edit_type, parameters):
    """
    Process audio file according to specified edit type and parameters.
    
    Args:
        file_path (str): Path to the audio file
        edit_type (str): Type of edit to apply (trim, speed, reverb, volume)
        parameters (dict): Parameters for the edit
        
    Returns:
        str: Path to the processed audio file
    """
    try:
        # Load the audio file
        audio = AudioSegment.from_file(file_path)
        
        # Apply the edit based on type
        if edit_type == 'trim':
            audio = apply_trim(audio, parameters)
        elif edit_type == 'speed':
            audio = apply_speed(audio, parameters)
        elif edit_type == 'reverb':
            audio = apply_reverb(audio, parameters)
        elif edit_type == 'volume':
            audio = apply_volume(audio, parameters)
        else:
            raise ValueError(f"Unsupported edit type: {edit_type}")
        
        # Save the processed file with a unique name
        output_dir = os.path.dirname(file_path)
        output_filename = f"{uuid.uuid4()}.{file_path.split('.')[-1]}"
        output_path = os.path.join(output_dir, output_filename)
        
        audio.export(output_path, format=file_path.split('.')[-1])
        return output_path
        
    except Exception as e:
        print(f"Error processing audio: {e}")
        return None

def apply_trim(audio, parameters):
    """Apply trim edit to audio segment"""
    start_ms = parameters.get('start_ms', 0)
    end_ms = parameters.get('end_ms', len(audio))
    return audio[start_ms:end_ms]

def apply_speed(audio, parameters):
    """Apply speed adjustment to audio segment"""
    speed_factor = parameters.get('speed_factor', 1.0)
    return audio.speedup(playback_speed=speed_factor)

def apply_reverb(audio, parameters):
    """Apply reverb effect to audio segment"""
    # Using a temp file for ffmpeg processing
    room_scale = parameters.get('room_scale', 0.5)
    damping = parameters.get('damping', 0.5)
    
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
    temp_file.close()
    
    # Export to temp file
    audio.export(temp_file.name, format="wav")
    
    # Apply reverb using ffmpeg
    output_temp = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
    output_temp.close()
    
    os.system(f'ffmpeg -i {temp_file.name} -af "aecho=0.8:{room_scale}:1000:{damping}" {output_temp.name}')
    
    # Load the processed file
    processed_audio = AudioSegment.from_file(output_temp.name)
    
    # Clean up temp files
    os.unlink(temp_file.name)
    os.unlink(output_temp.name)
    
    return processed_audio

def apply_volume(audio, parameters):
    """Apply volume adjustment to audio segment"""
    volume_change_db = parameters.get('volume_change_db', 0)
    return audio + volume_change_db
```

### Frontend Implementation

The audio editor UI is built using the `wavesurfer.js` library for waveform visualization and the Web Audio API for playback.

```typescript
// Simplified implementation of the audio waveform component
import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';

interface AudioWaveformProps {
  audioUrl: string;
  onRegionUpdate?: (start: number, end: number) => void;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ audioUrl, onRegionUpdate }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  useEffect(() => {
    if (waveformRef.current) {
      // Initialize WaveSurfer
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#336699',
        progressColor: '#993366',
        height: 100,
        barWidth: 3,
        barGap: 1,
        responsive: true,
        cursorColor: '#FF9900',
        plugins: [
          RegionsPlugin.create({
            dragSelection: true,
            color: 'rgba(255, 153, 0, 0.3)'
          })
        ]
      });
      
      wavesurfer.load(audioUrl);
      
      wavesurfer.on('ready', () => {
        wavesurferRef.current = wavesurfer;
      });
      
      wavesurfer.on('region-update-end', (region) => {
        if (onRegionUpdate) {
          onRegionUpdate(region.start * 1000, region.end * 1000);
        }
      });
      
      wavesurfer.on('play', () => setIsPlaying(true));
      wavesurfer.on('pause', () => setIsPlaying(false));
      
      return () => {
        wavesurfer.destroy();
      };
    }
  }, [audioUrl, onRegionUpdate]);
  
  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };
  
  return (
    <div className="audio-waveform">
      <div ref={waveformRef} className="waveform-container" />
      <div className="controls">
        <button 
          className="play-button"
          onClick={handlePlayPause}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        {/* Additional controls would go here */}
      </div>
    </div>
  );
};

export default AudioWaveform;
```

## Audio Processing API Endpoints

The audio processing functionality is exposed through the following API endpoints:

- `POST /api/audio/` - Upload a new audio file
- `GET /api/audio/:id/` - Get audio file metadata
- `POST /api/audio/:id/edit/` - Apply an edit to an audio file
- `GET /api/audio/:id/download/` - Download the processed audio file

## File Storage

Audio files are stored using Django's file storage system. In production, files are stored in a secure S3-compatible object storage service provided by Digital Ocean.

The storage configuration in Django settings:

```python
# Audio file storage configuration
if DEBUG:
    # Local development storage
    DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
    MEDIA_URL = '/media/'
else:
    # Production S3 storage
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    AWS_ACCESS_KEY_ID = os.environ.get('DO_SPACES_KEY')
    AWS_SECRET_ACCESS_KEY = os.environ.get('DO_SPACES_SECRET')
    AWS_STORAGE_BUCKET_NAME = os.environ.get('DO_SPACES_BUCKET')
    AWS_S3_ENDPOINT_URL = os.environ.get('DO_SPACES_ENDPOINT')
    AWS_S3_OBJECT_PARAMETERS = {
        'CacheControl': 'max-age=86400',
    }
    AWS_LOCATION = 'media'
    MEDIA_URL = f'https://{AWS_STORAGE_BUCKET_NAME}.{AWS_S3_ENDPOINT_URL}/{AWS_LOCATION}/'
```

## Security Considerations

- Audio files are only accessible to the user who uploaded them
- File size limits are enforced (20 MB maximum)
- Only common audio formats are accepted (MP3, WAV, FLAC)
- Files are scanned for malware before processing 