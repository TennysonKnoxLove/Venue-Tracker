import profileService from '../../api/profileService';
import { win98Alert } from '../../utils/Win98Modals';

export function getProfileActions({
  profile,
  setProfile,
  customGenre,
  setCustomGenre,
  newLink,
  setNewLink,
  socialLinks,
  setSocialLinks,
  setError,
}) {
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenreToggle = (genre) => {
    if (profile.genres.includes(genre)) {
      setProfile(prev => ({
        ...prev,
        genres: prev.genres.filter(g => g !== genre)
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        genres: [...prev.genres, genre]
      }));
    }
  };

  const handleAddCustomGenre = () => {
    if (customGenre && !profile.genres.includes(customGenre)) {
      setProfile(prev => ({
        ...prev,
        genres: [...prev.genres, customGenre]
      }));
      setCustomGenre('');
    }
  };

  const handleNewLinkChange = (e) => {
    const { name, value } = e.target;
    setNewLink(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddLink = async () => {
    if (newLink.label && newLink.url) {
      try {
        const addedLink = await profileService.addSocialLink(newLink);
        setSocialLinks([...socialLinks, addedLink]);
        setNewLink({ label: '', url: '' });
      } catch (err) {
        setError(null);
        await win98Alert('Failed to add social link', 'Error', 'error');
        console.error(err);
      }
    }
  };

  const handleDeleteLink = async (id) => {
    try {
      await profileService.deleteSocialLink(id);
      setSocialLinks(socialLinks.filter(link => link.id !== id));
    } catch (err) {
      setError(null);
      await win98Alert('Failed to delete social link', 'Error', 'error');
      console.error(err);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await profileService.updateProfile(profile);
      await win98Alert('Profile saved successfully!', 'Success', 'info');
    } catch (err) {
      setError(null);
      await win98Alert('Failed to save profile', 'Error', 'error');
      console.error(err);
    }
  };

  return {
    handleProfileChange,
    handleGenreToggle,
    handleAddCustomGenre,
    handleNewLinkChange,
    handleAddLink,
    handleDeleteLink,
    handleSaveProfile,
  };
}
