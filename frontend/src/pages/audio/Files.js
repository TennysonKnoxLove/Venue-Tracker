import { audioService } from '../../api';

const audioDownloadUrl = (id) =>
  `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/audio/${id}/download/`;

export async function fetchAudioFiles({ setLoading, setError, setAudioFiles }) {
  setLoading(true);
  setError(null);

  try {
    const result = await audioService.getAudioFiles();
    setAudioFiles(result || []);
  } catch (err) {
    console.error('Error fetching audio files:', err);
    setError('Failed to load audio files. Please refresh the page.');
  } finally {
    setLoading(false);
  }
}

export function getFileActions({
  setIsUploading,
  setError,
  setAudioFiles,
  setSelectedFile,
  selectedFile,
  audioRef,
  user,
  setLoading,
}) {
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await audioService.uploadAudio(file, file.name);
      const detailedFile = await audioService.getAudioDetails(result.id);

      setAudioFiles((prev) => [...prev, detailedFile]);
      setSelectedFile(detailedFile);

      if (audioRef.current) {
        audioRef.current.src = audioDownloadUrl(detailedFile.id);
      }
    } catch (err) {
      console.error('Error uploading audio file:', err);
      setError('Failed to upload audio file. Could be too large, or an incorrect format. Please try again.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await audioService.deleteAudio(fileId);

      setAudioFiles((prev) => prev.filter((item) => item.id !== fileId));
      if (selectedFile && selectedFile.id === fileId) {
        setSelectedFile(null);
      }
    } catch (err) {
      console.error('Error deleting audio file:', err);
      setError('Failed to delete audio file. Please try again.');
    }
  };

  const isOwner = (file) => Boolean(user) && file.user === user.id;

  return {
    handleFileUpload,
    handleDeleteFile,
    isOwner,
    fetchAudioFiles: () => fetchAudioFiles({ setLoading, setError, setAudioFiles }),
  };
}
