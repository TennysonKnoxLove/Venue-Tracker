from pydub import AudioSegment
import os
import subprocess
import uuid
import numpy as np
import logging

logger = logging.getLogger(__name__)

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
    output_dir = os.path.dirname(file_path)
    output_filename = f"{uuid.uuid4()}.{file_path.split('.')[-1]}"
    output_path = os.path.join(output_dir, output_filename)

    if edit_type == 'speed':
        return apply_speed(file_path, output_path, parameters)

    audio = AudioSegment.from_file(file_path)

    if edit_type == 'trim':
        audio = apply_trim(audio, parameters)
    elif edit_type == 'reverb':
        audio = apply_reverb(audio, parameters)
    elif edit_type == 'volume':
        audio = apply_volume(audio, parameters)
    else:
        raise ValueError(f"Unsupported edit type: {edit_type}")

    audio.export(output_path, format=file_path.split('.')[-1])
    return output_path

def apply_trim(audio, parameters):
    """Apply trim edit to audio segment"""
    start_ms = parameters.get('start_ms', 0)
    end_ms = parameters.get('end_ms', len(audio))
    return audio[start_ms:end_ms]

def _sample_rate(file_path):
    result = subprocess.run(
        [
            'ffprobe', '-v', 'error',
            '-select_streams', 'a:0',
            '-show_entries', 'stream=sample_rate',
            '-of', 'csv=p=0',
            file_path,
        ],
        capture_output=True,
        text=True,
    )
    rate = result.stdout.strip()
    if result.returncode == 0 and rate.isdigit():
        return int(rate)
    return AudioSegment.from_file(file_path).frame_rate

def apply_speed(file_path, output_path, parameters):
    """Change playback speed and pitch together. Faster sounds higher, slower sounds lower."""
    speed_factor = float(parameters.get('speed_factor', 1.0))
    if speed_factor < 0.5 or speed_factor > 2.0:
        raise ValueError('Speed must be between 0.5 and 2.0')

    sample_rate = _sample_rate(file_path)
    pitched_rate = max(1, int(round(sample_rate * speed_factor)))
    result = subprocess.run(
        [
            'ffmpeg', '-y', '-i', file_path,
            '-filter:a', f'asetrate={pitched_rate},aresample={sample_rate}',
            output_path,
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        if os.path.exists(output_path):
            os.remove(output_path)
        raise RuntimeError(result.stderr.strip() or 'ffmpeg failed to change speed')
    return output_path

def apply_reverb(audio, parameters):
    """Apply a room reverb by convolving with a decaying impulse response.

    Room scale sets the size and how long the tail rings. Damping darkens
    the tail by rolling off high frequencies. The dry signal stays in the mix.
    """
    room_scale = min(1.0, max(0.0, float(parameters.get('room_scale', 0.5))))
    damping = min(1.0, max(0.0, float(parameters.get('damping', 0.5))))

    channels = audio.channels
    sample_rate = audio.frame_rate
    sample_width = audio.sample_width
    raw = np.array(audio.get_array_of_samples(), dtype=np.float64)
    raw = raw.reshape((-1, channels))

    if sample_width == 1:
        raw = raw - 128.0
        scale = 128.0
    else:
        scale = float(1 << (8 * sample_width - 1))
    normalized = raw / scale

    processed = [
        _reverberate(normalized[:, channel], sample_rate, room_scale, damping, channel + 1)
        for channel in range(channels)
    ]
    mixed = np.column_stack(processed)
    peak = float(np.max(np.abs(mixed))) if mixed.size else 0.0
    if peak > 0.98:
        mixed *= 0.98 / peak

    if sample_width == 1:
        pcm = np.clip(np.round(mixed * 127.0 + 128.0), 0, 255).astype(np.uint8)
    elif sample_width == 4:
        pcm = np.clip(np.round(mixed * 2147483647.0), -2147483648, 2147483647).astype(np.int32)
    else:
        sample_width = 2
        pcm = np.clip(np.round(mixed * 32767.0), -32768, 32767).astype(np.int16)

    return AudioSegment(
        data=np.ascontiguousarray(pcm).tobytes(),
        sample_width=sample_width,
        frame_rate=sample_rate,
        channels=channels,
    )


def _reverberate(dry, sample_rate, room_scale, damping, seed):
    impulse = _room_impulse(sample_rate, room_scale, damping, seed)
    wet = _fft_convolve(dry, impulse)
    padded = np.pad(dry, (0, len(impulse) - 1))
    return padded + wet


def _room_impulse(sample_rate, room_scale, damping, seed):
    """Diffuse room tail. Reflections are dense and quiet so they read as space."""
    rt60 = 0.35 + room_scale * 2.5
    length = max(int(sample_rate * (rt60 + 0.05)), 1)
    timeline = np.arange(length) / sample_rate
    envelope = np.exp(-6.9078 * timeline / rt60)
    fade = min(int(sample_rate * 0.004), length)
    if fade:
        envelope[:fade] *= np.linspace(0.0, 1.0, fade, endpoint=False)

    impulse = np.random.default_rng(seed).standard_normal(length) * envelope
    span = 0.015 + room_scale * 0.07
    for index in range(32):
        position = (index + 0.5) / 32
        delay = 0.004 + span * position * position
        sample = int(delay * sample_rate)
        if sample < length:
            sign = 1.0 if (index + seed) % 2 == 0 else -1.0
            impulse[sample] += sign * (0.12 - 0.08 * position)

    impulse = _damp_impulse(impulse, sample_rate, damping)
    energy = float(np.sqrt(np.sum(impulse * impulse)))
    if energy > 0:
        impulse /= energy
    return impulse * 0.55


def _damp_impulse(impulse, sample_rate, damping):
    """Darken the tail. Higher damping lowers the high-frequency cutoff."""
    if damping <= 0.01:
        return impulse
    cutoff = 14000.0 - damping * 12800.0
    spectrum = np.fft.rfft(impulse)
    freqs = np.fft.rfftfreq(len(impulse), 1.0 / sample_rate)
    spectrum *= 1.0 / np.sqrt(1.0 + (freqs / cutoff) ** 4)
    return np.fft.irfft(spectrum, len(impulse))


def _fft_convolve(signal, impulse):
    size = len(signal) + len(impulse) - 1
    transform = 1 << (size - 1).bit_length()
    mixed = np.fft.irfft(np.fft.rfft(signal, transform) * np.fft.rfft(impulse, transform), transform)
    return mixed[:size]

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
        dict: Waveform data and duration, or None if an error occurs
    """
    logger.info(f"Generating waveform data for: {audio_path}")
    try:
        audio = AudioSegment.from_file(audio_path)
        logger.debug(f"Successfully loaded audio: {audio_path} with Pydub.")
        
        duration_seconds = len(audio) / 1000.0
        
        if audio.channels > 1:
            logger.debug(f"Converting stereo to mono for: {audio_path}")
            audio = audio.set_channels(1)
        
        samples = np.array(audio.get_array_of_samples())
        logger.debug(f"Got array of samples for: {audio_path}, shape: {samples.shape}")
        
        max_abs_sample = np.max(np.abs(samples))
        if max_abs_sample == 0:
            logger.warning(f"Audio file {audio_path} appears to be silent or empty. Waveform will be flat.")
            # For silent audio, create a list of zeros (valid JSON numbers)
            normalized_samples = np.zeros_like(samples, dtype=float) 
        else:
            normalized_samples = samples / max_abs_sample
        
        sample_count = len(normalized_samples)
        points_per_sample = sample_count // num_points
        
        waveform = []
        for i in range(num_points):
            start = i * points_per_sample
            end = min((i + 1) * points_per_sample, sample_count)
            if start < end:
                segment = normalized_samples[start:end]
                # Calculate max absolute amplitude in the segment
                amplitude = float(max(np.max(segment), -np.min(segment))) # Handles positive and negative peaks
                if np.isnan(amplitude): # Check for NaN
                    logger.warning(f"NaN detected for amplitude at point {i} for {audio_path}. Replacing with null (0.0 for now).")
                    waveform.append(0.0) # Replace NaN with 0.0 (or None which becomes null)
                else:
                    waveform.append(amplitude)
            else:
                waveform.append(0.0)
        
        logger.info(f"Successfully generated waveform for: {audio_path}, duration: {duration_seconds}s")
        return {
            'waveform': waveform,
            'duration': duration_seconds
        }
    
    except Exception as e:
        logger.error(f"Error generating waveform data for {audio_path}: {e}", exc_info=True)
        # Return None to indicate a significant failure to the caller
        return None 