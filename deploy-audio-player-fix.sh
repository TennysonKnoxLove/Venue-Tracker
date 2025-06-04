#!/bin/bash

echo "Deploying audio player fix to address 'no supported sources' error..."

# Create a temporary patch script
cat > /tmp/patch_audio_editor.js << 'EOF'
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
      // Use getDownloadUrl helper function for proper URL construction
      audioRef.current.src = audioService.getDownloadUrl(selectedFile.id);
      
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
        
        // Ensure the audio element has the correct source using the service function
        if (audioRef.current) {
          audioRef.current.src = audioService.getDownloadUrl(detailedFile.id);
        }
      } catch (err) {
        console.error("Error uploading audio file:", err);
        setError("Failed to upload audio file. Please try again.");
      } finally {
        setIsUploading(false);
        // Reset the file input
        e.target.value = '';
      }
    }
  };
EOF

# Copy our fix script to the server
scp /tmp/patch_audio_editor.js root@147.182.168.13:/tmp/patch_audio_editor.js

# SSH into the server and apply the fix
ssh root@147.182.168.13 << 'EOF'
  # Get the frontend container ID
  CONTAINER_ID=$(docker ps -q --filter name=root-frontend)
  
  # Create a mini script to edit just the sections with the issue
  cat > /tmp/fix.sh << 'INNEREOF'
#!/bin/bash
# Find the line where we need to start applying our patch
LINE_START=$(grep -n "// Set up audio element when selected file changes" /app/src/pages/AudioEditorPage.js | cut -d':' -f1)
# Find the end of the useEffect hook 
LINE_END=$((LINE_START + 20))

# Replace the problematic section
sed -i "${LINE_START},${LINE_END}s|audioRef.current.src = .*|\      // Use getDownloadUrl helper function for proper URL construction\n      audioRef.current.src = audioService.getDownloadUrl(selectedFile.id);|" /app/src/pages/AudioEditorPage.js

# Fix the other instance in the handleFileUpload function
LINE_UPLOAD=$(grep -n "audioRef.current.src =" /app/src/pages/AudioEditorPage.js | grep -v "selectedFile.file" | cut -d':' -f1)
sed -i "${LINE_UPLOAD}s|audioRef.current.src = .*|\          audioRef.current.src = audioService.getDownloadUrl(detailedFile.id);|" /app/src/pages/AudioEditorPage.js
INNEREOF

  # Make the script executable
  chmod +x /tmp/fix.sh
  
  # Copy the script into the container
  docker cp /tmp/fix.sh $CONTAINER_ID:/tmp/fix.sh
  
  # Execute the script in the container
  docker exec $CONTAINER_ID /tmp/fix.sh
  
  # Verify the changes
  docker exec $CONTAINER_ID grep -A5 "audioRef.current.src" /app/src/pages/AudioEditorPage.js
  
  # Restart the container
  docker restart $CONTAINER_ID
  
  echo "Audio player fix deployed and container restarted!"
EOF

echo "Done! The audio player has been fixed to properly handle the src attribute." 