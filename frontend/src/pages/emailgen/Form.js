import { emailService } from '../../api';
import { win98Alert, win98Confirm } from '../../utils/Win98Modals';

export function getFormActions({
  formData,
  setFormData,
  setError,
  setGeneratedEmail,
  generatedEmail,
  setLoading,
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
      const email = (response.email || '').trim();
      if (!email) {
        setError('The generator returned an empty email. Please try again.');
        return;
      }

      setGeneratedEmail(email);
      setFormData({
        venue_name: '',
        event_date: '',
        notes: '',
      });
      setOutreachHistory((current) => [
        {
          id: response.outreach_id,
          venue_name: requestData.venue_name,
          email_content: email,
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

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(generatedEmail);
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

        if (!successful) {
          throw new Error('Copy command failed');
        }
      }

      await win98Alert('Email copied to clipboard!', 'Copied', 'info');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      await win98Alert('Unable to copy email. Please select and copy manually.', 'Copy Failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await win98Confirm(
      'Are you sure you want to delete this outreach record?',
      'Delete Email',
      'warning'
    );
    if (!confirmed) return;

    try {
      await emailService.deleteOutreach(id);
      setOutreachHistory((current) => current.filter((item) => item.id !== id));
      await win98Alert('Outreach record deleted', 'Deleted', 'info');
    } catch (err) {
      console.error('Failed to delete outreach:', err);
      await win98Alert('Failed to delete outreach record', 'Error', 'error');
    }
  };

  return {
    handleChange,
    handleSubmit,
    handleCopy,
    handleDelete,
  };
}
