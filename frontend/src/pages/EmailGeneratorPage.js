import React, { useState, useEffect } from 'react';
import emailService from '../api/emailService';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const EmailGeneratorPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    venue_name: '',
    event_date: '',
    notes: ''
  });
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [outreachHistory, setOutreachHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load outreach history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        const history = await emailService.getOutreachHistory();
        setOutreachHistory(history);
      } catch (err) {
        console.error('Failed to load outreach history:', err);
      } finally {
        setHistoryLoading(false);
      }
    };
    
    loadHistory();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setGeneratedEmail('');
    
    // Validate venue name
    if (!formData.venue_name.trim()) {
      setError('Venue name is required');
      return;
    }
    
    // Format the data for API
    const requestData = {
      venue_name: formData.venue_name.trim(),
      notes: formData.notes.trim()
    };
    
    // Add event date if provided
    if (formData.event_date) {
      requestData.event_date = formData.event_date;
    }
    
    try {
      setLoading(true);
      const response = await emailService.generateEmail(requestData);
      setGeneratedEmail(response.email);
      
      // Refresh outreach history
      const history = await emailService.getOutreachHistory();
      setOutreachHistory(history);
    } catch (err) {
      console.error('Failed to generate email:', err);
      setError('Failed to generate email. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
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
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this outreach record?')) {
      try {
        await emailService.deleteOutreach(id);
        setOutreachHistory(outreachHistory.filter(item => item.id !== id));
      } catch (err) {
        console.error('Failed to delete outreach:', err);
        alert('Failed to delete outreach record');
      }
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Email Generator</h2>
      
      <div className="window-win98 mb-6">
        <div className="window-title-win98">
          <div className="text-black font-bold px-2">Generate New Email</div>
        </div>
        <div className="p-4 bg-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="venue_name" className="block mb-1 font-bold">
                Venue Name*
              </label>
              <input
                id="venue_name"
                name="venue_name"
                value={formData.venue_name}
                onChange={handleChange}
                className="w-full border-2 border-gray-400 p-2"
                placeholder="Enter venue name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="event_date" className="block mb-1 font-bold">
                Event Date (Optional)
              </label>
              <input
                id="event_date"
                name="event_date"
                type="date"
                value={formData.event_date}
                onChange={handleChange}
                className="w-full border-2 border-gray-400 p-2"
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block mb-1 font-bold">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full border-2 border-gray-400 p-2 h-24"
                placeholder="Any specific details to include in the email"
              />
            </div>
            
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                {error}
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-win98"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Email'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {generatedEmail && (
        <div className="window-win98 mb-6">
          <div className="window-title-win98">
            <div className="text-white font-bold px-2">Generated Email</div>
          </div>
          <div className="p-4 bg-gray-200">
            <div className="bg-white border-2 border-gray-400 p-4 mb-4 whitespace-pre-line">
              {generatedEmail}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleCopy}
                className="btn-win98"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="window-win98">
        <div className="window-title-win98">
          <div className="text-white font-bold px-2">Outreach History</div>
        </div>
        <div className="p-4 bg-gray-200">
          {historyLoading ? (
            <div className="text-center p-4">Loading history...</div>
          ) : outreachHistory.length === 0 ? (
            <div className="text-center p-4">
              <p>No outreach history available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {outreachHistory.map(item => (
                <div 
                  key={item.id} 
                  className="border-2 border-gray-400 bg-white p-3"
                >
                  <div className="flex justify-between mb-2">
                    <h3 className="font-bold">To: {item.venue_name}</h3>
                    <span className="text-sm text-gray-600">
                      {moment(item.sent_date).format('MMM D, YYYY')}
                    </span>
                  </div>
                  
                  {item.event_date && (
                    <div className="text-sm mb-2">
                      <span className="font-semibold">Event Date:</span> {moment(item.event_date).format('MMM D, YYYY')}
                    </div>
                  )}
                  
                  <div className="mb-2">
                    <p className="truncate text-gray-600">
                      {item.email_content.substring(0, 100)}...
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setGeneratedEmail(item.email_content);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-blue-100 text-blue-800 px-2 py-1 border border-blue-300 text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-100 text-red-800 px-2 py-1 border border-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailGeneratorPage; 