from pydub import AudioSegment
import os
import uuid
import tempfile
import json
import numpy as np

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
    # Use pydub's speedup method
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
    
    # Add -y flag to force overwrite
    os.system(f'ffmpeg -y -i {temp_file.name} -af "aecho=0.8:{room_scale}:1000:{damping}" {output_temp.name}')
    
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

def generate_waveform_data(audio_path, num_points=100):
    """
    Generate waveform data for visualization
    
    Args:
        audio_path (str): Path to the audio file
        num_points (int): Number of data points to generate
        
    Returns:
        dict: Waveform data and duration
    """
    try:
        audio = AudioSegment.from_file(audio_path)
        
        # Calculate duration in seconds
        duration_seconds = len(audio) / 1000.0
        
        # Convert to mono if stereo
        if audio.channels > 1:
            audio = audio.set_channels(1)
        
        # Get raw audio data
        samples = np.array(audio.get_array_of_samples())
        
        # Normalize
        samples = samples / np.max(np.abs(samples))
        
        # Resample to desired number of points
        sample_count = len(samples)
        points_per_sample = sample_count // num_points
        
        waveform = []
        for i in range(num_points):
            start = i * points_per_sample
            end = min((i + 1) * points_per_sample, sample_count)
            if start < end:
                # Use max amplitude in this segment
                segment = samples[start:end]
                amplitude = float(max(abs(segment.min()), abs(segment.max())))
                waveform.append(amplitude)
            else:
                waveform.append(0.0)
        
        return {
            'waveform': waveform,
            'duration': duration_seconds
        }
    
    except Exception as e:
        print(f"Error generating waveform data: {e}")
        return {'waveform': [], 'duration': 0} 