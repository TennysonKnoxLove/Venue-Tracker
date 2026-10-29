import { emailService } from '../../api';

export function getFormActions({
  formData,
  setFormData,
  setError,
  setGeneratedEmail,
  generatedEmail,
  setLoading,
  outreachHistory,
  setOutreachHistory,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setGeneratedEmail('');

    if (!formData.venue_name.trim()) {
      setError('Venue name is required');
      return;
    }

    const requestData = {
      venue_name: formData.venue_name.trim(),
      notes: formData.notes.trim(),
    };

    if (formData.event_date) {
      requestData.event_date = formData.event_date;
    }

    try {
      setLoading(true);
      const response = await emailService.generateEmail(requestData);
      setGeneratedEmail(response.email);
      setOutreachHistory((current) => [
        {
          id: response.outreach_id,
          venue_name: requestData.venue_name,
          email_content: response.email,
          sent_date: new Date().toISOString(),
          event_date: requestData.event_date || null,
          notes: requestData.notes,
        },
        ...current,
      ]);
    } catch (err) {
      console.error('Failed to generate email:', err);
      setError('Failed to generate email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(generatedEmail);
        alert('Email copied to clipboard!');
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = generatedEmail;

        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);

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
        setOutreachHistory(outreachHistory.filter((item) => item.id !== id));
      } catch (err) {
        console.error('Failed to delete outreach:', err);
        alert('Failed to delete outreach record');
      }
    }
  };

  return {
    handleChange,
    handleSubmit,
    handleCopy,
    handleDelete,
  };
}
