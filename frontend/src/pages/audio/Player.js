export function getPlayerActions({
  audioRef,
  setIsPlaying,
  setError,
  setEditParams,
}) {
  const handlePlay = () => {
    if (!audioRef.current) return;

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error('Audio playback error:', error);
          setError('Failed to play audio. Please check the file or network.');
          setIsPlaying(false);
        });
    }
  };

  const handlePause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const handleRewind = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
  };

  const handleForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(
      audioRef.current.duration,
      audioRef.current.currentTime + 5
    );
  };

  const handleVolumeChange = (e) => {
    setEditParams((prev) => ({
      ...prev,
      volume: parseFloat(e.target.value),
    }));
  };

  return {
    handlePlay,
    handlePause,
    handleStop,
    handleRewind,
    handleForward,
    handleVolumeChange,
  };
}
