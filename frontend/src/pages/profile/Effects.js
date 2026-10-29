import { useEffect } from 'react';
import profileService from '../../api/profileService';

export function useProfileEffects({
  setProfile,
  setSocialLinks,
  setIsLoading,
  setError,
}) {
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await profileService.getProfile();

        // Preserve ALL fields from the API response
        setProfile({
          ...profileData,
          // Ensure these fields are at least empty strings/arrays if they're missing
          artist_name: profileData.artist_name || '',
          bio: profileData.bio || '',
          genres: profileData.genres || [],
          phone_number: profileData.phone_number || ''
        });

        const linksData = await profileService.getSocialLinks();
        setSocialLinks(linksData);
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Error loading profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [setProfile, setSocialLinks, setIsLoading, setError]);
}
