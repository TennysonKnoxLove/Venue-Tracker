import { audioService } from '../../api';

export function getEditActions({
  selectedFile,
  editParams,
  setEditParams,
  setSelectedFile,
  setAudioFiles,
  setError,
}) {
  const handleApplyEdit = async (editType) => {
    if (!selectedFile) return;

    try {
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

      await audioService.applyEdit(selectedFile.id, editType, parameters);
      const updatedFile = await audioService.getAudioDetails(selectedFile.id);
      setSelectedFile(updatedFile);

      setAudioFiles((prev) =>
        prev.map((file) => (file.id === updatedFile.id ? updatedFile : file))
      );
    } catch (err) {
      console.error(`Error applying ${editType} edit:`, err);
      setError(`Failed to apply ${editType} edit. Please try again.`);
    }
  };

  const handleTrimStartChange = (e) => {
    const newStart = parseFloat(e.target.value);
    setEditParams((prev) => ({
      ...prev,
      trim: {
        ...prev.trim,
        start: newStart,
        end: Math.max(newStart + 1, prev.trim.end),
      },
    }));
  };

  const handleTrimEndChange = (e) => {
    const newEnd = parseFloat(e.target.value);
    setEditParams((prev) => ({
      ...prev,
      trim: {
        ...prev.trim,
        end: newEnd,
        start: Math.min(prev.trim.start, newEnd - 1),
      },
    }));
  };

  const handleReverbRoomScaleChange = (e) => {
    setEditParams((prev) => ({
      ...prev,
      reverb: {
        ...prev.reverb,
        roomScale: parseFloat(e.target.value),
      },
    }));
  };

  const handleReverbDampingChange = (e) => {
    setEditParams((prev) => ({
      ...prev,
      reverb: {
        ...prev.reverb,
        damping: parseFloat(e.target.value),
      },
    }));
  };

  const handleSpeedChange = (e) => {
    setEditParams((prev) => ({
      ...prev,
      speed: parseFloat(e.target.value),
    }));
  };

  return {
    handleApplyEdit,
    handleTrimStartChange,
    handleTrimEndChange,
    handleReverbRoomScaleChange,
    handleReverbDampingChange,
    handleSpeedChange,
  };
}
