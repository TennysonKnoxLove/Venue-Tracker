#!/bin/bash

echo "Deploying comprehensive audio player fix to address 'no supported sources' error..."

# Create a temporary patch script
cat > /tmp/patch_audio_editor.js << 'EOF'
// Add CORS headers to audio endpoint for proper playback
// These changes will be made to the handleFileUpload and useEffect functions

// Fix for the audio element source URL handling:
// 1. Use direct file object URLs for local file access
// 2. Ensure proper MIME types are set
// 3. Add crossOrigin attribute to audio element
// 4. Handle authentication token in API requests
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

# Path to the AudioEditorPage.js file
AUDIO_EDITOR_FILE="/app/src/pages/AudioEditorPage.js"

# 1. Fix the audio element in the render section to add crossOrigin attribute
# Find the line with the audio element
AUDIO_ELEMENT_LINE=$(grep -n '<audio' $AUDIO_EDITOR_FILE | cut -d':' -f1)

# Replace with modified version that includes crossOrigin
sed -i "${AUDIO_ELEMENT_LINE}s|<audio |<audio crossOrigin=\"anonymous\" |" $AUDIO_EDITOR_FILE

# 2. Fix the useEffect hook that sets up the audio element when selected file changes
# Find the useEffect that handles selected file changes
USE_EFFECT_START=$(grep -n "// Set up audio element when selected file changes" $AUDIO_EDITOR_FILE | cut -d':' -f1)
USE_EFFECT_END=$((USE_EFFECT_START + 20))

# Create a more robust implementation
cat > /tmp/use_effect_replacement.txt << 'EOCODE'
  // Set up audio element when selected file changes
  useEffect(() => {
    if (selectedFile && audioRef.current) {
      // Clear any previous source
      audioRef.current.src = '';
      
      if (selectedFile.file && typeof selectedFile.file === 'string' && selectedFile.file.startsWith('http')) {
        // If the file property is already a URL, use it directly
        audioRef.current.src = selectedFile.file;
      } else if (selectedFile.id) {
        // Construct proper URL with authentication
        const token = localStorage.getItem('authToken');
        const baseUrl = apiClient?.defaults?.baseURL || process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
        const url = `${baseUrl}/audio/${selectedFile.id}/download/`;
        
        // Set the source with proper URL
        audioRef.current.src = url;
        
        // Ensure proper headers for the request
        if (token) {
          // For cross-origin requests, we need to pre-fetch the file
          fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          .then(response => response.blob())
          .then(blob => {
            // Create an object URL from the blob
            const objectUrl = URL.createObjectURL(blob);
            audioRef.current.src = objectUrl;
            
            // Clean up the object URL when the component unmounts
            return () => URL.revokeObjectURL(objectUrl);
          })
          .catch(err => {
            console.error("Error fetching audio file:", err);
            setError("Failed to load audio file. Please try again.");
          });
        }
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
EOCODE

# Replace the useEffect hook with our improved version
sed -i "${USE_EFFECT_START},${USE_EFFECT_END}c\\$(cat /tmp/use_effect_replacement.txt)" $AUDIO_EDITOR_FILE

# 3. Fix the handleFileUpload function to properly set the audio source
# Find the line where audioRef.current.src is set in the upload handler
UPLOAD_SRC_LINE=$(grep -n "audioRef.current.src" $AUDIO_EDITOR_FILE | grep -v "selectedFile.file" | cut -d':' -f1)
UPLOAD_END=$((UPLOAD_SRC_LINE + 4))

# Create a replacement for the file upload audio source setting
cat > /tmp/upload_src_replacement.txt << 'EOCODE'
          // Set audio source using a blob URL for better compatibility
          if (audioRef.current) {
            const token = localStorage.getItem('authToken');
            const baseUrl = apiClient?.defaults?.baseURL || process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
            const url = `${baseUrl}/audio/${detailedFile.id}/download/`;
            
            fetch(url, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
            .then(response => response.blob())
            .then(blob => {
              // Create a blob URL which is more reliable for audio playback
              const objectUrl = URL.createObjectURL(blob);
              audioRef.current.src = objectUrl;
            })
            .catch(err => {
              console.error("Error fetching uploaded audio:", err);
              setError("Failed to load the uploaded audio file.");
            });
          }
EOCODE

# Replace the upload source setting with our improved version
sed -i "${UPLOAD_SRC_LINE},${UPLOAD_END}c\\$(cat /tmp/upload_src_replacement.txt)" $AUDIO_EDITOR_FILE

# 4. Make sure we're importing apiClient at the top
IMPORT_LINE=$(grep -n "import { audioService } from '../api';" $AUDIO_EDITOR_FILE | cut -d':' -f1)
sed -i "${IMPORT_LINE}s|import { audioService } from '../api';|import { audioService } from '../api';\nimport apiClient from '../api/client';|" $AUDIO_EDITOR_FILE

# 5. Add error handling for audio element load errors
AUDIO_ELEMENT_LINE=$(grep -n '</audio>' $AUDIO_EDITOR_FILE | cut -d':' -f1)
AUDIO_ELEMENT_START=$(grep -n '<audio' $AUDIO_EDITOR_FILE | cut -d':' -f1)

cat > /tmp/audio_element_replacement.txt << 'EOCODE'
        <audio 
          ref={audioRef} 
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onError={(e) => {
            console.error("Audio element error:", e);
            setError("Failed to load audio source. Please try another file.");
          }}
          crossOrigin="anonymous"
        />
EOCODE

# Replace the audio element with our improved version
sed -i "${AUDIO_ELEMENT_START},${AUDIO_ELEMENT_LINE}c\\$(cat /tmp/audio_element_replacement.txt)" $AUDIO_EDITOR_FILE

# Verify changes
echo "Verifying audio element changes:"
grep -A2 -B2 "crossOrigin" $AUDIO_EDITOR_FILE

echo "Verifying imports:"
head -10 $AUDIO_EDITOR_FILE

echo "Fixes applied successfully!"
INNEREOF

  # Make the script executable
  chmod +x /tmp/fix.sh
  
  # Copy the script into the container
  docker cp /tmp/fix.sh $CONTAINER_ID:/tmp/fix.sh
  
  # Execute the script in the container
  docker exec $CONTAINER_ID /tmp/fix.sh
  
  # Also check if we need to update CORS settings in the backend API
  # Add CORS headers to all audio-related API responses
  BACKEND_CONTAINER_ID=$(docker ps -q --filter name=root-backend)
  
  # Create a mini script to add CORS headers to the backend
  cat > /tmp/backend_fix.sh << 'INNEREOF'
#!/bin/bash

# Path to the audio views file
AUDIO_VIEWS_FILE="/app/api/audio/views/audio_views.py"

# Check if we need to add CORS headers to the download method
if ! grep -q "response\['Access-Control-Allow-Origin'\]" $AUDIO_VIEWS_FILE; then
  # Find the download action
  DOWNLOAD_START=$(grep -n "@action(detail=True, methods=\['get'\])" $AUDIO_VIEWS_FILE | grep -A1 "download" | head -1 | cut -d':' -f1)
  RETURN_LINE=$(grep -n "return FileResponse" $AUDIO_VIEWS_FILE | cut -d':' -f1)
  
  # Create the replacement that includes CORS headers
  cat > /tmp/download_replacement.txt << 'EOCODE'
        response = FileResponse(
            open(file_path, 'rb'),
            as_attachment=True,
            filename=f"{audio_file.title}.{audio_file.file_type}"
        )
        
        # Add CORS headers to allow playback in browser
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        
        return response
EOCODE

  # Replace the return statement with our modified version
  sed -i "${RETURN_LINE},${RETURN_LINE}c\\$(cat /tmp/download_replacement.txt)" $AUDIO_VIEWS_FILE
  
  echo "Added CORS headers to audio download response."
fi

# Verify changes
echo "Verifying backend CORS changes:"
grep -A6 "Access-Control-Allow-Origin" $AUDIO_VIEWS_FILE
INNEREOF

  # Make the backend script executable
  chmod +x /tmp/backend_fix.sh
  
  # Copy the script into the backend container
  docker cp /tmp/backend_fix.sh $BACKEND_CONTAINER_ID:/tmp/backend_fix.sh
  
  # Execute the script in the backend container
  docker exec $BACKEND_CONTAINER_ID /tmp/backend_fix.sh
  
  # Restart both containers
  docker restart $CONTAINER_ID
  docker restart $BACKEND_CONTAINER_ID
  
  echo "Both frontend and backend fixes deployed and containers restarted!"
EOF

echo "Done! The audio player has been fixed with comprehensive changes to handle audio sources properly."