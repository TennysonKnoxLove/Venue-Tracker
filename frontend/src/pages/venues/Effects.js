import { useEffect } from 'react';
import { venueService } from '../../api';

export function useVenueEffects({
  view,
  selectedState,
  setStates,
  setVenues,
  setLoading,
  setError,
}) {
  useEffect(() => {
    const fetchStates = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await venueService.getStates();
        setStates(result || []);
      } catch (err) {
        console.error('Error fetching states:', err);
        setError('Failed to load states. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, [setError, setLoading, setStates]);

  useEffect(() => {
    if (!selectedState || view !== 'venues') return;

    const fetchVenues = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await venueService.getVenues(selectedState.id);
        setVenues(result || []);
      } catch (err) {
        console.error('Error fetching venues:', err);
        setError(`Failed to load venues for ${selectedState.name}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, [selectedState, view, setError, setLoading, setVenues]);
}
