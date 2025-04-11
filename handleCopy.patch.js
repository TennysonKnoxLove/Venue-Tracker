// Fixed handleCopy function with fallback method
const handleCopy = () => {
  try {
    // Primary method - use Clipboard API if available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(generatedEmail);
      alert('Email copied to clipboard!');
    } else {
      // Fallback method - create temporary textarea element
      const textArea = document.createElement('textarea');
      textArea.value = generatedEmail;
      
      // Make the textarea out of viewport
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      // Select and copy the text
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        alert('Email copied to clipboard!');
      } else {
        alert('Unable to copy email. Please select and copy manually.');
      }
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    alert('Unable to copy email. Please select and copy manually.');
  }
}; 