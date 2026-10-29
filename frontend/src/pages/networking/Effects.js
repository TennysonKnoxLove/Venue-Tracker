import { useEffect } from 'react';
import { networkingService, networkService } from '../../api';

export function useOpportunityEffects({
  id,
  setOpportunity,
  setContact,
  setLoading,
  setError,
}) {
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const opportunityData = await networkingService.getOpportunity(id);
        setOpportunity(opportunityData);

        if (opportunityData.contact) {
          try {
            const contactData = await networkService.getConnection(opportunityData.contact);
            setContact(contactData);
          } catch (contactError) {
            console.error('Error fetching contact:', contactError);
          }
        }
      } catch (err) {
        console.error('Error fetching opportunity:', err);
        setError('Failed to load opportunity details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, setOpportunity, setContact, setLoading, setError]);
}
